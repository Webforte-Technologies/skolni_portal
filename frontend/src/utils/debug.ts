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
};

// Call debug function on module load
if (typeof window !== 'undefined') {
  // Wait a bit for config to load
  setTimeout(debugConfig, 100);
} 