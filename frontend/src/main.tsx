import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'
import 'katex/dist/katex.min.css'

// Enable debug mode if specified
if (import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true') {
  // Load lightweight runtime debug only when explicitly enabled
  import('./utils/debug');
}

// Add global error handlers
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Add React error boundary at the root level
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

try {
  console.log('Starting React application...');
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  
  console.log('React application rendered successfully');
} catch (error) {
  console.error('Failed to render React application:', error);
  
  // Safely extract error message
  const errorMessage = error instanceof Error ? error.message : 'Neznámá chyba';
  
  // Fallback UI if React fails to render
  rootElement.innerHTML = `
    <div style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f8f9fa;
      font-family: Arial, sans-serif;
      padding: 20px;
    ">
      <div style="
        max-width: 600px;
        text-align: center;
        background: white;
        padding: 40px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      ">
        <h1 style="color: #dc3545; margin-bottom: 20px;">⚠️ Aplikace se nenačetla</h1>
        <p style="color: #6c757d; margin-bottom: 20px;">
          Došlo k chybě při načítání React aplikace. Zkuste obnovit stránku.
        </p>
        <button onclick="window.location.reload()" style="
          background-color: #4A90E2;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        ">
          Obnovit stránku
        </button>
        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px; text-align: left;">
          <strong>Technické detaily:</strong><br>
          <code style="font-size: 12px; color: #6c757d;">${errorMessage}</code>
        </div>
      </div>
    </div>
  `;
} 