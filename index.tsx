
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { seedInitialData } from './db';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element");

const root = ReactDOM.createRoot(rootElement);

// Initialize DB and render
seedInitialData().then(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
