import pool from './connection';

async function addConversationsTable() {
  try {
    console.log('🗄️  Adding conversations table to database...');
    
    // SQL to create conversations and messages tables
    const sql = `
      -- Create conversations table to store individual chat sessions
      CREATE TABLE IF NOT EXISTS conversations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          assistant_type VARCHAR(50) NOT NULL DEFAULT 'math_assistant',
          title VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create index for faster queries by user_id
      CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);

      -- Create messages table to store individual messages within conversations
      CREATE TABLE IF NOT EXISTS messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
          role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
          content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for faster queries
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at ASC);

      -- Create a function to update the updated_at timestamp (if not exists)
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Create trigger to automatically update updated_at for conversations
      CREATE TRIGGER update_conversations_updated_at 
          BEFORE UPDATE ON conversations 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();

      -- Add comments for documentation
      COMMENT ON TABLE conversations IS 'Stores individual chat sessions for users';
      COMMENT ON TABLE messages IS 'Stores individual messages within conversations';
    `;
    
    // Execute the SQL
    await pool.query(sql);
    console.log('✅ Conversations and messages tables created successfully!');
    
  } catch (error) {
    console.error('❌ Failed to add conversations table:', error);
    throw error;
  } finally {
    await pool.end();
    console.log('📊 PostgreSQL connection closed');
  }
}

// Run if this file is executed directly
if (require.main === module) {
  addConversationsTable()
    .then(() => {
      console.log('✅ Database update complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database update failed:', error);
      process.exit(1);
    });
}

export { addConversationsTable }; 