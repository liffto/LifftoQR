import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createEmail,
  getEmail,
  listEmails,
  updateEmail,
} from '../api/qrcode/email'
import type { EmailCreatePayload, EmailUpdatePayload } from '../api/qrcode/email'
import { emailToRecord } from '../api/qrcode/email.mappers'
import { qrsQueryKey } from './useQrs'

export const emailQueryKey = (emailId: number) => ['email', emailId] as const
export const emailsQueryKey = ['emails'] as const

export function useEmail(emailId: number | null) {
  return useQuery({
    queryKey: emailQueryKey(emailId ?? 0),
    enabled: emailId != null && Number.isFinite(emailId) && emailId > 0,
    queryFn: () => getEmail(emailId as number),
    select: emailToRecord,
  })
}

export function useEmailList() {
  return useQuery({
    queryKey: emailsQueryKey,
    queryFn: listEmails,
    select: (items) => items.map(emailToRecord),
  })
}

export function useCreateEmail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: EmailCreatePayload) => createEmail(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailsQueryKey })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}

export function useUpdateEmail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      emailId,
      payload,
    }: {
      emailId: number
      payload: EmailUpdatePayload
    }) => updateEmail(emailId, payload),
    onSuccess: (_, { emailId }) => {
      queryClient.invalidateQueries({ queryKey: emailsQueryKey })
      queryClient.invalidateQueries({ queryKey: emailQueryKey(emailId) })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}
