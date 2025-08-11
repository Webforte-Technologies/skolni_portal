-- Phase 08: Conversation History & Generated Files (ordered early)
-- Ensure UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create conversations table to store individual chat sessions
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at ASC);

-- Create generated_files table to store worksheets and other generated materials
CREATE TABLE IF NOT EXISTS generated_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content JSONB NOT NULL,
    file_type VARCHAR(50) NOT NULL DEFAULT 'worksheet',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_generated_files_user_id ON generated_files(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_files_created_at ON generated_files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_files_file_type ON generated_files(file_type);

-- Comments
COMMENT ON TABLE conversations IS 'Stores individual chat sessions for users';
COMMENT ON TABLE messages IS 'Stores individual messages within conversations';
COMMENT ON TABLE generated_files IS 'Stores generated worksheets and other materials in JSON format';

-- Trigger to automatically update updated_at for conversations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_conversations_updated_at'
  ) THEN
    CREATE TRIGGER update_conversations_updated_at 
      BEFORE UPDATE ON conversations 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;


