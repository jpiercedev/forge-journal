import type { Post } from 'lib/supabase/client'
import { useState } from 'react'

interface SearchBarProps {
  posts: Post[]
  onSearchResults: (results: Post[]) => void
}

export default function SearchBar({ posts, onSearchResults }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setIsSearching(term.length > 0)

    if (term.length === 0) {
      // If search is empty, show all posts
      onSearchResults(posts)
      return
    }

    // Simple search implementation - searches title, excerpt, and author name
    const searchResults = posts.filter(post => {
      const searchableText = [
        post.title,
        post.excerpt,
        post.author?.name
      ].filter(Boolean).join(' ').toLowerCase()
      
      return searchableText.includes(term.toLowerCase())
    })

    onSearchResults(searchResults)
  }

  const clearSearch = () => {
    setSearchTerm('')
    setIsSearching(false)
    onSearchResults(posts)
  }

  return (
    <div className="bg-white p-6 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-4 font-sans uppercase tracking-wider">Find What You&apos;re Looking For</h3>
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search articles..."
          className="w-full pl-12 pr-12 py-3 text-base border border-gray-300 focus:ring-2 focus:border-gray-400 transition-colors bg-white font-sans"
          style={{
            borderColor: isSearching ? '#1e4356' : undefined
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#1e4356'}
          onBlur={(e) => !isSearching && (e.currentTarget.style.borderColor = '#d1d5db')}
        />

        {/* Clear Button */}
        {isSearching && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors"
            style={{ color: '#1e4356' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#152e3f'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#1e4356'}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search Results Info */}
      {isSearching && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 font-sans">
            {posts.length === 0 ? (
              'No articles found'
            ) : posts.length === 1 ? (
              '1 article found'
            ) : (
              `${posts.length} articles found`
            )}
            {searchTerm && (
              <span> for &quot;<span className="font-medium" style={{ color: '#1e4356' }}>{searchTerm}</span>&quot;</span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}
