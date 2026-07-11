import { api } from '../axios'
import type {
  ApiSuccessResponse,
  QrCreatePayloadBase,
  QrItemBase,
  QrUpdatePayloadBase,
} from './types'

export interface InvitationContent {
  id: number
  qr_id: number
  title: string
  url: string
}

export interface InvitationContentPayload {
  title: string
  url: string
}

export interface InvitationCreatePayload extends QrCreatePayloadBase {
  content: InvitationContentPayload
}

export interface InvitationUpdatePayload extends QrUpdatePayloadBase {
  content?: InvitationContentPayload
}

export interface InvitationItem extends QrItemBase {
  content: InvitationContent
}

export type InvitationDetail = InvitationItem
export type InvitationListItem = InvitationItem

export async function createInvitation(payload: InvitationCreatePayload): Promise<InvitationItem> {
  const { data } = await api.post<ApiSuccessResponse<InvitationItem>>('/invitations', payload)
  return data.data
}

export async function listInvitations(): Promise<InvitationItem[]> {
  const { data } = await api.get<ApiSuccessResponse<InvitationItem[]>>('/invitations')
  return data.data
}

export async function getInvitation(invitationId: number): Promise<InvitationDetail> {
  const { data } = await api.get<ApiSuccessResponse<InvitationDetail>>(`/invitations/${invitationId}`)
  return data.data
}

export async function updateInvitation(
  invitationId: number,
  payload: InvitationUpdatePayload,
): Promise<InvitationItem> {
  const { data } = await api.put<ApiSuccessResponse<InvitationItem>>(
    `/invitations/${invitationId}`,
    payload,
  )
  return data.data
}

export async function deleteInvitation(invitationId: number): Promise<void> {
  await api.delete(`/invitations/${invitationId}`)
}
