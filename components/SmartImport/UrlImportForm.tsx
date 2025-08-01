// URL Import Form Component

import { useState } from 'react';

import { ImportOptions,ParsedContent } from '../../types/smart-import';

interface UrlImportFormProps {
  onContentParsed: (content: ParsedContent) => void;
  onError: (error: string) => void;
  onBack: () => void;
}

export default function UrlImportForm({ onContentParsed, onError, onBack }: UrlImportFormProps) {
  const [url, setUrl] = useState('');
  const [options, setOptions] = useState<ImportOptions>({
    generateExcerpt: true,
    detectAuthor: true,
    extractImages: true,
    suggestCategories: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [urlError, setUrlError] = useState('');

  const validateUrl = (urlString: string): boolean => {
    try {
      const urlObj = new URL(urlString);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setUrlError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setUrlError('Please enter a URL');
      return;
    }

    if (!validateUrl(url)) {
      setUrlError('Please enter a valid HTTP or HTTPS URL');
      return;
    }

    setIsLoading(true);
    setUrlError('');

    try {
      const response = await fetch('/api/smart-import/parse-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ url, options }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to parse URL');
      }

      onContentParsed(data.data);
    } catch (error) {
      console.error('URL import failed:', error);
      onError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 font-sans">
              Import from URL
            </h2>
            <p className="text-gray-600 font-sans">
              Enter the URL of the article or blog post you want to import
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL Input */}
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              Article URL
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com/article"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                urlError ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {urlError && (
              <p className="mt-1 text-sm text-red-600">{urlError}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Supported: Blog posts, news articles, Medium posts, and most web content
            </p>
          </div>

          {/* Import Options */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 font-sans">
              Import Options
            </h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.generateExcerpt}
                  onChange={(e) => setOptions({ ...options, generateExcerpt: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm text-gray-700">Generate excerpt automatically</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.detectAuthor}
                  onChange={(e) => setOptions({ ...options, detectAuthor: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm text-gray-700">Detect author from content</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.extractImages}
                  onChange={(e) => setOptions({ ...options, extractImages: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm text-gray-700">Extract and import images</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.suggestCategories}
                  onChange={(e) => setOptions({ ...options, suggestCategories: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm text-gray-700">Suggest relevant categories</span>
              </label>
            </div>
          </div>

          {/* Custom Prompt */}
          <div>
            <label htmlFor="customPrompt" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Instructions (Optional)
            </label>
            <textarea
              id="customPrompt"
              value={options.customPrompt || ''}
              onChange={(e) => setOptions({ ...options, customPrompt: e.target.value })}
              placeholder="Any specific instructions for processing this content..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
            <p className="mt-1 text-sm text-gray-500">
              Example: &quot;Focus on leadership principles&quot; or &quot;Emphasize practical applications&quot;
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium font-sans"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importing...
                </div>
              ) : (
                'Import from URL'
              )}
            </button>
            
            <button
              type="button"
              onClick={onBack}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors font-sans"
            >
              Back
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Tips for best results:</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Use direct links to articles, not homepage URLs</li>
                  <li>Ensure the content is publicly accessible (not behind paywalls)</li>
                  <li>Some sites may block automated access - try copying the text instead</li>
                  <li>The AI will adapt content for Christian leadership contexts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
