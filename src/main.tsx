import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if (typeof window !== 'undefined') {
  window.addEventListener(
    'error',
    (event) => {
      const filename = event.filename || '';
      const stack = event.error instanceof Error ? event.error.stack || '' : '';
      if (
        filename.startsWith('chrome-extension://') ||
        filename.startsWith('moz-extension://') ||
        stack.includes('chrome-extension://')
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );
}

createRoot(document.getElementById('root')!).render(<App />);
