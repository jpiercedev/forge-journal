// Global type declarations for tracking scripts

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'consent' | 'js',
      targetIdOrEventName: string | 'update' | Date,
      config?: {
        [key: string]: any
        analytics_storage?: 'granted' | 'denied'
        ad_storage?: 'granted' | 'denied'
        // Event parameters
        event_category?: string
        event_label?: string
        value?: number
        custom_parameters?: Record<string, any>
        marketing_source?: string
        page_title?: string
        page_location?: string
        content_group1?: string
        content_group2?: string
        content_group3?: string
      }
    ) => void

    fbq: (
      command: 'init' | 'track' | 'consent',
      id?: string | 'grant' | 'revoke',
      data?: any
    ) => void

    dataLayer: any[]
  }
}

export {}
