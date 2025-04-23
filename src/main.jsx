import React from 'react'
import ReactDOM from 'react-dom/client'

// ✅ Import your font here
import '@fontsource/bebas-neue'

// ✅ Global styles (should include tailwind + your font override)
import './index.css'

// ✅ Import your app
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
