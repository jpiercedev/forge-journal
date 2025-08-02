// Admin Layout Component for Forge Journal SPA
// Provides consistent layout with sidebar navigation and main content area

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAdmin } from './AdminContext'

interface AdminUser {
  id: string
  email: string
  first_name: string
  last_name: string
  role?: {
    name: string
    description?: string
  }
}

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  currentSection?: string
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ReactNode
  section: string
  badge?: number
}

export default function AdminLayout({
  children,
  title = 'Admin Dashboard',
  description = 'Content Management System',
  currentSection = 'dashboard'
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { state, logout } = useAdmin()
  const router = useRouter()

  // Navigation items with Forge Journal branding
  const navigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      section: 'dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
        </svg>
      ),
    },
    {
      name: 'Smart Import',
      href: '/admin/smart-import',
      section: 'smart-import',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      ),
    },
    {
      name: 'Posts',
      href: '/admin/posts',
      section: 'posts',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: 'Contributors',
      href: '/admin/contributors',
      section: 'contributors',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      name: 'Ads',
      href: '/admin/ads',
      section: 'ads',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM9 3v1h6V3H9zm-2 3v13h10V6H7z" />
        </svg>
      ),
    },
    {
      name: 'Submissions',
      href: '/admin/submissions',
      section: 'submissions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      ),
    },
    {
      name: 'Admin Users',
      href: '/admin/users',
      section: 'users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ]

  const handleLogout = async () => {
    await logout()
    router.push('/admin')
  }

  return (
    <>
      <Head>
        <title>{title} - Forge Journal Admin</title>
        <meta name="description" content={description} />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-1 flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-3 shadow-sm transition-all duration-300 ease-in-out flex flex-col h-screen fixed top-0 left-0 z-30`}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-3">
            <div className={`${sidebarOpen ? 'block' : 'hidden'} transition-all duration-300`}>
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-9 font-sans">Forge Journal</h1>
                  <p className="text-xs text-gray-6 font-sans">Admin Panel</p>
                </div>
              </Link>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-gray-6 hover:text-gray-9 hover:bg-gray-2 transition-colors"
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <svg className="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = currentSection === item.section
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-7 hover:bg-gray-2 hover:text-gray-9'
                  }`}
                >
                  <span className={`${isActive ? 'text-white' : 'text-gray-6 group-hover:text-gray-9'} transition-colors`}>
                    {item.icon}
                  </span>
                  <span className={`${sidebarOpen ? 'ml-3' : 'hidden'} font-sans transition-all duration-300`}>
                    {item.name}
                  </span>
                  {item.badge && sidebarOpen && (
                    <span className="ml-auto bg-danger text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Profile Section */}
          <div className="border-t border-gray-3 p-4">
            <div className={`${sidebarOpen ? 'block' : 'hidden'} transition-all duration-300`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium font-sans">
                    {state.user?.first_name?.[0]}{state.user?.last_name?.[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-9 font-sans truncate">
                    {state.user?.first_name} {state.user?.last_name}
                  </p>
                  <p className="text-xs text-gray-6 font-sans truncate">
                    {state.user?.role?.name || 'Admin'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-7 rounded-lg hover:bg-gray-2 hover:text-gray-9 transition-colors font-sans"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
            <div className={`${sidebarOpen ? 'hidden' : 'block'} transition-all duration-300`}>
              <button
                onClick={handleLogout}
                className="w-full p-3 text-gray-7 rounded-lg hover:bg-gray-2 hover:text-gray-9 transition-colors"
                title="Logout"
              >
                <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 flex flex-col overflow-hidden ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out`}>
          {/* Top Header */}
          <header className="bg-white shadow-sm border-b border-gray-3">
            <div className="px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-9 font-sans">{title}</h1>
                  <p className="text-sm text-gray-6 font-sans mt-1">{description}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Link
                    href="/"
                    target="_blank"
                    className="inline-flex items-center px-4 py-2.5 border border-gray-3 shadow-sm text-sm font-medium rounded-lg text-gray-7 bg-white hover:bg-gray-1 hover:border-gray-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors font-sans"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Site
                  </Link>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-gray-1 font-sans">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
