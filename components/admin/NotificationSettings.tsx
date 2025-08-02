// Notification Settings Component for Admin Interface
import { useState, useEffect } from 'react'

interface NotificationRecipient {
  id: string
  email: string
  name: string
  notification_types: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

interface NotificationSettingsProps {
  onClose: () => void
}

export default function NotificationSettings({ onClose }: NotificationSettingsProps) {
  const [recipients, setRecipients] = useState<NotificationRecipient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingRecipient, setEditingRecipient] = useState<NotificationRecipient | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    notification_types: ['subscription', 'contact'] as string[],
    is_active: true
  })

  useEffect(() => {
    fetchRecipients()
  }, [])

  const fetchRecipients = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/notification-recipients')
      const data = await response.json()

      if (data.success) {
        setRecipients(data.data)
      } else {
        setError(data.error?.message || 'Failed to fetch recipients')
      }
    } catch (err) {
      setError('Failed to fetch recipients')
      console.error('Error fetching recipients:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const url = editingRecipient 
        ? `/api/admin/notification-recipients/${editingRecipient.id}`
        : '/api/admin/notification-recipients'
      
      const method = editingRecipient ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        await fetchRecipients()
        resetForm()
        setShowAddForm(false)
        setEditingRecipient(null)
      } else {
        setError(data.error?.message || 'Failed to save recipient')
      }
    } catch (err) {
      setError('Failed to save recipient')
      console.error('Error saving recipient:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification recipient?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/notification-recipients/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        await fetchRecipients()
      } else {
        setError(data.error?.message || 'Failed to delete recipient')
      }
    } catch (err) {
      setError('Failed to delete recipient')
      console.error('Error deleting recipient:', err)
    }
  }

  const handleEdit = (recipient: NotificationRecipient) => {
    setEditingRecipient(recipient)
    setFormData({
      email: recipient.email,
      name: recipient.name,
      notification_types: recipient.notification_types,
      is_active: recipient.is_active
    })
    setShowAddForm(true)
  }

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      notification_types: ['subscription', 'contact'],
      is_active: true
    })
    setEditingRecipient(null)
  }

  const handleCancel = () => {
    resetForm()
    setShowAddForm(false)
    setError(null)
  }

  const handleNotificationTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        notification_types: [...prev.notification_types, type]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        notification_types: prev.notification_types.filter(t => t !== type)
      }))
    }
  }



  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-3 shadow-lg z-50 overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-9 font-sans">Notification Settings</h2>
            <p className="text-sm text-gray-6 font-sans">Manage email notifications</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-2 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 font-sans text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 font-sans text-sm">Loading notification settings...</span>
          </div>
        ) : (
          <>
            {/* Add/Edit Form */}
            {showAddForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 font-sans mb-4">
              {editingRecipient ? 'Edit Recipient' : 'Add New Recipient'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-sans mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-sans mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-sans mb-2">
                  Notification Types
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.notification_types.includes('subscription')}
                      onChange={(e) => handleNotificationTypeChange('subscription', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 font-sans">Newsletter Subscriptions</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.notification_types.includes('contact')}
                      onChange={(e) => handleNotificationTypeChange('contact', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 font-sans">Contact Form Submissions</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 font-sans">Active (receives notifications)</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-sans"
                >
                  {editingRecipient ? 'Update Recipient' : 'Add Recipient'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors font-sans"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
            )}

            {/* Add Button */}
            {!showAddForm && (
              <div className="mb-6">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-sans"
                >
                  Add New Recipient
                </button>
              </div>
            )}

            {/* Recipients List */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 font-sans">Current Recipients</h3>
              {recipients.length === 0 ? (
                <p className="text-gray-500 font-sans">No notification recipients configured.</p>
              ) : (
                <div className="space-y-2">
                  {recipients.map((recipient) => (
                    <div
                      key={recipient.id}
                      className={`p-4 border rounded-lg ${recipient.is_active ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium text-gray-900 font-sans">{recipient.name}</h4>
                            {!recipient.is_active && (
                              <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded font-sans">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 font-sans">{recipient.email}</p>
                          <div className="flex gap-2 mt-1">
                            {recipient.notification_types.map((type) => (
                              <span
                                key={type}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded font-sans"
                              >
                                {type === 'subscription' ? 'Subscriptions' : 'Contact Forms'}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(recipient)}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors font-sans"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(recipient.id)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors font-sans"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
