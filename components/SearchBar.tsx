import { useState } from 'react'
import type { Post } from 'lib/sanity.queries'

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
    <div className="mb-12">
      <div className="max-w-2xl mx-auto">
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
            className="w-full pl-12 pr-12 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors bg-white shadow-sm"
          />

          {/* Clear Button */}
          {isSearching && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Search Results Info */}
        {isSearching && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              {posts.length === 0 ? (
                'No articles found'
              ) : posts.length === 1 ? (
                '1 article found'
              ) : (
                `${posts.length} articles found`
              )}
              {searchTerm && (
                <span> for "<span className="font-medium">{searchTerm}</span>"</span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
