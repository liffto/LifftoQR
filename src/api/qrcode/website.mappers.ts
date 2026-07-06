import { defaultDesign } from '../../lib/store'
import type { TemplateItem, WebsiteItem } from './website'

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

export function designToTemplate(design: ReturnType<typeof defaultDesign>) {
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

export function recordToWebsiteCreatePayload(record: {
  name: string
  url: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { url?: string }
  design: ReturnType<typeof defaultDesign>
}) {
  return {
    name: record.name,
    url: record.url,
    slug: record.slug,
    dynamic: record.dynamic,
    qr_type: record.qrType,
    folder: record.folder ?? 'Untitled',
    status: record.status !== 'Inactive',
    scans: record.scans ?? 0,
    content: {
      url: record.content?.url || record.url,
    },
    template: designToTemplate(record.design),
  }
}

export function recordToWebsiteUpdatePayload(record: {
  name: string
  url: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { url?: string }
  design: ReturnType<typeof defaultDesign>
}) {
  return recordToWebsiteCreatePayload(record)
}

export function websiteToRecord(website: WebsiteItem) {
  return {
    id: website.id,
    typeKey: website.typeKey,
    type: website.type,
    content: website.content,
    name: website.name,
    url: website.url ?? '',
    slug: website.slug,
    dynamic: website.dynamic,
    qrType: website.qrType,
    folder: website.folder ?? 'Untitled',
    status: website.status,
    scans: website.scans ?? 0,
    editedOn: website.editedOn ?? '',
    design: templateToDesign(website.template),
  }
}
