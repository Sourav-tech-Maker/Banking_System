import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { TooltipProvider } from "@/components/ui/tooltip";
import './index.css'
import App from './App.jsx'

// Silence THREE.Clock deprecation and Font parsing warnings from libraries
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0] && typeof args[0] === 'string') {
    const msg = args[0];
    if (
      msg.includes('THREE.Clock: This module has been deprecated') ||
      msg.includes('unsupported GSUB table') ||
      msg.includes('unsupported GPOS table')
    ) {
      return;
    }
  }
  originalWarn.apply(console, args);
};

const originalLog = console.log;
console.log = (...args) => {
  if (args[0] && typeof args[0] === 'string') {
    const msg = args[0];
    if (msg.includes('unsupported GSUB table') || msg.includes('unsupported GPOS table')) {
      return;
    }
  }
  originalLog.apply(console, args);
};

const originalError = console.error;
console.error = (...args) => {
  if (args[0] && typeof args[0] === 'string') {
    const msg = args[0];
    if (msg.includes('unsupported GSUB table') || msg.includes('unsupported GPOS table')) {
      return;
    }
  }
  originalError.apply(console, args);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
     <TooltipProvider>
        <App />
      </TooltipProvider>
    </BrowserRouter>
  </StrictMode>,
)
