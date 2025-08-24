import pool from './connection';

async function updateApiKeyFromEnv() {
  try {
    const apiKey = process.env['OPENAI_API_KEY'];
    
    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY environment variable not set');
      process.exit(1);
    }
    
    if (apiKey === 'your-openai-api-key') {
      console.error('❌ OPENAI_API_KEY is still set to placeholder value');
      process.exit(1);
    }
    
    console.log('🔄 Updating OpenAI API key in database...');
    
    const result = await pool.query(`
      UPDATE ai_providers 
      SET api_key = $1, updated_at = NOW()
      WHERE type = 'openai' AND name = 'OpenAI GPT-5'
      RETURNING id, name, enabled
    `, [apiKey]);
    
    if (result.rowCount === 0) {
      console.error('❌ No OpenAI provider found in database');
      process.exit(1);
    }
    
    console.log('✅ OpenAI API key updated successfully');
    console.log('📋 Updated provider:', result.rows[0]);
    
    // Verify the update
    const verifyResult = await pool.query(`
      SELECT name, type, enabled, 
             CASE 
               WHEN api_key = $1 THEN 'UPDATED'
               WHEN api_key = 'your-openai-api-key-here' THEN 'NEEDS_UPDATE'
               ELSE 'CUSTOM_KEY'
             END as key_status
      FROM ai_providers 
      WHERE type = 'openai'
    `, [apiKey]);
    
    console.log('🔍 Verification result:', verifyResult.rows[0]);
    
  } catch (error) {
    console.error('❌ Failed to update API key:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('📊 Database connection closed');
  }
}

// Run if this file is executed directly
if (require.main === module) {
  updateApiKeyFromEnv()
    .then(() => {
      console.log('✅ API key update complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ API key update failed:', error);
      process.exit(1);
    });
}

export { updateApiKeyFromEnv };
