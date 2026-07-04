import { useQuery } from '@tanstack/react-query'
import { getCurrentUser, mapApiUser } from '../api/auth.api'
import { CURRENT_USER_QUERY_KEY } from '../providers/QueryProvider'
import { getAccessToken, getUser } from '../services/session'
import type { User } from '../types/auth'

interface UseCurrentUserOptions {
  enabled?: boolean
}

export function useCurrentUser(options: UseCurrentUserOptions = {}) {
  const hasToken = Boolean(getAccessToken())
  const cachedUser = getUser()

  return useQuery<User | null>({
    queryKey: CURRENT_USER_QUERY_KEY,
    enabled: options.enabled ?? hasToken,
    initialData: cachedUser,
    queryFn: async () => {
      const profile = await getCurrentUser()
      return mapApiUser(profile)
    },
  })
}
