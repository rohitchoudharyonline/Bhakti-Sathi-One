import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import firebaseConfig from '../firebase-applet-config.json';
import './index.css';

const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) || firebaseConfig.oAuthClientId || 'not-configured';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <GoogleOAuthProvider clientId={clientId}>
        <App />
      </GoogleOAuthProvider>
    </HelmetProvider>
  </StrictMode>,
);
