import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'
import 'katex/dist/katex.min.css'
if (import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true') {
  // Load lightweight runtime debug only when explicitly enabled
  import('./utils/debug');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 