const { spawn } = require('child_process');
const path = require('path');

console.log('🔄 Updating OpenAI API key from environment variable...');

// Check if OPENAI_API_KEY is set
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY environment variable not set');
  console.log('💡 Please set the OPENAI_API_KEY environment variable and try again');
  process.exit(1);
}

if (process.env.OPENAI_API_KEY === 'your-openai-api-key') {
  console.error('❌ OPENAI_API_KEY is still set to placeholder value');
  console.log('💡 Please set a valid OpenAI API key in the environment variable');
  process.exit(1);
}

// Run the TypeScript file
const child = spawn('npx', ['ts-node', 'src/database/update-api-key-from-env.ts'], {
  stdio: 'inherit',
  env: process.env
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('✅ API key update completed successfully');
  } else {
    console.error(`❌ API key update failed with code ${code}`);
    process.exit(code);
  }
});

child.on('error', (error) => {
  console.error('❌ Failed to run API key update script:', error);
  process.exit(1);
});
