import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/router'

import SubscribeModal from './SubscribeModal'

export default function ForgeHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false)
  const router = useRouter()

  const isActive = (href: string) => {
    if (href === '/') {
      return router.pathname === '/'
    }
    return router.pathname.startsWith(href)
  }

  return (
    <header className="bg-white border-b border-gray-200" style={{ borderBottomWidth: '7px', borderBottomColor: '#1e4356' }}>
      <div className="w-full px-4 sm:w-[95%] md:w-[90%] mx-auto max-w-[1280px]">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="https://uvnbfnobyqbonuxztjuz.supabase.co/storage/v1/object/public/assets/logo-horizontal.png"
                alt="The Forge Journal"
                width={240}
                height={60}
                className="h-8 md:h-12 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-8">
            <Link
              href="/"
              className="px-3 py-2 text-sm font-bold uppercase tracking-wider transition-colors duration-200 font-sans"
              style={{ color: isActive('/') ? '#be9d58' : '#374151' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#be9d58'}
              onMouseLeave={(e) => e.currentTarget.style.color = isActive('/') ? '#be9d58' : '#374151'}
            >
              HOME
            </Link>
            <Link
              href="/about"
              className="px-3 py-2 text-sm font-bold uppercase tracking-wider transition-colors duration-200 font-sans"
              style={{ color: isActive('/about') ? '#be9d58' : '#374151' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#be9d58'}
              onMouseLeave={(e) => e.currentTarget.style.color = isActive('/about') ? '#be9d58' : '#374151'}
            >
              ABOUT
            </Link>
            <Link
              href="/topics"
              className="px-3 py-2 text-sm font-bold uppercase tracking-wider transition-colors duration-200 font-sans"
              style={{ color: isActive('/topics') ? '#be9d58' : '#374151' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#be9d58'}
              onMouseLeave={(e) => e.currentTarget.style.color = isActive('/topics') ? '#be9d58' : '#374151'}
            >
              TOPICS
            </Link>
            <Link
              href="/contributors"
              className="px-3 py-2 text-sm font-bold uppercase tracking-wider transition-colors duration-200 font-sans"
              style={{ color: isActive('/contributors') ? '#be9d58' : '#374151' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#be9d58'}
              onMouseLeave={(e) => e.currentTarget.style.color = isActive('/contributors') ? '#be9d58' : '#374151'}
            >
              CONTRIBUTORS
            </Link>
            <button
              onClick={() => setIsSubscribeModalOpen(true)}
              className="text-gray-700 px-3 py-2 text-sm font-bold uppercase tracking-wider transition-colors duration-200 font-sans"
              style={{ color: '#B91C1C' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#991B1B'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#B91C1C'}
            >
              SUBSCRIBE
            </button>
          </nav>

          {/* Support Button */}
          <div className="hidden lg:block">
            <Link
              href="/support"
              target="_blank"
              className="text-white px-4 xl:px-6 py-2 xl:py-3 text-xs xl:text-sm font-bold uppercase tracking-wider transition-colors duration-200 font-sans"
              style={{ backgroundColor: '#B91C1C' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#991B1B'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#B91C1C'}
            >
              SUPPORT THE MISSION
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-gray-900 focus:outline-none focus:text-gray-900 p-2"
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
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 transform transition-transform duration-300 ease-in-out"
               style={{
                 transform: isMenuOpen ? 'translateY(0)' : 'translateY(-10px)'
               }}>
              <Link
                href="/"
                className="block px-3 py-2 text-sm font-bold uppercase tracking-wider font-sans"
                style={{ color: isActive('/') ? '#be9d58' : '#374151' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#be9d58'}
                onMouseLeave={(e) => e.currentTarget.style.color = isActive('/') ? '#be9d58' : '#374151'}
              >
                HOME
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-sm font-bold uppercase tracking-wider font-sans"
                style={{ color: isActive('/about') ? '#be9d58' : '#374151' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#be9d58'}
                onMouseLeave={(e) => e.currentTarget.style.color = isActive('/about') ? '#be9d58' : '#374151'}
              >
                ABOUT
              </Link>
              <Link
                href="/topics"
                className="block px-3 py-2 text-sm font-bold uppercase tracking-wider font-sans"
                style={{ color: isActive('/topics') ? '#be9d58' : '#374151' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#be9d58'}
                onMouseLeave={(e) => e.currentTarget.style.color = isActive('/topics') ? '#be9d58' : '#374151'}
              >
                TOPICS
              </Link>
              <Link
                href="/contributors"
                className="block px-3 py-2 text-sm font-bold uppercase tracking-wider font-sans"
                style={{ color: isActive('/contributors') ? '#be9d58' : '#374151' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#be9d58'}
                onMouseLeave={(e) => e.currentTarget.style.color = isActive('/contributors') ? '#be9d58' : '#374151'}
              >
                CONTRIBUTORS
              </Link>
              <button
                onClick={() => setIsSubscribeModalOpen(true)}
                className="text-gray-700 block px-3 py-2 text-sm font-bold uppercase tracking-wider font-sans w-full text-left"
                style={{ color: '#B91C1C' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#991B1B'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#B91C1C'}
              >
                SUBSCRIBE
              </button>
              <Link
                href="/support"
                target="_blank"
                className="text-white block px-3 py-2 text-sm font-bold uppercase tracking-wider transition-colors duration-200 mt-4 font-sans"
                style={{ backgroundColor: '#B91C1C' }}
              >
                SUPPORT THE MISSION
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
