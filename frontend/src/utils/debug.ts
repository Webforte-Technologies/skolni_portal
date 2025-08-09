// Debug utility for environment variables and API configuration
export const debugConfig = () => {
  console.log('=== Environment Debug Info ===');
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('window.ENV_API_URL:', (window as any).ENV_API_URL);
  console.log('window.APP_CONFIG:', (window as any).APP_CONFIG);
  console.log('window.APP_CONFIG?.API_URL:', (window as any).APP_CONFIG?.API_URL);
  console.log('Current location:', window.location.href);
  console.log('Expected backend URL:', import.meta.env.VITE_API_URL || 'http://localhost:3001/api');
  console.log('=============================');
  
  // Test backend connectivity
  const backendUrl = import.meta.env.VITE_API_URL || 'http://ak8gggwkc84o04o4wcwc4gc4.82.29.179.61.sslip.io/api';
  fetch(`${backendUrl.replace('/api', '')}/api/health`)
    .then(response => response.json())
    .then(data => {
      console.log('✅ Backend health check successful:', data);
    })
    .catch(error => {
      console.error('❌ Backend health check failed:', error);
    });
};

// Call debug function on module load
if (typeof window !== 'undefined') {
  // Wait a bit for config to load
  setTimeout(debugConfig, 100);
} 