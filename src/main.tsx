import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept network-related unhandled promise rejections and errors in offline/sandboxed environments
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const isNetworkError = reason && (
      (reason.name === 'TypeError' && reason.message === 'Failed to fetch') ||
      String(reason).includes('Failed to fetch')
    );
    if (isNetworkError) {
      console.warn('Gracefully intercepted unhandled network promise rejection:', reason);
      event.preventDefault();
    }
  });

  window.addEventListener('error', (event) => {
    const error = event.error || event.message;
    const isNetworkError = error && (
      String(error).includes('Failed to fetch') ||
      String(event.message).includes('Failed to fetch')
    );
    if (isNetworkError) {
      console.warn('Gracefully intercepted unhandled network error:', error || event.message);
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
