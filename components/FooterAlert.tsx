import { useState, useEffect } from 'react'

export default function FooterAlert() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    // Check if user has already dismissed the alert
    const dismissed = localStorage.getItem('forgeJournalAlertDismissed')
    if (dismissed) {
      setIsDismissed(true)
      return
    }

    // Show alert after 3 seconds delay
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    localStorage.setItem('forgeJournalAlertDismissed', 'true')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Auto-dismiss after successful submission
    setTimeout(() => {
      handleDismiss()
    }, 3000)
  }

  if (isDismissed) return null

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-500 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="bg-white border-t-2 shadow-lg" style={{ borderColor: '#be9d58' }}>
        <div className="w-[90%] mx-auto py-4">
          <div className="flex items-center justify-between">
            {!isSubmitted ? (
              <>
                {/* Content */}
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-shrink-0">
                    <h3 className="text-lg font-bold text-gray-900 font-sans">
                      Receive The Forge Journal free every week
                    </h3>
                    <p className="text-sm text-gray-600">
                      Get practical insights and theological wisdom delivered to your inbox.
                    </p>
                  </div>
                  
                  {/* Email Form */}
                  <form onSubmit={handleSubmit} className="flex gap-2 min-w-0 flex-1 max-w-md">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-thin uppercase tracking-wider text-white transition-colors duration-200 font-sans disabled:opacity-50"
                      style={{ backgroundColor: '#1e4356' }}
                      onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#152e3f')}
                      onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#1e4356')}
                    >
                      {isSubmitting ? 'Signing up...' : 'Sign Up'}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: '#be9d58' }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 font-sans">Thank you for subscribing!</h3>
                  <p className="text-sm text-gray-600">You'll receive The Forge Journal in your inbox every week.</p>
                </div>
              </div>
            )}

            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Dismiss alert"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
