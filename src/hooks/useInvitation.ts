import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createInvitation,
  getInvitation,
  listInvitations,
  updateInvitation,
} from '../api/qrcode/invitation'
import type { InvitationCreatePayload, InvitationUpdatePayload } from '../api/qrcode/invitation'
import { invitationToRecord } from '../api/qrcode/invitation.mappers'
import { qrsQueryKey } from './useQrs'

export const invitationQueryKey = (invitationId: number) => ['invitation', invitationId] as const
export const invitationsQueryKey = ['invitations'] as const

export function useInvitation(invitationId: number | null) {
  return useQuery({
    queryKey: invitationQueryKey(invitationId ?? 0),
    enabled: invitationId != null && Number.isFinite(invitationId) && invitationId > 0,
    queryFn: () => getInvitation(invitationId as number),
    select: invitationToRecord,
  })
}

export function useInvitationList() {
  return useQuery({
    queryKey: invitationsQueryKey,
    queryFn: listInvitations,
    select: (items) => items.map(invitationToRecord),
  })
}

export function useCreateInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: InvitationCreatePayload) => createInvitation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationsQueryKey })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}

export function useUpdateInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      invitationId,
      payload,
    }: {
      invitationId: number
      payload: InvitationUpdatePayload
    }) => updateInvitation(invitationId, payload),
    onSuccess: (_, { invitationId }) => {
      queryClient.invalidateQueries({ queryKey: invitationsQueryKey })
      queryClient.invalidateQueries({ queryKey: invitationQueryKey(invitationId) })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}
