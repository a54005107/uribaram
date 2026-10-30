import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';
import './layout.css';
import {installLayoutCompatibility} from './layoutCompatibility';

const disposeLayoutCompatibility = installLayoutCompatibility(document.getElementById('root'));
if (import.meta.hot) import.meta.hot.dispose(disposeLayoutCompatibility);

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
