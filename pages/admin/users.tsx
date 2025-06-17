// Admin User Management Page

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

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

export default function AdminUsers() {
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
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      // Check authentication
      const authResponse = await fetch('/api/admin/auth/me', {
        credentials: 'include',
      })

      if (!authResponse.ok) {
        router.push('/admin')
        return
      }

      const authData = await authResponse.json()
      if (!authData.success) {
        router.push('/admin')
        return
      }

      setCurrentUser(authData.data.user)
      await loadData()
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/admin')
    }
  }

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Admin Users - Forge Journal</title>
        <meta name="description" content="Manage admin users for Forge Journal" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Merriweather, serif' }}>
                  Admin Users
                </h1>
                <p className="text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Manage admin users and permissions
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Add User
                </button>
                <Link
                  href="/admin/dashboard"
                  className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Users List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900" style={{ fontFamily: 'Merriweather, serif' }}>
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
        </main>

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
      </div>
    </>
  )
}
