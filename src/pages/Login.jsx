import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useLoginModal } from '../context/LoginModalContext'

// Sign-in is a dialog now, not a destination. The route is kept so existing
// links, bookmarks and the OAuth flow's own /login references still land
// somewhere sensible: the public home page with the dialog already open.
export default function Login() {
  const { openLogin } = useLoginModal()

  useEffect(() => {
    openLogin()
  }, [openLogin])

  return <Navigate to="/" replace />
}
