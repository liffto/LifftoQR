export interface TemplatePayload {
  logo?: string | null
  logo_size?: number
  frame_text?: string | null
  frame?: string
  body_pattern?: string
  body_gradient?: boolean
  body_color_1?: string
  body_color_2?: string
  corner_style?: number
  corner_gradient?: boolean
  corner_color_1?: string
  corner_color_2?: string
  background?: string
}

export interface TemplateItem {
  id: number
  qr_id: number
  logo: string | null
  logoSize: number
  frame: string
  frameText: string | null
  bodyPattern: string
  bodyGradient: boolean
  bodyColor1: string
  bodyColor2: string
  cornerStyle: number
  cornerGradient: boolean
  cornerColor1: string
  cornerColor2: string
  background: string
}

export interface ApiSuccessResponse<T> {
  success: boolean
  data: T
}

export interface QrItemBase {
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
  template: TemplateItem
}

export interface QrCreatePayloadBase {
  name: string
  url?: string
  slug: string
  dynamic?: boolean
  qr_type: string
  folder?: string | null
  status?: boolean
  scans?: number
  template: TemplatePayload
}

export interface QrUpdatePayloadBase {
  name?: string
  url?: string
  slug?: string
  dynamic?: boolean
  qr_type?: string
  folder?: string | null
  status?: boolean
  scans?: number
  template?: TemplatePayload
}
