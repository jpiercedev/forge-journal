// Import Results Component

import { ImportResult } from '../../types/smart-import';

interface ImportResultsProps {
  result: ImportResult;
  onStartNew: () => void;
}

export default function ImportResults({ result, onStartNew }: ImportResultsProps) {
  const postUrl = result.slug ? `/posts/${result.slug}` : null;
  const studioUrl = result.postId ? `/studio/desk/post;${result.postId}` : '/studio';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        {result.success ? (
          <>
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Success Message */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Merriweather, serif' }}>
                Import Successful!
              </h2>
              <p className="text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Your blog post has been created and is ready for review.
              </p>
            </div>

            {/* Post Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4" style={{ fontFamily: 'Merriweather, serif' }}>
                Post Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Post ID:</span>
                  <span className="text-sm text-gray-600 font-mono">{result.postId}</span>
                </div>
                {result.slug && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Slug:</span>
                    <span className="text-sm text-gray-600 font-mono">{result.slug}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Published
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {postUrl && (
                <a
                  href={postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium text-center block"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  View Published Post
                </a>
              )}
              
              <a
                href={studioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-50 transition-colors font-medium text-center block"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Edit in Sanity Studio
              </a>
              
              <button
                onClick={onStartNew}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors font-medium"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Import Another Post
              </button>
            </div>

            {/* Warnings */}
            {result.warnings && result.warnings.length > 0 && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Import Warnings</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <ul className="list-disc list-inside space-y-1">
                        {result.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Error Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            {/* Error Message */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Merriweather, serif' }}>
                Import Failed
              </h2>
              <p className="text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                There was an error creating your blog post.
              </p>
            </div>

            {/* Error Details */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-red-900 mb-2" style={{ fontFamily: 'Merriweather, serif' }}>
                Error Details
              </h3>
              <p className="text-red-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {result.error || 'An unknown error occurred during the import process.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={onStartNew}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Try Again
              </button>
              
              <a
                href="/studio"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-50 transition-colors font-medium text-center block"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Create Post Manually
              </a>
            </div>
          </>
        )}

        {/* Help Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Need Help?</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              If you're experiencing issues with Smart Import, try these troubleshooting steps:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Check that your content source is accessible</li>
              <li>Ensure your Sanity API token has write permissions</li>
              <li>Try importing smaller content pieces</li>
              <li>Contact support if the problem persists</li>
            </ul>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">1</div>
              <div className="text-xs text-gray-500">Import Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {result.success ? '100%' : '0%'}
              </div>
              <div className="text-xs text-gray-500">Success Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">AI</div>
              <div className="text-xs text-gray-500">Powered</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
