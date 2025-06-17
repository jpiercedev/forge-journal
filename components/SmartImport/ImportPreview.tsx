// Import Preview Component

import { useState } from 'react';

import { ImportPreview as ImportPreviewType, ParsedContent } from '../../types/smart-import';

interface ImportPreviewProps {
  preview: ImportPreviewType;
  onCreatePost: (data: any) => void;
  onBack: () => void;
  onEdit: (content: ParsedContent) => void;
}

export default function ImportPreview({ preview, onCreatePost, onBack, onEdit }: ImportPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(preview.parsedContent);
  const [createAuthor, setCreateAuthor] = useState(true);
  const [authorName, setAuthorName] = useState(preview.parsedContent.author || '');

  const handleSaveEdit = () => {
    onEdit(editedContent);
    setIsEditing(false);
  };

  const handleCreatePost = () => {
    const finalData = {
      parsedContent: editedContent,
      createAuthor,
      authorName: authorName.trim() || undefined,
      generateSlug: true,
    };
    onCreatePost(finalData);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const estimatedReadingTime = Math.ceil(
    (editedContent.content?.split(/\s+/).length || 0) / 200
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Merriweather, serif' }}>
                  Content Preview
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    {isEditing ? 'Cancel Edit' : 'Edit'}
                  </button>
                  {isEditing && (
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Save Changes
                    </button>
                  )}
                </div>
              </div>

              {/* Title */}
              {isEditing ? (
                <input
                  type="text"
                  value={editedContent.title}
                  onChange={(e) => setEditedContent({ ...editedContent, title: e.target.value })}
                  className="w-full text-2xl font-bold text-gray-900 border border-gray-300 rounded-md px-3 py-2"
                  style={{ fontFamily: 'Merriweather, serif' }}
                />
              ) : (
                <h1 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Merriweather, serif' }}>
                  {editedContent.title}
                </h1>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {editedContent.author || 'No author'}
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(editedContent.publishedAt)}
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {estimatedReadingTime} min read
                </div>
              </div>
            </div>

            {/* Excerpt */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: 'Merriweather, serif' }}>
                Excerpt
              </h3>
              {isEditing ? (
                <textarea
                  value={editedContent.excerpt || ''}
                  onChange={(e) => setEditedContent({ ...editedContent, excerpt: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700"
                  placeholder="Enter a brief excerpt..."
                />
              ) : (
                <p className="text-gray-700 italic" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {editedContent.excerpt || 'No excerpt provided'}
                </p>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4" style={{ fontFamily: 'Merriweather, serif' }}>
                Content
              </h3>
              {isEditing ? (
                <textarea
                  value={editedContent.content}
                  onChange={(e) => setEditedContent({ ...editedContent, content: e.target.value })}
                  rows={20}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 font-mono text-sm"
                  placeholder="Enter the main content..."
                />
              ) : (
                <div className="prose max-w-none">
                  {editedContent.content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700 leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Categories */}
            {editedContent.categories && editedContent.categories.length > 0 && (
              <div className="p-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: 'Merriweather, serif' }}>
                  Suggested Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {editedContent.categories.map((category, index) => (
                    <span
                      key={index}
                      className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4" style={{ fontFamily: 'Merriweather, serif' }}>
              Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleCreatePost}
                disabled={isEditing}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Create Blog Post
              </button>
              <button
                onClick={onBack}
                className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Start Over
              </button>
            </div>
          </div>

          {/* Author Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4" style={{ fontFamily: 'Merriweather, serif' }}>
              Author Settings
            </h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={createAuthor}
                  onChange={(e) => setCreateAuthor(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Create author if not exists</span>
              </label>
              <div>
                <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-1">
                  Author Name
                </label>
                <input
                  type="text"
                  id="authorName"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Enter author name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Warnings */}
          {preview.warnings && preview.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Warnings</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc list-inside space-y-1">
                      {preview.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Suggestions */}
          {preview.suggestions && preview.suggestions.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Suggestions</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      {preview.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4" style={{ fontFamily: 'Merriweather, serif' }}>
              Content Info
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Word Count:</span>
                <span>{editedContent.metadata?.wordCount || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span>Reading Time:</span>
                <span>{estimatedReadingTime} minutes</span>
              </div>
              <div className="flex justify-between">
                <span>Images:</span>
                <span>{editedContent.images?.length || 0}</span>
              </div>
              {editedContent.metadata?.sourceUrl && (
                <div className="pt-2 border-t border-gray-200">
                  <span className="block text-xs text-gray-500">Source:</span>
                  <a
                    href={editedContent.metadata.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-xs break-all"
                  >
                    {editedContent.metadata.sourceUrl}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
