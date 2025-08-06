import pool from '../database/connection';
import { Message, CreateMessageRequest } from '../types/database';

export class MessageModel {
  // Create a new message
  static async create(messageData: CreateMessageRequest): Promise<Message> {
    const { conversation_id, role, content } = messageData;
    
    const query = `
      INSERT INTO messages (conversation_id, role, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const values = [conversation_id, role, content];
    const result = await pool.query(query, values);
    
    return result.rows[0];
  }

  // Find message by ID
  static async findById(id: string): Promise<Message | null> {
    const query = 'SELECT * FROM messages WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    return result.rows[0] || null;
  }

  // Get all messages for a conversation
  static async findByConversationId(conversationId: string): Promise<Message[]> {
    const query = `
      SELECT * FROM messages 
      WHERE conversation_id = $1 
      ORDER BY created_at ASC
    `;
    
    const result = await pool.query(query, [conversationId]);
    return result.rows;
  }

  // Get messages for a conversation with pagination
  static async findByConversationIdPaginated(
    conversationId: string, 
    limit = 50, 
    offset = 0
  ): Promise<Message[]> {
    const query = `
      SELECT * FROM messages 
      WHERE conversation_id = $1 
      ORDER BY created_at ASC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [conversationId, limit, offset]);
    return result.rows;
  }

  // Count messages in a conversation
  static async countByConversationId(conversationId: string): Promise<number> {
    const query = 'SELECT COUNT(*) FROM messages WHERE conversation_id = $1';
    const result = await pool.query(query, [conversationId]);
    return parseInt(result.rows[0].count);
  }

  // Delete message by ID
  static async delete(id: string): Promise<void> {
    const query = 'DELETE FROM messages WHERE id = $1';
    await pool.query(query, [id]);
  }

  // Delete all messages for a conversation
  static async deleteByConversationId(conversationId: string): Promise<void> {
    const query = 'DELETE FROM messages WHERE conversation_id = $1';
    await pool.query(query, [conversationId]);
  }

  // Get the last message in a conversation
  static async getLastByConversationId(conversationId: string): Promise<Message | null> {
    const query = `
      SELECT * FROM messages 
      WHERE conversation_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const result = await pool.query(query, [conversationId]);
    return result.rows[0] || null;
  }

  // Create multiple messages in a transaction
  static async createMultiple(messages: CreateMessageRequest[]): Promise<Message[]> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const createdMessages: Message[] = [];
      
      for (const messageData of messages) {
        const query = `
          INSERT INTO messages (conversation_id, role, content)
          VALUES ($1, $2, $3)
          RETURNING *
        `;
        
        const values = [messageData.conversation_id, messageData.role, messageData.content];
        const result = await client.query(query, values);
        createdMessages.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      return createdMessages;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
} 