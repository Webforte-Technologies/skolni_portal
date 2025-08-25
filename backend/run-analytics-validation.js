const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Running Analytics Validation...\n');

try {
  // Run the validation script
  const scriptPath = path.join(__dirname, 'src', 'scripts', 'validate-analytics.ts');
  execSync(`npx ts-node "${scriptPath}"`, { 
    stdio: 'inherit',
    cwd: __dirname 
  });
  
  console.log('\n✅ Analytics validation completed successfully!');
} catch (error) {
  console.error('\n❌ Analytics validation failed:', error.message);
  process.exit(1);
}
