import { defaultDesign } from '../../lib/store'
import type { TemplateItem, TemplatePayload } from './types'

export function templateToDesign(template?: TemplateItem | null) {
  if (!template) return defaultDesign()

  return {
    logo: template.logo ?? null,
    logoSize: template.logoSize ?? 0.4,
    frame: template.frame ?? 'none',
    frameText: template.frameText ?? 'SCAN ME',
    bodyPattern: template.bodyPattern ?? 'square',
    bodyGradient: template.bodyGradient ?? false,
    bodyColor1: template.bodyColor1 ?? '#000000',
    bodyColor2: template.bodyColor2 ?? '#000000',
    cornerStyle: template.cornerStyle ?? 0,
    cornerGradient: template.cornerGradient ?? false,
    cornerColor1: template.cornerColor1 ?? '#000000',
    cornerColor2: template.cornerColor2 ?? '#000000',
    background: template.background ?? '#FFFFFF',
  }
}

export function designToTemplate(design: ReturnType<typeof defaultDesign>): TemplatePayload {
  return {
    logo: design.logo ?? null,
    logo_size: design.logoSize ?? 0.4,
    frame_text: design.frameText ?? null,
    frame: design.frame ?? 'none',
    body_pattern: design.bodyPattern ?? 'square',
    body_gradient: design.bodyGradient ?? false,
    body_color_1: design.bodyColor1 ?? '#000000',
    body_color_2: design.bodyColor2 ?? '#000000',
    corner_style: design.cornerStyle ?? 0,
    corner_gradient: design.cornerGradient ?? false,
    corner_color_1: design.cornerColor1 ?? '#000000',
    corner_color_2: design.cornerColor2 ?? '#000000',
    background: design.background ?? '#FFFFFF',
  }
}

export function baseRecordFields(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  design: ReturnType<typeof defaultDesign>
}) {
  return {
    name: record.name,
    url: record.url ?? '',
    slug: record.slug,
    dynamic: record.dynamic,
    qr_type: record.qrType,
    folder: record.folder ?? 'Untitled',
    status: record.status !== 'Inactive',
    scans: record.scans ?? 0,
    template: designToTemplate(record.design),
  }
}

export function itemToBaseRecord<T extends {
  id: number
  typeKey: string
  type: string
  name: string
  url: string | null
  slug: string
  dynamic: boolean
  qrType: string
  folder: string | null
  status: string
  scans: number
  editedOn: string | null
  content: unknown
  template: TemplateItem
}>(item: T) {
  return {
    id: item.id,
    typeKey: item.typeKey,
    type: item.type,
    content: item.content,
    name: item.name,
    url: item.url ?? '',
    slug: item.slug,
    dynamic: item.dynamic,
    qrType: item.qrType,
    folder: item.folder ?? 'Untitled',
    status: item.status,
    scans: item.scans ?? 0,
    editedOn: item.editedOn ?? '',
    design: templateToDesign(item.template),
  }
}
