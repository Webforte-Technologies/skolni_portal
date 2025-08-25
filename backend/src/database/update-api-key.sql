-- Update OpenAI API key in the database
-- Replace 'your-actual-openai-api-key' with your real OpenAI API key

UPDATE ai_providers 
SET api_key = 'your-actual-openai-api-key'
WHERE type = 'openai' AND name = 'OpenAI GPT-5';

-- Verify the update
SELECT name, type, enabled, 
       CASE 
         WHEN api_key = 'your-openai-api-key-here' THEN 'NEEDS_UPDATE'
         WHEN api_key = 'your-actual-openai-api-key' THEN 'UPDATED'
         ELSE 'CUSTOM_KEY'
       END as key_status
FROM ai_providers 
WHERE type = 'openai';
