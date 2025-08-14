// Post Scheduler Component
// Provides scheduling functionality for blog posts with beautiful UI

import { useState } from 'react'

interface PostSchedulerProps {
  postId: string
  currentStatus: 'draft' | 'published' | 'archived'
  scheduledPublishAt?: string
  onScheduleSuccess?: () => void
  onCancelSuccess?: () => void
  className?: string
}

export default function PostScheduler({
  postId,
  currentStatus,
  scheduledPublishAt,
  onScheduleSuccess,
  onCancelSuccess,
  className = ''
}: PostSchedulerProps) {
  const [isScheduling, setIsScheduling] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSchedulePost = async () => {
    if (!scheduleDate) {
      setError('Please select a date and time')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/content/posts/${postId}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          scheduled_at: new Date(scheduleDate).toISOString(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setIsScheduling(false)
        setScheduleDate('')
        onScheduleSuccess?.()
      } else {
        setError(data.error?.message || 'Failed to schedule post')
      }
    } catch (error) {
      console.error('Failed to schedule post:', error)
      setError('Failed to schedule post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelSchedule = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/content/posts/${postId}/schedule`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await response.json()

      if (data.success) {
        onCancelSuccess?.()
      } else {
        setError(data.error?.message || 'Failed to cancel scheduled publishing')
      }
    } catch (error) {
      console.error('Failed to cancel schedule:', error)
      setError('Failed to cancel schedule. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatScheduledDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`${className}`}>
      <label className="block text-sm font-medium text-gray-700 font-sans mb-2">
        Schedule Publishing
      </label>

      {/* Show status for non-draft posts */}
      {currentStatus !== 'draft' ? (
        <div className="text-sm text-gray-600 font-sans">
          {currentStatus === 'published'
            ? 'Post is published'
            : 'Post is archived'}
        </div>
      ) : (
        <>
          {/* Current Schedule Status */}
          {scheduledPublishAt ? (
            <div className="space-y-2">
              <div className="text-sm text-green-600 font-sans">
                Scheduled: {formatScheduledDate(scheduledPublishAt)}
              </div>
              <button
                onClick={handleCancelSchedule}
                disabled={isSubmitting}
                className="text-xs text-red-600 hover:text-red-700 font-sans"
              >
                {isSubmitting ? 'Canceling...' : 'Cancel Schedule'}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {!isScheduling ? (
                <button
                  onClick={() => setIsScheduling(true)}
                  className="text-sm text-forge-teal hover:text-forge-teal-hover font-sans"
                >
                  + Schedule Publishing
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forge-teal focus:border-forge-teal font-sans text-sm"
                  />

                  {error && (
                    <div className="text-xs text-red-600 font-sans">{error}</div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setIsScheduling(false)
                        setScheduleDate('')
                        setError('')
                      }}
                      className="text-xs text-gray-600 hover:text-gray-700 font-sans"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSchedulePost}
                      disabled={!scheduleDate || isSubmitting}
                      className="text-xs text-forge-teal hover:text-forge-teal-hover disabled:opacity-50 disabled:cursor-not-allowed font-sans"
                    >
                      {isSubmitting ? 'Scheduling...' : 'Schedule'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
