import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('🔄 main.tsx: Starting app...');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  console.log('✅ main.tsx: App rendered successfully');
} catch (error) {
  console.error('❌ main.tsx: Failed to render app:', error);
}
