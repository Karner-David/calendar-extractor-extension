import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "@fontsource/geist-sans"; 
import "@fontsource/geist-sans/500.css"; 
import "@fontsource/geist-sans/600.css"; 
import "@fontsource/geist-mono";
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
