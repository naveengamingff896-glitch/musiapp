import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

const container = document.getElementById('root');

if (container) {
  const boot = document.getElementById('boot');
  if (boot) boot.remove();

  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>
  );

  // Register the service worker so the shell can load offline on low-end Android phones.
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {
        /* Offline support is a progressive enhancement; ignore registration failures. */
      });
    });
  }
}
