import pool from '../database/connection';
import { Conversation, CreateConversationRequest, ConversationWithMessages } from '../types/database';

export class ConversationModel {
  // Create a new conversation
  static async create(conversationData: CreateConversationRequest): Promise<Conversation> {
    const { user_id, assistant_type = 'math_assistant', title } = conversationData;
    
    const query = `
      INSERT INTO conversations (user_id, assistant_type, title)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const values = [user_id, assistant_type, title];
    const result = await pool.query(query, values);
    
    return result.rows[0];
  }

  // Find conversation by ID
  static async findById(id: string): Promise<Conversation | null> {
    const query = 'SELECT * FROM conversations WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    return result.rows[0] || null;
  }

  // Find conversation with messages by ID
  static async findByIdWithMessages(id: string): Promise<ConversationWithMessages | null> {
    const conversationQuery = 'SELECT * FROM conversations WHERE id = $1';
    const messagesQuery = `
      SELECT * FROM messages 
      WHERE conversation_id = $1 
      ORDER BY created_at ASC
    `;
    
    const [conversationResult, messagesResult] = await Promise.all([
      pool.query(conversationQuery, [id]),
      pool.query(messagesQuery, [id])
    ]);
    
    if (!conversationResult.rows[0]) {
      return null;
    }
    
    return {
      ...conversationResult.rows[0],
      messages: messagesResult.rows
    };
  }

  // Get all conversations for a user
  static async findByUserId(userId: string, limit = 50, offset = 0): Promise<Conversation[]> {
    const query = `
      SELECT * FROM conversations 
      WHERE user_id = $1 
      ORDER BY updated_at DESC 
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  // Update conversation title
  static async updateTitle(id: string, title: string): Promise<Conversation> {
    const query = `
      UPDATE conversations 
      SET title = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [title, id]);
    return result.rows[0];
  }

  // Delete conversation and all its messages
  static async delete(id: string): Promise<void> {
    const query = 'DELETE FROM conversations WHERE id = $1';
    await pool.query(query, [id]);
  }

  // Count conversations for a user
  static async countByUserId(userId: string): Promise<number> {
    const query = 'SELECT COUNT(*) FROM conversations WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }

  // Get recent conversations for a user (last 10)
  static async getRecentByUserId(userId: string): Promise<Conversation[]> {
    const query = `
      SELECT * FROM conversations 
      WHERE user_id = $1 
      ORDER BY updated_at DESC 
      LIMIT 10
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
} 