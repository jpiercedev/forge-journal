// Admin User Management Page

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from 'components/admin/AdminLayout'
import { AdminProvider, useAdmin, withAdminAuth } from 'components/admin/AdminContext'

interface AdminUser {
  id: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  last_login_at?: string
  created_at: string
  role?: {
    id: string
    name: string
    description?: string
  }
}

interface AdminRole {
  id: string
  name: string
  description?: string
  permissions: string[]
}

interface CreateUserForm {
  email: string
  password: string
  first_name: string
  last_name: string
  role_id: string
}

function AdminUsers() {
  const { state } = useAdmin()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [roles, setRoles] = useState<AdminRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm] = useState<CreateUserForm>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role_id: '',
  })
  const [createLoading, setCreateLoading] = useState(false)

  // Get current user from admin state
  const currentUser = state.user

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load users and roles in parallel
      const [usersResponse, rolesResponse] = await Promise.all([
        fetch('/api/admin/users', { credentials: 'include' }),
        fetch('/api/admin/roles', { credentials: 'include' }),
      ])

      const usersData = await usersResponse.json()
      const rolesData = await rolesResponse.json()

      if (usersData.success) {
        setUsers(usersData.data)
      } else {
        setError('Failed to load users')
      }

      if (rolesData.success) {
        setRoles(rolesData.data)
      } else {
        setError('Failed to load roles')
      }
    } catch (error) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(createForm),
      })

      const data = await response.json()

      if (data.success) {
        setShowCreateForm(false)
        setCreateForm({
          email: '',
          password: '',
          first_name: '',
          last_name: '',
          role_id: '',
        })
        await loadData() // Reload users list
      } else {
        setError(data.error?.message || 'Failed to create user')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await response.json()

      if (data.success) {
        await loadData() // Reload users list
      } else {
        setError(data.error?.message || 'Failed to delete user')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    }
  }

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ is_active: !isActive }),
      })

      const data = await response.json()

      if (data.success) {
        await loadData() // Reload users list
      } else {
        setError(data.error?.message || 'Failed to update user')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <AdminLayout title="Admin Users" description="Loading users..." currentSection="users">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forge-teal mx-auto"></div>
            <p className="mt-4 text-gray-600 font-sans">Loading users...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Admin Users" description="Manage admin users and permissions" currentSection="users">
      {/* Action Bar */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-serif">All Admin Users</h2>
          <p className="text-sm text-gray-600 font-sans">Manage admin users and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-forge-teal hover:bg-forge-teal-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forge-teal transition-colors font-sans"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 font-sans">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 font-serif">
            Admin Users ({users.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {users.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No users found
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900" style={{ fontFamily: 'Merriweather, serif' }}>
                        {user.first_name} {user.last_name}
                      </h4>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {user.role && (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {user.role.name}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      <p>{user.email}</p>
                      <p>
                        Created: {formatDate(user.created_at)}
                        {user.last_login_at && ` • Last login: ${formatDate(user.last_login_at)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleActive(user.id, user.is_active)}
                      className={`text-sm px-3 py-1 rounded ${
                        user.is_active
                          ? 'text-red-600 hover:text-red-900 hover:bg-red-50'
                          : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                      }`}
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    {user.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 text-sm px-3 py-1 rounded hover:bg-red-50"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4" style={{ fontFamily: 'Merriweather, serif' }}>
                Create New Admin User
              </h3>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.first_name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, first_name: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.last_name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, last_name: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={createForm.password}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Role
                  </label>
                  <select
                    required
                    value={createForm.role_id}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, role_id: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name} {role.description && `- ${role.description}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {createLoading ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

const UsersWithAuth = withAdminAuth(AdminUsers)

export default function UsersPageWrapper() {
  return (
    <AdminProvider>
      <UsersWithAuth />
    </AdminProvider>
  )
}
