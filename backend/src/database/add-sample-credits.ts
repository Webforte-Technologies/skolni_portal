import pool from '../database/connection';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  school_id: string;
  role: string;
}

interface CreditTransaction {
  user_id: string;
  transaction_type: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  created_at: Date;
}

async function addSampleCredits() {
  try {
    console.log('🔄 Adding sample credit transactions...');

    // First, let's check if we have any users with school_id
    const usersResult = await pool.query(`
      SELECT id, email, first_name, last_name, school_id, role 
      FROM users 
      WHERE school_id IS NOT NULL AND role IN ('school_admin', 'teacher_school')
      ORDER BY role, created_at
    `);

    if (usersResult.rows.length === 0) {
      console.log('❌ No school users found. Please create some users first.');
      return;
    }

    console.log(`📚 Found ${usersResult.rows.length} school users:`);
    usersResult.rows.forEach((user: User) => {
      console.log(`  - ${user.first_name} ${user.last_name} (${user.role}) - School ID: ${user.school_id}`);
    });

    // Add sample credit transactions for the last 30 days
    const sampleTransactions: CreditTransaction[] = [];
    const now = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      
      // Add usage transactions for each user
      usersResult.rows.forEach((user: User) => {
        // Random credit usage between 1-5 credits per day
        const creditsUsed = Math.floor(Math.random() * 5) + 1;
        
        sampleTransactions.push({
          user_id: user.id,
          transaction_type: 'usage',
          amount: -creditsUsed, // Negative for usage
          balance_before: 100 - (i * 2), // Decreasing balance
          balance_after: 100 - (i * 2) - creditsUsed,
          description: `AI chat usage - ${creditsUsed} credits`,
          created_at: date
        });
      });
    }

    // Insert sample transactions
    for (const transaction of sampleTransactions) {
      await pool.query(`
        INSERT INTO credit_transactions (
          user_id, transaction_type, amount, balance_before, balance_after, 
          description, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        transaction.user_id,
        transaction.transaction_type,
        transaction.amount,
        transaction.balance_before,
        transaction.balance_after,
        transaction.description,
        transaction.created_at
      ]);
    }

    // Update user credit balances
    for (const user of usersResult.rows) {
      const totalUsage = sampleTransactions
        .filter(t => t.user_id === user.id)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      const newBalance = Math.max(0, 100 - totalUsage);
      
      await pool.query(`
        UPDATE users 
        SET credits_balance = $1 
        WHERE id = $2
      `, [newBalance, user.id]);
    }

    // Add some subscription data for school admins
    for (const user of usersResult.rows) {
      if (user.role === 'school_admin') {
        // Check if subscription already exists
        const existingSub = await pool.query('SELECT id FROM subscriptions WHERE user_id = $1', [user.id]);
        if (existingSub.rows.length === 0) {
          await pool.query(`
            INSERT INTO subscriptions (
              user_id, plan_type, status, credits_per_month, price_per_month, 
              start_date, end_date, auto_renew
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            user.id,
            'premium',
            'active',
            1000,
            29.99,
            new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            true
          ]);
        }
      }
    }

    console.log(`✅ Added ${sampleTransactions.length} sample credit transactions`);
    console.log('✅ Updated user credit balances');
    console.log('✅ Added sample subscription data');
    
    // Show summary
    const summaryResult = await pool.query(`
      SELECT 
        u.first_name,
        u.last_name,
        u.role,
        u.credits_balance,
        COUNT(ct.id) as transaction_count,
        COALESCE(SUM(CASE WHEN ct.transaction_type = 'usage' THEN ABS(ct.amount) ELSE 0 END), 0) as total_usage
      FROM users u
      LEFT JOIN credit_transactions ct ON u.id = ct.user_id
      WHERE u.school_id IS NOT NULL
      GROUP BY u.id, u.first_name, u.last_name, u.role, u.credits_balance
      ORDER BY u.role, u.first_name
    `);

    console.log('\n📊 Current Credit Summary:');
    summaryResult.rows.forEach((row: any) => {
      console.log(`  ${row.first_name} ${row.last_name} (${row.role}): ${row.credits_balance} credits remaining, ${row.total_usage} used`);
    });

  } catch (error) {
    console.error('❌ Error adding sample credits:', error);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  addSampleCredits();
}

export default addSampleCredits;
