import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Auth0Provider } from '@auth0/auth0-react';

createRoot(document.getElementById('root')!).render(
  <Auth0Provider 
    domain="dev-qwa2b6lkmgv4ww7e.us.auth0.com"
    clientId="fmwWzZGcVbngTEBlePBdbppwMDAK5JsR"
    authorizationParams={{
      redirect_uri: window.location.origin,
    }}
  >
    <StrictMode>
      <App />
    </StrictMode>
  </Auth0Provider>
);
