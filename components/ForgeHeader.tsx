import Link from 'next/link'
import { useState } from 'react'

export default function ForgeHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="text-3xl font-black text-gray-900 tracking-tight">
                THE FORGE
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-orange-500 hover:text-orange-600 px-3 py-2 text-sm font-semibold uppercase tracking-wider transition-colors duration-200"
            >
              HOME
            </Link>
            <Link
              href="/forge-pastors"
              className="text-gray-700 hover:text-orange-500 px-3 py-2 text-sm font-semibold uppercase tracking-wider transition-colors duration-200"
            >
              FORGE PASTORS
            </Link>
            <Link
              href="/topics"
              className="text-gray-700 hover:text-orange-500 px-3 py-2 text-sm font-semibold uppercase tracking-wider transition-colors duration-200"
            >
              TOPICS
            </Link>
            <Link
              href="/subscribe"
              className="text-gray-700 hover:text-orange-500 px-3 py-2 text-sm font-semibold uppercase tracking-wider transition-colors duration-200"
            >
              SUBSCRIBE
            </Link>
          </nav>

          {/* Support Button */}
          <div className="hidden md:block">
            <Link
              href="/support"
              target="_blank"
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-colors duration-200 rounded"
            >
              SUPPORT THE FORGE JOURNAL
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-gray-900 focus:outline-none focus:text-gray-900"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <Link
                href="/"
                className="text-orange-500 hover:text-orange-600 block px-3 py-2 text-sm font-semibold uppercase tracking-wider"
              >
                HOME
              </Link>
              <Link
                href="/forge-pastors"
                className="text-gray-700 hover:text-orange-500 block px-3 py-2 text-sm font-semibold uppercase tracking-wider"
              >
                FORGE PASTORS
              </Link>
              <Link
                href="/topics"
                className="text-gray-700 hover:text-orange-500 block px-3 py-2 text-sm font-semibold uppercase tracking-wider"
              >
                TOPICS
              </Link>
              <Link
                href="/subscribe"
                className="text-gray-700 hover:text-orange-500 block px-3 py-2 text-sm font-semibold uppercase tracking-wider"
              >
                SUBSCRIBE
              </Link>
              <Link
                href="/support"
                target="_blank"
                className="bg-teal-600 hover:bg-teal-700 text-white block px-3 py-2 text-sm font-semibold uppercase tracking-wider transition-colors duration-200 mt-4 rounded"
              >
                SUPPORT THE FORGE JOURNAL
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
