import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import QueryProvider from './providers/QueryProvider'
import { AuthProvider } from './context/AuthContext'
import { LoginModalProvider } from './context/LoginModalContext'
import App from './App.jsx'
import './index.css'

// GoogleOAuthProvider used to sit here, wrapping everything. It loads Google's
// gsi/client script from accounts.google.com the moment it mounts, so every
// visitor paid for the sign-in machinery — a third-party request and the
// library behind it — including the ones who only ever look at the landing
// page. It now lives inside LoginPanel, which is the only thing that needs it
// and is itself loaded on demand.
function Root() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <AuthProvider>
          <LoginModalProvider>
            <App />
          </LoginModalProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '10px',
                fontSize: '14px',
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
