import { useState, useEffect } from 'react'
import { useMarketingSource } from 'hooks/useMarketingSource'
import { US_STATES } from 'lib/constants/states'
import { trackFormStart, trackFormSubmit, trackNewsletterSignup } from 'lib/utils/analytics'

interface SubscribeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SubscribeModal({ isOpen, onClose }: SubscribeModalProps) {
  const { source: marketingSource } = useMarketingSource()
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
  const [isClosing, setIsClosing] = useState(false)
  const [hasTrackedFormStart, setHasTrackedFormStart] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const type = (e.target as HTMLInputElement).type
    const checked = (e.target as HTMLInputElement).checked

    // Track form start on first interaction
    if (!hasTrackedFormStart) {
      trackFormStart('newsletter_signup', 'subscribe_modal')
      setHasTrackedFormStart(true)
    }

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

        // Track successful form submission
        trackFormSubmit('newsletter_signup', true, undefined, marketingSource)

        // Track newsletter signup with marketing attribution
        trackNewsletterSignup('subscribe_modal', result.isExisting || false, marketingSource)

        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          state: '',
          smsOptIn: false
        })
      } else {
        setSubmitStatus('error')
        setErrorMessage(result.error || 'Failed to submit form')

        // Track failed form submission
        trackFormSubmit('newsletter_signup', false, result.error || 'Failed to submit form', marketingSource)
      }
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage('Network error. Please try again.')
      setIsExistingSubscriber(false)
      console.error('Form submission error:', error)

      // Track network error
      trackFormSubmit('newsletter_signup', false, 'Network error', marketingSource)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        state: '',
        smsOptIn: false
      })
      setSubmitStatus('idle')
      setErrorMessage('')
      setIsExistingSubscriber(false)
      setIsClosing(false)
      onClose()
    }, 200) // Match animation duration
  }

  // Reset closing state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false)
    }
  }, [isOpen])

  if (!isOpen && !isClosing) return null

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto transition-opacity duration-200"
      style={{
        opacity: isClosing ? 0 : 1,
      }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 transition-opacity duration-200"
        style={{
          backgroundColor: '#111827c9',
          opacity: isClosing ? 0 : 1,
        }}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white shadow-xl max-w-md w-full mx-auto transition-all duration-200"
          style={{
            transform: isClosing ? 'scale(0.95) translateY(16px)' : 'scale(1) translateY(0)',
            opacity: isClosing ? 0 : 1,
          }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Modal content */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 font-sans">
              Subscribe to The Forge Journal
            </h2>
            <p className="text-gray-600 mb-6 font-sans">
              Stay connected with the latest articles, insights, and resources from The Forge Journal.
            </p>

            {submitStatus !== 'success' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="modal-firstName" className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="modal-firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors font-sans"
                      placeholder="First Name"
                    />
                  </div>
                  <div>
                    <label htmlFor="modal-lastName" className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="modal-lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors font-sans"
                      placeholder="Last Name"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="modal-email" className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="modal-email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors font-sans"
                    placeholder="Enter your email address"
                  />
                </div>
                <div>
                  <label htmlFor="modal-state" className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                    State
                  </label>
                  <select
                    id="modal-state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors font-sans"
                  >
                    <option value="">Select your state</option>
                    {US_STATES.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="modal-phone" className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="modal-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors font-sans"
                    placeholder="Phone number (optional)"
                  />
                </div>

                {formData.phone && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="modal-sms-opt-in"
                      name="smsOptIn"
                      checked={formData.smsOptIn}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 focus:ring-amber-500 focus:ring-2"
                    />
                    <label htmlFor="modal-sms-opt-in" className="text-sm text-gray-600 font-sans">
                      I consent to receive text messages from The Forge Journal
                    </label>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="text-red-600 text-sm font-sans">
                    {errorMessage}
                  </div>
                )}

                <p className="text-xs text-gray-500 text-center mb-4 font-sans">
                  By signing up, you agree to receive emails from FORGE and other Grace Ministries. Unsubscribe anytime.
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-white px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-colors duration-200 font-sans disabled:opacity-50"
                  style={{ backgroundColor: '#1e4356' }}
                  onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#152e3f')}
                  onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#1e4356')}
                >
                  {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#be9d58' }}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 font-sans">
                  {isExistingSubscriber ? 'Welcome back!' : 'Thank you for subscribing!'}
                </h3>
                <p className="text-gray-600 mb-4 font-sans">
                  {isExistingSubscriber
                    ? "You're already part of The Forge Journal family and will continue receiving bold biblical leadership insights and updates from the movement."
                    : "You'll receive our latest articles and insights directly in your inbox."
                  }
                </p>
                <button
                  onClick={handleClose}
                  className="text-sm font-medium uppercase tracking-wider transition-colors duration-200 font-sans"
                  style={{ color: '#1e4356' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#152e3f'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#1e4356'}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
