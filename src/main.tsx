import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupDatabase } from './utils/db-init';
import { setupFetchInterceptor } from './middleware/apiMiddleware'; 

// Set up fetch interceptor for API requests
setupFetchInterceptor();

// Try to set up the database
setupDatabase().catch(console.error);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);