// Advertisement types for Forge Journal

export interface Ad {
  id: string
  title: string
  type: 'banner' | 'sidebar'
  headline: string
  subheading?: string
  image_url?: string
  image_alt?: string
  cta_text: string
  cta_link: string
  is_active: boolean
  display_order: number
  click_count: number
  created_at: string
  updated_at: string
}

export interface CreateAdData {
  title: string
  type: 'banner' | 'sidebar'
  headline: string
  subheading?: string
  image_url?: string
  image_alt?: string
  cta_text: string
  cta_link: string
  is_active?: boolean
  display_order?: number
}

export interface UpdateAdData extends Partial<CreateAdData> {
  id: string
}

export interface AdClick {
  id: string
  ad_id: string
  clicked_at: string
  user_ip?: string
  user_agent?: string
  referrer?: string
  page_url?: string
}

export interface AdClickData {
  ad_id: string
  user_ip?: string
  user_agent?: string
  referrer?: string
  page_url?: string
}

export interface AdApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: string
  }
  message?: string
}
