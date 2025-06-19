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
      name: 'Authors',
      href: '/admin/authors',
      section: 'authors',
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

      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-forge-teal shadow-lg transition-all duration-300 ease-in-out flex flex-col h-screen sticky top-0`}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-forge-teal-hover">
            <div className={`${sidebarOpen ? 'block' : 'hidden'} transition-all duration-300`}>
              <Link href="/" className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white font-sans">Forge Journal</h1>
              </Link>
              <p className="text-xs text-gray-300 font-sans mt-1">Admin Panel</p>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-forge-teal-hover transition-colors"
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <svg className="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"} />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = currentSection === item.section
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-forge-gold text-white'
                      : 'text-gray-300 hover:bg-forge-teal-hover hover:text-white'
                  }`}
                >
                  <span className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} transition-colors`}>
                    {item.icon}
                  </span>
                  <span className={`${sidebarOpen ? 'ml-3' : 'hidden'} font-sans transition-all duration-300`}>
                    {item.name}
                  </span>
                  {item.badge && sidebarOpen && (
                    <span className="ml-auto bg-forge-gold text-white text-xs rounded-full px-2 py-1">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Profile Section */}
          <div className="border-t border-forge-teal-hover p-4">
            <div className={`${sidebarOpen ? 'block' : 'hidden'} transition-all duration-300`}>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-forge-gold rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium font-sans">
                    {state.user?.first_name?.[0]}{state.user?.last_name?.[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white font-sans truncate">
                    {state.user?.first_name} {state.user?.last_name}
                  </p>
                  <p className="text-xs text-gray-300 font-sans truncate">
                    {state.user?.role?.name || 'Admin'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-forge-teal-hover hover:text-white transition-colors font-sans"
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
                className="w-full p-2 text-gray-300 rounded-md hover:bg-forge-teal-hover hover:text-white transition-colors"
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
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 font-sans">{title}</h1>
                  <p className="text-sm text-gray-600 font-sans mt-1">{description}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Link
                    href="/"
                    target="_blank"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forge-teal font-sans"
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
          <main className="flex-1 overflow-y-auto bg-gray-50 font-sans">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
