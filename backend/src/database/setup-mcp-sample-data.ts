import { Pool } from 'pg';
import { config } from 'dotenv';

// Load environment variables
config();

const pool = new Pool({
  connectionString: process.env['DATABASE_URL'],
});

async function setupMCPSampleData() {
  console.log('🚀 Setting up MCP sample data...');
  
  try {
    // Insert sample AI provider if not exists
    const providerResult = await pool.query(`
      INSERT INTO ai_providers (name, type, api_key, models, rate_limits, priority, enabled) 
      VALUES (
        'OpenAI',
        'openai',
        'sk-test-key',
        '["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4"]',
        '{"requests_per_minute": 60, "tokens_per_minute": 150000}',
        1,
        true
      ) ON CONFLICT (name) DO NOTHING RETURNING id
    `);
    
    let providerId = providerResult.rows[0]?.id;
    if (!providerId) {
      // Get existing provider
      const existingProvider = await pool.query('SELECT id FROM ai_providers WHERE name = $1', ['OpenAI']);
      if (existingProvider.rows.length > 0) {
        providerId = existingProvider.rows[0].id;
      } else {
        throw new Error('Failed to create or find AI provider');
      }
    }
    
    console.log('✅ AI provider setup complete');
    
    // Get first user for sample data
    const userResult = await pool.query('SELECT id FROM users LIMIT 1');
    if (userResult.rows.length === 0) {
      throw new Error('No users found in database');
    }
    const userId = userResult.rows[0].id;
    
    console.log('✅ Found user for sample data');
    
    // Clear existing sample data
    await pool.query('DELETE FROM ai_requests WHERE user_id = $1', [userId]);
    
    // Insert sample AI requests for the last 30 days
    console.log('📊 Inserting sample AI requests...');
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Insert various types of requests
      await pool.query(`
        INSERT INTO ai_requests (
          user_id, request_type, provider_id, model_used, priority, parameters,
          tokens_used, processing_time_ms, cost, success, cached, created_at
        ) VALUES 
        ($1, 'chat', $2, 'gpt-4o-mini', 'normal', '{"message": "Sample chat message"}', 150, 1200, 0.003, true, false, $3),
        ($1, 'generation', $2, 'gpt-4-turbo', 'normal', '{"material_type": "worksheet", "topic": "Pythagorova věta"}', 300, 2500, 0.006, true, true, $3),
        ($1, 'generation', $2, 'gpt-4o', 'normal', '{"material_type": "lesson_plan", "subject": "Matematika"}', 500, 3500, 0.012, true, false, $3),
        ($1, 'generation', $2, 'gpt-4-turbo', 'normal', '{"material_type": "quiz", "topic": "Algebra"}', 400, 2800, 0.008, true, false, $3),
        ($1, 'chat', $2, 'gpt-4o-mini', 'normal', '{"message": "Quick question about math"}', 80, 800, 0.001, true, true, $3),
        ($1, 'generation', $2, 'gpt-4o', 'high', '{"material_type": "worksheet", "topic": "Geometrie"}', 600, 4000, 0.015, false, false, $3)
      `, [userId, providerId, date]);
    }
    
    console.log('✅ Sample AI requests inserted');
    
    // Insert some recent material generation requests (last 7 days)
    console.log('📝 Inserting recent material generation requests...');
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // More detailed material generation requests
      await pool.query(`
        INSERT INTO ai_requests (
          user_id, request_type, provider_id, model_used, priority, parameters,
          tokens_used, processing_time_ms, cost, success, cached, created_at
        ) VALUES 
        ($1, 'generation', $2, 'gpt-4o', 'normal', '{"material_type": "worksheet", "topic": "Pythagorova věta", "question_count": 10, "difficulty": "střední"}', 450, 3200, 0.009, true, false, $3),
        ($1, 'generation', $2, 'gpt-4-turbo', 'normal', '{"material_type": "lesson_plan", "title": "Úvod do algebry", "subject": "Matematika", "grade_level": "8. třída"}', 600, 4200, 0.014, true, true, $3),
        ($1, 'generation', $2, 'gpt-4o-mini', 'normal', '{"material_type": "quiz", "topic": "Fyzika - Mechanika", "question_count": 15, "time_limit": "20 minut"}', 380, 2800, 0.007, true, false, $3)
      `, [userId, providerId, date]);
    }
    
    console.log('✅ Recent material generation requests inserted');
    
    // Show summary
    const summary = await pool.query(`
      SELECT 
        request_type,
        COUNT(*) as count,
        AVG(processing_time_ms) as avg_time,
        SUM(cost) as total_cost,
        AVG(CASE WHEN success THEN 1 ELSE 0 END) * 100 as success_rate
      FROM ai_requests 
      WHERE user_id = $1
      GROUP BY request_type
      ORDER BY count DESC
    `, [userId]);
    
    console.log('\n📊 Sample Data Summary:');
    console.table(summary.rows);
    
    // Show material generation specific stats
    const materialStats = await pool.query(`
      SELECT 
        parameters->>'material_type' as material_type,
        COUNT(*) as count,
        AVG(processing_time_ms) as avg_time,
        SUM(cost) as total_cost
      FROM ai_requests 
      WHERE request_type = 'generation' 
        AND user_id = $1
      GROUP BY parameters->>'material_type'
      ORDER BY count DESC
    `, [userId]);
    
    console.log('\n📝 Material Generation Stats:');
    console.table(materialStats.rows);
    
    console.log('\n🎉 MCP sample data setup completed successfully!');
    console.log('💡 You can now test the MCP analytics endpoints:');
    console.log('   - GET /api/admin/analytics/mcp/overview');
    console.log('   - GET /api/admin/analytics/mcp/models');
    console.log('   - GET /api/admin/analytics/mcp/providers');
    
  } catch (error) {
    console.error('❌ Error setting up MCP sample data:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the setup
setupMCPSampleData().catch(console.error);
