import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Toaster } from 'react-hot-toast'
import QueryProvider from './providers/QueryProvider'
import { AuthProvider } from './context/AuthContext'
import { LoginModalProvider } from './context/LoginModalContext'
import App from './App.jsx'
import './index.css'

const googleClientId = import.meta.env.VITE_CLIENT_ID

function Root() {
  if (!googleClientId) {
    console.warn('VITE_CLIENT_ID is missing — Google sign-in will not work.')
  }

  return (
    <QueryProvider>
      <GoogleOAuthProvider clientId={googleClientId || ''}>
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
      </GoogleOAuthProvider>
    </QueryProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
