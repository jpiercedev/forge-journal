// Admin Submissions Page for Forge Journal
import { useState, useEffect, useCallback } from 'react'
import AdminLayout from 'components/admin/AdminLayout'
import { AdminProvider, withAdminAuth } from 'components/admin/AdminContext'
import NotificationSettings from 'components/admin/NotificationSettings'

interface Subscriber {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  sms_opt_in: boolean
  virtuous_contact_id?: string
  is_existing: boolean
  source: string
  created_at: string
  updated_at: string
}

interface ContactSubmission {
  id: string
  name: string
  email: string
  message: string
  status: 'new' | 'read' | 'replied' | 'archived'
  created_at: string
  updated_at: string
}

interface SubmissionItem {
  id: string
  type: 'subscriber' | 'contact'
  title: string
  subtitle: string
  date: string
  status?: string
  data: Subscriber | ContactSubmission
}

interface Stats {
  totalSubscribers: number
  totalContactSubmissions: number
  newContactSubmissions: number
}

function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionItem | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarType, setSidebarType] = useState<'submission' | 'notifications' | null>(null)
  const [filter, setFilter] = useState<'all' | 'subscribers' | 'contacts'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'read' | 'replied' | 'archived'>('all')

  const loadSubmissions = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        type: filter,
        status: statusFilter
      })

      const response = await fetch(`/api/admin/submissions?${params}`, {
        credentials: 'include',
      })
      const data = await response.json()

      if (data.success) {
        const { subscribers, contactSubmissions, stats: statsData } = data.data

        // Combine and format submissions
        const formattedSubmissions: SubmissionItem[] = [
          ...subscribers.map((sub: Subscriber) => ({
            id: sub.id,
            type: 'subscriber' as const,
            title: `${sub.first_name} ${sub.last_name}`,
            subtitle: sub.email,
            date: sub.created_at,
            data: sub
          })),
          ...contactSubmissions.map((contact: ContactSubmission) => ({
            id: contact.id,
            type: 'contact' as const,
            title: contact.name,
            subtitle: contact.email,
            date: contact.created_at,
            status: contact.status,
            data: contact
          }))
        ]

        // Sort by date (newest first)
        formattedSubmissions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        setSubmissions(formattedSubmissions)
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error loading submissions:', error)
    } finally {
      setLoading(false)
    }
  }, [filter, statusFilter])

  useEffect(() => {
    loadSubmissions()
  }, [filter, statusFilter, loadSubmissions])

  const handleSubmissionClick = (submission: SubmissionItem) => {
    setSelectedSubmission(submission)
    setSidebarOpen(true)
    setSidebarType('submission')

    // Mark contact submissions as read when opened
    if (submission.type === 'contact' && submission.status === 'new') {
      updateSubmissionStatus(submission.id, 'read')
    }
  }

  const handleNotificationsClick = () => {
    setSelectedSubmission(null)
    setSidebarOpen(true)
    setSidebarType('notifications')
  }

  const handleCloseSidebar = () => {
    setSidebarOpen(false)
    setSidebarType(null)
    setSelectedSubmission(null)
  }

  const updateSubmissionStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/submissions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        // Reload submissions to reflect the change
        loadSubmissions()
        
        // Update selected submission if it's the one being updated
        if (selectedSubmission?.id === id) {
          setSelectedSubmission(prev => prev ? {
            ...prev,
            status,
            data: { ...prev.data, status } as any
          } : null)
        }
      }
    } catch (error) {
      console.error('Error updating submission status:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return null
    
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      read: 'bg-gray-100 text-gray-800',
      replied: 'bg-green-100 text-green-800',
      archived: 'bg-yellow-100 text-yellow-800'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getTypeIcon = (type: string) => {
    if (type === 'subscriber') {
      return (
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
        </svg>
      )
    }
    return (
      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )
  }

  return (
    <AdminLayout title="Submissions" description="Newsletter Subscribers and Contact Form Submissions" currentSection="submissions">
      <div className="flex h-full">
        {/* Main Content */}
        <div className={`flex-1 ${sidebarOpen ? 'mr-96' : ''} transition-all duration-300`}>
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-9 font-sans mb-2">Submissions</h1>
                <p className="text-gray-6 font-sans">Manage newsletter subscribers and contact form submissions</p>
              </div>
              <button
                onClick={handleNotificationsClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-sans"
              >
                Notifications
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg border border-gray-3">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-6 font-sans">Total Subscribers</p>
                    <p className="text-2xl font-bold text-gray-9 font-sans">{stats.totalSubscribers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-3">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-6 font-sans">Contact Messages</p>
                    <p className="text-2xl font-bold text-gray-9 font-sans">{stats.totalContactSubmissions}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-3">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-6 font-sans">New Messages</p>
                    <p className="text-2xl font-bold text-gray-9 font-sans">{stats.newContactSubmissions}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-3 p-4 mb-6">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-7 font-sans mb-1">Type</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="border border-gray-3 rounded-md px-3 py-2 text-sm font-sans focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="all">All Submissions</option>
                  <option value="subscribers">Subscribers Only</option>
                  <option value="contacts">Contact Messages Only</option>
                </select>
              </div>

              {(filter === 'all' || filter === 'contacts') && (
                <div>
                  <label className="block text-sm font-medium text-gray-7 font-sans mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="border border-gray-3 rounded-md px-3 py-2 text-sm font-sans focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="all">All Statuses</option>
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Submissions List */}
          <div className="bg-white rounded-lg border border-gray-3 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-3">
              <h3 className="text-lg font-semibold text-gray-9 font-sans">
                {filter === 'all' ? 'All Submissions' : 
                 filter === 'subscribers' ? 'Newsletter Subscribers' : 
                 'Contact Messages'}
              </h3>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-6 font-sans mt-2">Loading submissions...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-6 font-sans">No submissions found.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-3">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    onClick={() => handleSubmissionClick(submission)}
                    className="p-4 hover:bg-gray-1 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(submission.type)}
                        <div>
                          <h4 className="text-sm font-medium text-gray-9 font-sans">{submission.title}</h4>
                          <p className="text-sm text-gray-6 font-sans">{submission.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(submission.status)}
                        <span className="text-xs text-gray-5 font-sans">{formatDate(submission.date)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        {sidebarOpen && sidebarType === 'submission' && selectedSubmission && (
          <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-3 shadow-lg z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-9 font-sans">
                  {selectedSubmission.type === 'subscriber' ? 'Subscriber Details' : 'Contact Message'}
                </h3>
                <button
                  onClick={handleCloseSidebar}
                  className="p-2 hover:bg-gray-2 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {selectedSubmission.type === 'subscriber' ? (
                <SubscriberDetails subscriber={selectedSubmission.data as Subscriber} />
              ) : (
                <ContactDetails
                  contact={selectedSubmission.data as ContactSubmission}
                  onStatusUpdate={(status) => updateSubmissionStatus(selectedSubmission.id, status)}
                />
              )}
            </div>
          </div>
        )}

        {/* Notification Settings Sidebar */}
        {sidebarOpen && sidebarType === 'notifications' && (
          <NotificationSettings onClose={handleCloseSidebar} />
        )}
      </div>
    </AdminLayout>
  )
}

// Subscriber Details Component
function SubscriberDetails({ subscriber }: { subscriber: Subscriber }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-7 font-sans mb-2">Personal Information</h4>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-5 font-sans">Name</label>
            <p className="text-sm text-gray-9 font-sans">{subscriber.first_name} {subscriber.last_name}</p>
          </div>
          <div>
            <label className="text-xs text-gray-5 font-sans">Email</label>
            <p className="text-sm text-gray-9 font-sans">{subscriber.email}</p>
          </div>
          {subscriber.phone && (
            <div>
              <label className="text-xs text-gray-5 font-sans">Phone</label>
              <p className="text-sm text-gray-9 font-sans">{subscriber.phone}</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-7 font-sans mb-2">Preferences</h4>
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="text-xs text-gray-5 font-sans mr-2">SMS Opt-in:</span>
            <span className={`text-xs px-2 py-1 rounded-full ${subscriber.sms_opt_in ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {subscriber.sms_opt_in ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-xs text-gray-5 font-sans mr-2">Existing Contact:</span>
            <span className={`text-xs px-2 py-1 rounded-full ${subscriber.is_existing ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
              {subscriber.is_existing ? 'Yes' : 'New'}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-7 font-sans mb-2">System Information</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-5 font-sans">Source</label>
            <p className="text-sm text-gray-9 font-sans capitalize">{subscriber.source}</p>
          </div>
          {subscriber.virtuous_contact_id && (
            <div>
              <label className="text-xs text-gray-5 font-sans">Virtuous ID</label>
              <p className="text-sm text-gray-9 font-sans font-mono">{subscriber.virtuous_contact_id}</p>
            </div>
          )}
          <div>
            <label className="text-xs text-gray-5 font-sans">Subscribed</label>
            <p className="text-sm text-gray-9 font-sans">{new Date(subscriber.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Contact Details Component
function ContactDetails({ contact, onStatusUpdate }: { 
  contact: ContactSubmission
  onStatusUpdate: (status: string) => void 
}) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-7 font-sans mb-2">Contact Information</h4>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-5 font-sans">Name</label>
            <p className="text-sm text-gray-9 font-sans">{contact.name}</p>
          </div>
          <div>
            <label className="text-xs text-gray-5 font-sans">Email</label>
            <p className="text-sm text-gray-9 font-sans">{contact.email}</p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-7 font-sans mb-2">Message</h4>
        <div className="bg-gray-1 rounded-lg p-4">
          <p className="text-sm text-gray-9 font-sans whitespace-pre-wrap">{contact.message}</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-7 font-sans mb-2">Status</h4>
        <select
          value={contact.status}
          onChange={(e) => onStatusUpdate(e.target.value)}
          className="w-full border border-gray-3 rounded-md px-3 py-2 text-sm font-sans focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-7 font-sans mb-2">Timeline</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-5 font-sans">Submitted</label>
            <p className="text-sm text-gray-9 font-sans">{new Date(contact.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
          <div>
            <label className="text-xs text-gray-5 font-sans">Last Updated</label>
            <p className="text-sm text-gray-9 font-sans">{new Date(contact.updated_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-3">
        <a
          href={`mailto:${contact.email}?subject=Re: Your message to The Forge Journal`}
          className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors font-sans"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Reply via Email
        </a>
      </div>
    </div>
  )
}

const SubmissionsWithAuth = withAdminAuth(SubmissionsPage)

export default function SubmissionsPageWrapper() {
  return (
    <AdminProvider>
      <SubmissionsWithAuth />
    </AdminProvider>
  )
}
