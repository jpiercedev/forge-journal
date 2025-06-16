import { useState } from 'react'

interface SubscribeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SubscribeModal({ isOpen, onClose }: SubscribeModalProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const handleClose = () => {
    setEmail('')
    setIsSubmitted(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white shadow-xl max-w-md w-full mx-auto">
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
            <p className="text-gray-600 mb-6">
              Stay connected with the latest articles, insights, and resources from The Forge Journal.
            </p>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="modal-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="modal-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    placeholder="Enter your email address"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-white px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-colors duration-200 font-sans disabled:opacity-50"
                  style={{ backgroundColor: '#2D5A5A' }}
                  onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#1F4444')}
                  onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#2D5A5A')}
                >
                  {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#D4A574' }}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank you for subscribing!</h3>
                <p className="text-gray-600 mb-4">
                  You'll receive our latest articles and insights directly in your inbox.
                </p>
                <button
                  onClick={handleClose}
                  className="text-sm font-medium uppercase tracking-wider transition-colors duration-200"
                  style={{ color: '#2D5A5A' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#1F4444'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#2D5A5A'}
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
