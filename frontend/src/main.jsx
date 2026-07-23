import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Telegram Web App SDK ulash
import WebAppModule from '@twa-dev/sdk'
const WebApp = WebAppModule?.default || WebAppModule

if (WebApp && typeof WebApp.ready === 'function') {
  WebApp.ready()
}
if (WebApp && typeof WebApp.expand === 'function') {
  WebApp.expand()
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
