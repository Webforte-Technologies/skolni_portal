import pool from '../database/connection';
import { CreditTransaction } from '../types/database';
import { UserModel } from './User';

export class CreditTransactionModel {
  // Create a new credit transaction
  static async create(transactionData: Omit<CreditTransaction, 'id' | 'created_at'>): Promise<CreditTransaction> {
    const {
      user_id,
      transaction_type,
      amount,
      balance_before,
      balance_after,
      description,
      related_subscription_id
    } = transactionData;

    const query = `
      INSERT INTO credit_transactions (
        user_id, transaction_type, amount, balance_before, 
        balance_after, description, related_subscription_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      user_id,
      transaction_type,
      amount,
      balance_before,
      balance_after,
      description,
      related_subscription_id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Deduct credits from user (with transaction logging)
  static async deductCredits(userId: string, amount: number, description?: string): Promise<CreditTransaction> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get current user balance
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      if (user.credits_balance < amount) {
        throw new Error('Insufficient credits');
      }
      
      const newBalance = user.credits_balance - amount;
      
      // Update user credits
      await UserModel.updateCredits(userId, newBalance);
      
      // Create transaction record
      const transaction = await this.create({
        user_id: userId,
        transaction_type: 'usage',
        amount: -amount,
        balance_before: user.credits_balance,
        balance_after: newBalance,
        description: description || 'Credit usage for AI assistant'
      });
      
      await client.query('COMMIT');
      return transaction;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Add credits to user (with transaction logging)
  static async addCredits(userId: string, amount: number, description?: string, subscriptionId?: string): Promise<CreditTransaction> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get current user balance
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const newBalance = user.credits_balance + amount;
      
      // Update user credits
      await UserModel.updateCredits(userId, newBalance);
      
      // Create transaction record
      const transactionData: Omit<CreditTransaction, 'id' | 'created_at'> = {
        user_id: userId,
        transaction_type: 'purchase',
        amount: amount,
        balance_before: user.credits_balance,
        balance_after: newBalance,
        description: description || 'Credit purchase'
      };
      
      if (subscriptionId) {
        transactionData.related_subscription_id = subscriptionId;
      }
      
      const transaction = await this.create(transactionData);
      
      await client.query('COMMIT');
      return transaction;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get user's transaction history
  static async getUserTransactions(userId: string, limit = 50, offset = 0): Promise<CreditTransaction[]> {
    const query = `
      SELECT * FROM credit_transactions 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  // Get transaction by ID
  static async findById(id: string): Promise<CreditTransaction | null> {
    const query = 'SELECT * FROM credit_transactions WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    return result.rows[0] || null;
  }

  // Get total credits used by user
  static async getTotalCreditsUsed(userId: string): Promise<number> {
    const query = `
      SELECT COALESCE(SUM(ABS(amount)), 0) as total_used
      FROM credit_transactions 
      WHERE user_id = $1 AND transaction_type = 'usage'
    `;
    
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].total_used);
  }

  // Get total credits purchased by user
  static async getTotalCreditsPurchased(userId: string): Promise<number> {
    const query = `
      SELECT COALESCE(SUM(amount), 0) as total_purchased
      FROM credit_transactions 
      WHERE user_id = $1 AND transaction_type = 'purchase'
    `;
    
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].total_purchased);
  }

  // Count user transactions
  static async countUserTransactions(userId: string): Promise<number> {
    const query = 'SELECT COUNT(*) FROM credit_transactions WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }

  // Get user statistics
  static async getUserStats(userId: string): Promise<{
    total_credits_used: number;
    recent_credits_used: number;
    monthly_usage: any[];
  }> {
    const totalUsed = await this.getTotalCreditsUsed(userId);
    
    // Get recent usage (last 30 days)
    const recentQuery = `
      SELECT COALESCE(SUM(ABS(amount)), 0) as recent_used
      FROM credit_transactions 
      WHERE user_id = $1 
        AND transaction_type = 'usage' 
        AND created_at >= NOW() - INTERVAL '30 days'
    `;
    const recentResult = await pool.query(recentQuery, [userId]);
    const recentUsed = parseInt(recentResult.rows[0].recent_used);
    
    // Get monthly usage for the last 6 months
    const monthlyQuery = `
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COALESCE(SUM(ABS(amount)), 0) as credits_used
      FROM credit_transactions 
      WHERE user_id = $1 
        AND transaction_type = 'usage' 
        AND created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `;
    const monthlyResult = await pool.query(monthlyQuery, [userId]);
    
    return {
      total_credits_used: totalUsed,
      recent_credits_used: recentUsed,
      monthly_usage: monthlyResult.rows
    };
  }
} 