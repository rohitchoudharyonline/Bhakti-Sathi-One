import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx';
import './index.css';
import { loadAuthoritativeServerContent, installContentSyncBridge } from './services/contentSyncService';

const mountApp = () => {
  const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim()
    || '969580668423-u2tnqu48ng8qjgjm4dhb45aaaj5b7mtu.apps.googleusercontent.com';

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <HelmetProvider>
        <GoogleOAuthProvider clientId={clientId}>
          <App />
        </GoogleOAuthProvider>
      </HelmetProvider>
    </StrictMode>,
  );
};

// Install synchronization bridge and load authoritative content from D1 before mounting
installContentSyncBridge();
void loadAuthoritativeServerContent().finally(mountApp);

