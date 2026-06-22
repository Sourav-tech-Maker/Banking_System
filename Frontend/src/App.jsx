import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './Components/Navbar'
import Landing from './pages/Landing'


const App = () => {
  return (
    // BrowserRouter enables URL-based routing
    // Without this, clicking a Link or using navigate() won't work
    <BrowserRouter>

      {/* Toaster shows toast notifications anywhere in the app */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
            fontSize: '14px',
          },
        }}
      />
      <Navbar />

      <Routes>
        <Route path="/" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
