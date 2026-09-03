import { api } from '../axios'
import { templateToDesign, designToTemplate } from './mappers.shared'
import type { TemplateItem } from './types'
import { defaultDesign } from '../../lib/store'

/**
 * Saved design templates, stored against the account.
 *
 * These lived in localStorage, which made them per-browser: a look saved on a
 * laptop did not exist on a phone, and clearing site data took them all with no
 * warning and no copy anywhere.
 *
 * The server speaks the same snake_case design shape the per-QR template does,
 * so the existing mappers translate in both directions and nothing new has to
 * learn what a design looks like.
 */

export interface UserTemplate {
  id: number
  label: string
  design: ReturnType<typeof defaultDesign>
}

type ApiUserTemplate = TemplateItem & { id: number; label: string }

const toTemplate = (item: ApiUserTemplate): UserTemplate => ({
  id: item.id,
  label: item.label,
  design: templateToDesign(item),
})

export async function listUserTemplates(): Promise<UserTemplate[]> {
  const { data } = await api.get<ApiUserTemplate[]>('/templates')
  return (data ?? []).map(toTemplate)
}

export async function saveUserTemplate(
  label: string,
  design: ReturnType<typeof defaultDesign>,
): Promise<UserTemplate> {
  const { data } = await api.put<ApiUserTemplate>('/templates', {
    label,
    ...designToTemplate(design),
  })
  return toTemplate(data)
}

export async function deleteUserTemplate(id: number): Promise<void> {
  await api.delete(`/templates/${id}`)
}
