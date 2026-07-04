import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { googleLogin as googleLoginRequest, getCurrentUser, mapApiUser } from '../api/auth.api'
import { useAuth } from '../context/AuthContext'
import { CURRENT_USER_QUERY_KEY } from '../providers/QueryProvider'
import { saveTokens } from '../services/session'
import { getApiErrorMessage } from '../utils/errors'

export function useGoogleLogin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { login } = useAuth()

  return useMutation({
    mutationFn: async (idToken: string) => {
      const tokens = await googleLoginRequest(idToken)
      saveTokens(tokens.access_token, tokens.refresh_token)

      const profile = await getCurrentUser()
      const user = mapApiUser(profile)

      login({
        user,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      })

      return user
    },
    onSuccess: (user) => {
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, user)
      toast.success('Signed in successfully')
      navigate('/dashboard', { replace: true })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Google sign-in failed. Please try again.'))
    },
  })
}
