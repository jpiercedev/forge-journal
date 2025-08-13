// Global type declarations for tracking scripts

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'consent',
      targetId: string | 'update',
      config?: {
        [key: string]: any
        analytics_storage?: 'granted' | 'denied'
        ad_storage?: 'granted' | 'denied'
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
