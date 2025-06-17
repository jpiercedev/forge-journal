import Link from 'next/link'
import { useState } from 'react'

import SubscribeModal from './SubscribeModal'

export default function ForgeHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200" style={{ borderBottomWidth: '7px', borderBottomColor: '#1e4356' }}>
      <div className="w-[90%] mx-auto max-w-[1280px]">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="text-3xl font-black text-gray-900 tracking-tight font-sans">
                FORGE JOURNAL
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-amber-600 hover:text-amber-700 px-3 py-2 text-sm font-bold uppercase tracking-wider transition-colors duration-200 font-sans"
              style={{ color: '#be9d58' }}
            >
              HOME
            </Link>
            <Link
              href="/about"
              className="text-gray-700 px-3 py-2 text-sm font-bold uppercase tracking-wider transition-colors duration-200 font-sans"
              style={{ color: 'inherit' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#be9d58'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
            >
              ABOUT
            </Link>
            <Link
              href="/topics"
              className="text-gray-700 px-3 py-2 text-sm font-bold uppercase tracking-wider transition-colors duration-200 font-sans"
              style={{ color: 'inherit' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#be9d58'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
            >
              TOPICS
            </Link>
            <button
              onClick={() => setIsSubscribeModalOpen(true)}
              className="text-gray-700 px-3 py-2 text-sm font-bold uppercase tracking-wider transition-colors duration-200 font-sans"
              style={{ color: 'inherit' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#be9d58'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
            >
              SUBSCRIBE
            </button>
          </nav>

          {/* Support Button */}
          <div className="hidden md:block">
            <Link
              href="/support"
              target="_blank"
              className="text-white px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors duration-200 font-sans"
              style={{ backgroundColor: '#1e4356' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#152e3f'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1e4356'}
            >
              SUPPORT
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
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 transform transition-transform duration-300 ease-in-out"
               style={{
                 transform: isMenuOpen ? 'translateY(0)' : 'translateY(-10px)'
               }}>
              <Link
                href="/"
                className="block px-3 py-2 text-sm font-bold uppercase tracking-wider font-sans"
                style={{ color: '#be9d58' }}
              >
                HOME
              </Link>
              <Link
                href="/about"
                className="text-gray-700 block px-3 py-2 text-sm font-bold uppercase tracking-wider font-sans"
                style={{ color: 'inherit' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#be9d58'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
              >
                ABOUT
              </Link>
              <Link
                href="/topics"
                className="text-gray-700 block px-3 py-2 text-sm font-bold uppercase tracking-wider font-sans"
                style={{ color: 'inherit' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#be9d58'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
              >
                TOPICS
              </Link>
              <button
                onClick={() => setIsSubscribeModalOpen(true)}
                className="text-gray-700 block px-3 py-2 text-sm font-bold uppercase tracking-wider font-sans w-full text-left"
                style={{ color: 'inherit' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#be9d58'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
              >
                SUBSCRIBE
              </button>
              <Link
                href="/support"
                target="_blank"
                className="text-white block px-3 py-2 text-sm font-bold uppercase tracking-wider transition-colors duration-200 mt-4 font-sans"
                style={{ backgroundColor: '#1e4356' }}
              >
                SUPPORT
              </Link>
          </div>
        </div>
      </div>

      {/* Subscribe Modal */}
      <SubscribeModal
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
      />
    </header>
  )
}
