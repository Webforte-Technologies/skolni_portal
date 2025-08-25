/**
 * Simple test script to verify Phase 1 API endpoints
 * Run with: node test-phase1-endpoints.js
 */

const https = require('https');
const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:3001';
const TEST_TOKEN = 'your-admin-token-here'; // Replace with actual admin token

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test functions
async function testGetUsers() {
  console.log('Testing GET /api/admin/users...');
  try {
    const response = await makeRequest('GET', '/api/admin/users');
    console.log(`Status: ${response.status}`);
    if (response.status === 200) {
      console.log('✓ Basic users listing works');
    } else {
      console.log('✗ Basic users listing failed');
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
  }
}

async function testGetUsersWithSorting() {
  console.log('\nTesting GET /api/admin/users with sorting...');
  try {
    const response = await makeRequest('GET', '/api/admin/users?order_by=first_name&order_direction=asc');
    console.log(`Status: ${response.status}`);
    if (response.status === 200) {
      console.log('✓ Users listing with sorting works');
    } else {
      console.log('✗ Users listing with sorting failed');
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
  }
}

async function testGetUserById() {
  console.log('\nTesting GET /api/admin/users/:id...');
  try {
    // First get a user ID from the users list
    const usersResponse = await makeRequest('GET', '/api/admin/users?limit=1');
    if (usersResponse.status === 200 && usersResponse.data.data && usersResponse.data.data.length > 0) {
      const userId = usersResponse.data.data[0].id;
      const response = await makeRequest('GET', `/api/admin/users/${userId}`);
      console.log(`Status: ${response.status}`);
      if (response.status === 200) {
        console.log('✓ Individual user retrieval works');
        console.log(`  User: ${response.data.data.first_name} ${response.data.data.last_name}`);
      } else {
        console.log('✗ Individual user retrieval failed');
      }
    } else {
      console.log('✗ Could not get user ID for testing');
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
  }
}

async function testGetNonExistentUser() {
  console.log('\nTesting GET /api/admin/users/:id with non-existent ID...');
  try {
    const response = await makeRequest('GET', '/api/admin/users/00000000-0000-0000-0000-000000000000');
    console.log(`Status: ${response.status}`);
    if (response.status === 404) {
      console.log('✓ Non-existent user returns 404 as expected');
    } else {
      console.log('✗ Non-existent user did not return 404');
    }
  } catch (error) {
    console.log('✗ Error:', error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('=== Phase 1 API Endpoint Tests ===\n');
  console.log('Note: Make sure the server is running and you have a valid admin token\n');
  
  await testGetUsers();
  await testGetUsersWithSorting();
  await testGetUserById();
  await testGetNonExistentUser();
  
  console.log('\n=== Tests Complete ===');
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await makeRequest('GET', '/api/health');
    if (response.status === 200) {
      console.log('✓ Server is running');
      return true;
    } else {
      console.log('✗ Server responded with status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('✗ Server is not running or not accessible:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  } else {
    console.log('\nPlease start the server with: npm start');
    console.log('And make sure to update TEST_TOKEN in this script with a valid admin token');
  }
}

main().catch(console.error);
