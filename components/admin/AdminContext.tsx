// Admin Context Provider for Forge Journal SPA
// Manages global admin state, user authentication, and shared data

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/router'

// Types
interface AdminUser {
  id: string
  email: string
  first_name: string
  last_name: string
  role?: {
    id: string
    name: string
    description?: string
    permissions: string[]
  }
  is_active: boolean
  last_login_at?: string
  created_at: string
  updated_at: string
}

interface DashboardStats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalAuthors: number
  totalCategories: number
  totalUsers: number
}

interface AdminState {
  user: AdminUser | null
  isAuthenticated: boolean
  isLoading: boolean
  currentSection: string
  sidebarOpen: boolean
  stats: DashboardStats | null
  error: string | null
  lastUpdated: Date | null
}

// Action types
type AdminAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: AdminUser | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_CURRENT_SECTION'; payload: string }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'SET_STATS'; payload: DashboardStats }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_TIMESTAMP' }
  | { type: 'LOGOUT' }

// Default initial state (consistent between server and client)
const defaultInitialState: AdminState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  currentSection: 'dashboard',
  sidebarOpen: true,
  stats: null,
  error: null,
  lastUpdated: null,
}

// Global state singleton to persist across page navigations
let globalAdminState: AdminState | null = null

const getGlobalState = (): AdminState => {
  if (!globalAdminState) {
    globalAdminState = defaultInitialState
  }
  return globalAdminState
}

const initialState: AdminState = getGlobalState()

// Helper function to save auth state to localStorage
const saveAuthState = (state: AdminState) => {
  if (typeof window !== 'undefined') {
    try {
      // Only save essential auth data
      const authState = {
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastUpdated: state.lastUpdated,
        currentSection: state.currentSection,
        sidebarOpen: state.sidebarOpen
      }
      localStorage.setItem('admin_auth_state', JSON.stringify(authState))
    } catch (error) {
      console.error('Error saving auth state to localStorage:', error)
    }
  }
}

// Reducer
function adminReducer(state: AdminState, action: AdminAction): AdminState {
  let newState: AdminState

  switch (action.type) {
    case 'SET_LOADING':
      newState = { ...state, isLoading: action.payload }
      break

    case 'SET_USER':
      newState = {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        lastUpdated: new Date()
      }
      break

    case 'SET_AUTHENTICATED':
      newState = { ...state, isAuthenticated: action.payload }
      break

    case 'SET_CURRENT_SECTION':
      newState = { ...state, currentSection: action.payload }
      break

    case 'TOGGLE_SIDEBAR':
      newState = { ...state, sidebarOpen: !state.sidebarOpen }
      break

    case 'SET_SIDEBAR_OPEN':
      newState = { ...state, sidebarOpen: action.payload }
      break

    case 'SET_STATS':
      newState = { ...state, stats: action.payload, lastUpdated: new Date() }
      break

    case 'SET_ERROR':
      newState = { ...state, error: action.payload }
      break

    case 'CLEAR_ERROR':
      newState = { ...state, error: null }
      break

    case 'UPDATE_TIMESTAMP':
      newState = { ...state, lastUpdated: new Date() }
      break

    case 'LOGOUT':
      newState = {
        ...getInitialState(),
        isLoading: false,
        isAuthenticated: false,
        user: null,
        sidebarOpen: state.sidebarOpen, // Preserve sidebar state
      }
      // Clear localStorage on logout
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_auth_state')
      }
      break

    default:
      newState = state
  }

  // Save auth state to localStorage for relevant actions
  if (['SET_USER', 'SET_AUTHENTICATED', 'SET_CURRENT_SECTION', 'TOGGLE_SIDEBAR', 'SET_SIDEBAR_OPEN', 'LOGOUT'].includes(action.type)) {
    saveAuthState(newState)
  }

  // Update global state
  globalAdminState = newState

  return newState
}

// Context
interface AdminContextType {
  state: AdminState
  dispatch: React.Dispatch<AdminAction>
  
  // Helper functions
  login: (credentials: { email: string; password: string }) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  refreshStats: () => Promise<void>
  hasPermission: (permission: string) => boolean
  setCurrentSection: (section: string) => void
  clearError: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

// Provider component
interface AdminProviderProps {
  children: ReactNode
}

export function AdminProvider({ children }: AdminProviderProps) {
  const [state, dispatch] = useReducer(adminReducer, initialState)
  const router = useRouter()

  // Load saved auth state from localStorage on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedAuth = localStorage.getItem('admin_auth_state')
        if (savedAuth) {
          const parsed = JSON.parse(savedAuth)
          // Only restore if the saved state is recent (within 1 hour)
          const lastUpdated = new Date(parsed.lastUpdated)
          const now = new Date()
          const hoursDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60)

          if (hoursDiff < 1 && parsed.isAuthenticated) {
            dispatch({ type: 'SET_USER', payload: parsed.user })
            dispatch({ type: 'SET_AUTHENTICATED', payload: true })
            dispatch({ type: 'SET_CURRENT_SECTION', payload: parsed.currentSection || 'dashboard' })
            dispatch({ type: 'SET_SIDEBAR_OPEN', payload: parsed.sidebarOpen !== undefined ? parsed.sidebarOpen : true })
            dispatch({ type: 'SET_LOADING', payload: false })
            return // Don't check auth if we have valid cached state
          }
        }
      } catch (error) {
        console.error('Error loading auth state from localStorage:', error)
      }
    }

    // Check auth if no valid cached state
    checkAuth()
  }, [])

  // Update current section based on route
  useEffect(() => {
    const path = router.pathname
    if (path.includes('/admin/')) {
      const section = path.split('/admin/')[1]?.split('/')[0] || 'dashboard'
      dispatch({ type: 'SET_CURRENT_SECTION', payload: section })
    }
  }, [router.pathname])

  // Helper functions
  const login = async (credentials: { email: string; password: string }): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (data.success) {
        dispatch({ type: 'SET_USER', payload: data.data.user })
        dispatch({ type: 'SET_AUTHENTICATED', payload: true })
        return true
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.error?.message || 'Login failed' })
        return false
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error. Please try again.' })
      return false
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      dispatch({ type: 'LOGOUT' })
      router.push('/admin')
    }
  }

  const checkAuth = async (): Promise<void> => {
    try {
      const response = await fetch('/api/admin/auth/me', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          dispatch({ type: 'SET_USER', payload: data.data.user })
          dispatch({ type: 'SET_AUTHENTICATED', payload: true })
        } else {
          dispatch({ type: 'SET_AUTHENTICATED', payload: false })
        }
      } else {
        dispatch({ type: 'SET_AUTHENTICATED', payload: false })
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      dispatch({ type: 'SET_AUTHENTICATED', payload: false })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const refreshStats = async (): Promise<void> => {
    try {
      // Load posts stats
      const postsResponse = await fetch('/api/content/posts?limit=1000', {
        credentials: 'include',
      })
      const postsData = await postsResponse.json()

      // Load authors stats
      const authorsResponse = await fetch('/api/content/authors', {
        credentials: 'include',
      })
      const authorsData = await authorsResponse.json()

      // Load categories stats
      const categoriesResponse = await fetch('/api/content/categories', {
        credentials: 'include',
      })
      const categoriesData = await categoriesResponse.json()

      // Load users stats
      const usersResponse = await fetch('/api/admin/users', {
        credentials: 'include',
      })
      const usersData = await usersResponse.json()

      if (postsData.success) {
        const posts = postsData.data
        const stats: DashboardStats = {
          totalPosts: posts.length,
          publishedPosts: posts.filter((p: any) => p.status === 'published').length,
          draftPosts: posts.filter((p: any) => p.status === 'draft').length,
          totalAuthors: authorsData.success ? authorsData.data.length : 0,
          totalCategories: categoriesData.success ? categoriesData.data.length : 0,
          totalUsers: usersData.success ? usersData.data.length : 0,
        }
        dispatch({ type: 'SET_STATS', payload: stats })
      }
    } catch (error) {
      console.error('Failed to refresh stats:', error)
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!state.user?.role?.permissions) return false
    return state.user.role.permissions.includes(permission) || 
           state.user.role.permissions.includes('*') // Super admin
  }

  const setCurrentSection = (section: string): void => {
    dispatch({ type: 'SET_CURRENT_SECTION', payload: section })
  }

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const contextValue: AdminContextType = {
    state,
    dispatch,
    login,
    logout,
    checkAuth,
    refreshStats,
    hasPermission,
    setCurrentSection,
    clearError,
  }

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  )
}

// Custom hook to use admin context
export function useAdmin(): AdminContextType {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}

// HOC for protected admin routes
export function withAdminAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.ComponentType<P> {
  return function AdminAuthComponent(props: P) {
    const { state } = useAdmin()
    const router = useRouter()

    useEffect(() => {
      if (!state.isLoading && !state.isAuthenticated) {
        router.push('/admin')
      }
    }, [state.isLoading, state.isAuthenticated, router])

    // If we're authenticated (including from cache), render the component immediately
    if (state.isAuthenticated) {
      return <WrappedComponent {...props} />
    }

    // Only show loading screen if we're actually loading auth for the first time
    // (not during navigation between admin pages)
    if (state.isLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forge-teal mx-auto"></div>
            <p className="mt-4 text-gray-600 font-sans">Loading...</p>
          </div>
        </div>
      )
    }

    // Not authenticated and not loading - will redirect
    return null
  }
}
