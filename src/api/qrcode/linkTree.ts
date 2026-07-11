import { api } from '../axios'
import type {
  ApiSuccessResponse,
  QrCreatePayloadBase,
  QrItemBase,
  QrUpdatePayloadBase,
} from './types'

export interface LinkTreeLinkPayload {
  label: string
  url: string
  display_order?: number
}

export interface LinkTreeLinkItem {
  id: number
  link_tree_id: number
  label: string
  url: string
  displayOrder: number
}

export interface LinkTreeContent {
  id: number
  qr_id: number
  title: string
  links: LinkTreeLinkItem[]
}

export interface LinkTreeContentPayload {
  title: string
  links?: LinkTreeLinkPayload[]
}

export interface LinkTreeCreatePayload extends QrCreatePayloadBase {
  content: LinkTreeContentPayload
}

export interface LinkTreeUpdatePayload extends QrUpdatePayloadBase {
  content?: LinkTreeContentPayload
}

export interface LinkTreeItem extends QrItemBase {
  content: LinkTreeContent
}

export type LinkTreeDetail = LinkTreeItem
export type LinkTreeListItem = LinkTreeItem

export async function createLinkTree(payload: LinkTreeCreatePayload): Promise<LinkTreeItem> {
  const { data } = await api.post<ApiSuccessResponse<LinkTreeItem>>('/link-trees', payload)
  return data.data
}

export async function listLinkTrees(): Promise<LinkTreeItem[]> {
  const { data } = await api.get<ApiSuccessResponse<LinkTreeItem[]>>('/link-trees')
  return data.data
}

export async function getLinkTree(linkTreeId: number): Promise<LinkTreeDetail> {
  const { data } = await api.get<ApiSuccessResponse<LinkTreeDetail>>(`/link-trees/${linkTreeId}`)
  return data.data
}

export async function updateLinkTree(
  linkTreeId: number,
  payload: LinkTreeUpdatePayload,
): Promise<LinkTreeItem> {
  const { data } = await api.put<ApiSuccessResponse<LinkTreeItem>>(
    `/link-trees/${linkTreeId}`,
    payload,
  )
  return data.data
}

export async function deleteLinkTree(linkTreeId: number): Promise<void> {
  await api.delete(`/link-trees/${linkTreeId}`)
}
