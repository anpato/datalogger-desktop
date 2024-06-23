import './tailwind.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Flowbite } from 'flowbite-react';

const container = document.getElementById('root');

const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <Flowbite>
      <App />
    </Flowbite>
  </React.StrictMode>
);
