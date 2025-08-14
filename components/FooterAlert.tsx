import { useEffect,useState } from 'react'
import { useMarketingSource } from 'hooks/useMarketingSource'
import { useCookieConsent } from 'hooks/useCookieConsent'
import { US_STATES } from 'lib/constants/states'

export default function FooterAlert() {
  const { source: marketingSource } = useMarketingSource()
  const { hasConsent, isLoading: cookieLoading } = useCookieConsent()
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    state: '',
    smsOptIn: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [isExistingSubscriber, setIsExistingSubscriber] = useState(false)

  useEffect(() => {
    // Don't show anything while cookie consent is still loading
    if (cookieLoading) return

    // Check if user has already dismissed the alert
    const dismissed = localStorage.getItem('forgeJournalAlertDismissed')
    if (dismissed) {
      setIsDismissed(true)
      return
    }

    // Only show the subscribe banner after user has made a cookie consent decision
    // We check both the hook state and localStorage to catch real-time changes
    const consentGiven = localStorage.getItem('forge-journal-cookie-consent')

    if (consentGiven && hasConsent !== null) {
      // User has made a cookie consent decision, show the subscribe banner
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [hasConsent, cookieLoading])

  // Additional effect to listen for storage changes (when consent is given in real-time)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'forge-journal-cookie-consent' && e.newValue === 'true') {
        // Cookie consent was just given, check if we should show the banner
        const dismissed = localStorage.getItem('forgeJournalAlertDismissed')
        if (!dismissed && !isVisible) {
          setTimeout(() => {
            setIsVisible(true)
          }, 2000)
        }
      }
    }

    // Listen for storage changes from other tabs/windows
    window.addEventListener('storage', handleStorageChange)

    // Also listen for custom events from the same tab
    const handleConsentChange = () => {
      const consentGiven = localStorage.getItem('forge-journal-cookie-consent')
      const dismissed = localStorage.getItem('forgeJournalAlertDismissed')

      if (consentGiven && !dismissed && !isVisible) {
        setTimeout(() => {
          setIsVisible(true)
        }, 2000)
      }
    }

    window.addEventListener('cookieConsentChanged', handleConsentChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('cookieConsentChanged', handleConsentChange)
    }
  }, [isVisible])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    localStorage.setItem('forgeJournalAlertDismissed', 'true')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const type = (e.target as HTMLInputElement).type
    const checked = (e.target as HTMLInputElement).checked

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          marketingSource
        })
      })

      let result
      try {
        result = await response.json()
      } catch (e) {
        console.error('Failed to parse response:', e)
        setSubmitStatus('error')
        setErrorMessage('Invalid response from server')
        return
      }

      if (response.ok) {
        setSubmitStatus('success')
        setIsExistingSubscriber(result.isExisting || false)
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          state: '',
          smsOptIn: false
        })

        // Auto-dismiss after successful submission
        setTimeout(() => {
          handleDismiss()
        }, 3000)
      } else {
        setSubmitStatus('error')
        setErrorMessage(result.error || 'Failed to submit form')
      }
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage('Network error. Please try again.')
      setIsExistingSubscriber(false)
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
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
            {submitStatus !== 'success' ? (
              <>
                {/* Content */}
                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex-shrink-0">
                    <h3 className="text-lg font-bold text-gray-900 font-sans">
                      Receive The Forge Journal free every week
                    </h3>
                    <p className="text-sm text-gray-600 font-sans">
                      Get practical insights and theological wisdom delivered to your inbox.
                    </p>
                  </div>

                  {/* Contact Form */}
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="First Name"
                        required
                        className="px-3 py-2 text-sm border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors font-sans"
                      />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Last Name"
                        required
                        className="px-3 py-2 text-sm border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors font-sans"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email Address"
                        required
                        className="px-3 py-2 text-sm border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors font-sans"
                      />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Phone (Optional)"
                        className="px-3 py-2 text-sm border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors font-sans"
                      />
                    </div>
                    <div>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors font-sans"
                      >
                        <option value="">Select your state</option>
                        {US_STATES.map((state) => (
                          <option key={state.value} value={state.value}>
                            {state.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {formData.phone && (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="popup-sms-opt-in"
                          name="smsOptIn"
                          checked={formData.smsOptIn}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 focus:ring-amber-500 focus:ring-2"
                        />
                        <label htmlFor="popup-sms-opt-in" className="text-xs text-gray-600 font-sans">
                          I consent to receive text messages from The Forge Journal
                        </label>
                      </div>
                    )}

                    {submitStatus === 'error' && (
                      <div className="text-red-600 text-sm font-sans">
                        {errorMessage}
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 text-sm font-thin uppercase tracking-wider text-white transition-colors duration-200 font-sans disabled:opacity-50"
                        style={{ backgroundColor: '#1e4356' }}
                        onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#152e3f')}
                        onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#1e4356')}
                      >
                        {isSubmitting ? 'Signing up...' : 'Sign Up'}
                      </button>
                    </div>
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
                  <h3 className="text-lg font-bold text-gray-900 font-sans">
                    {isExistingSubscriber ? 'Welcome back!' : 'Thank you for subscribing!'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isExistingSubscriber
                      ? "You're already part of The Forge Journal family and will continue receiving bold biblical leadership insights."
                      : "You'll receive The Forge Journal in your inbox every week."
                    }
                  </p>
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
