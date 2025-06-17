// Text Import Form Component

import { useState } from 'react';

import { ImportOptions,ParsedContent } from '../../types/smart-import';

interface TextImportFormProps {
  onContentParsed: (content: ParsedContent) => void;
  onError: (error: string) => void;
  onBack: () => void;
}

export default function TextImportForm({ onContentParsed, onError, onBack }: TextImportFormProps) {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState<ImportOptions>({
    generateExcerpt: true,
    detectAuthor: true,
    suggestCategories: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [textError, setTextError] = useState('');

  const handleTextChange = (value: string) => {
    setText(value);
    setTextError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      setTextError('Please enter some text content');
      return;
    }

    if (text.length < 100) {
      setTextError('Text content should be at least 100 characters long');
      return;
    }

    if (text.length > 50000) {
      setTextError('Text content is too long (maximum 50,000 characters)');
      return;
    }

    setIsLoading(true);
    setTextError('');

    try {
      const token = localStorage.getItem('supabase_admin_token') || '';
      const response = await fetch('/api/smart-import/parse-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text, title: title.trim() || undefined, options }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to parse text');
      }

      onContentParsed(data.data);
    } catch (error) {
      console.error('Text import failed:', error);
      onError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  const estimatedReadingTime = Math.ceil(wordCount / 200);

  return (
    <div className="max-w-4xl mx-auto">
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
            <h2 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Merriweather, serif' }}>
              Import from Text
            </h2>
            <p className="text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Paste your text content and let AI structure it for your blog
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title (Optional)
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Leave blank to auto-generate from content"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
            <p className="mt-1 text-sm text-gray-500">
              If left blank, AI will generate a title from your content
            </p>
          </div>

          {/* Text Content */}
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Paste your article content here..."
              rows={15}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                textError ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {textError && (
              <p className="mt-1 text-sm text-red-600">{textError}</p>
            )}
            <div className="mt-1 flex justify-between text-sm text-gray-500">
              <span>
                {wordCount} words • {estimatedReadingTime} min read
              </span>
              <span>
                {text.length}/50,000 characters
              </span>
            </div>
          </div>

          {/* Import Options */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3" style={{ fontFamily: 'Merriweather, serif' }}>
              Processing Options
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
              Example: &quot;Structure as a sermon outline&quot; or &quot;Focus on practical ministry applications&quot;
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isLoading || !text.trim() || text.length < 100}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                'Process Text'
              )}
            </button>
            
            <button
              type="button"
              onClick={onBack}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Back
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Tips for best results:</h3>
              <div className="mt-2 text-sm text-green-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Include at least 100 words for meaningful content analysis</li>
                  <li>Paste clean text without excessive formatting</li>
                  <li>Include author information in the text if you want it detected</li>
                  <li>The AI will structure your content with appropriate headings and formatting</li>
                  <li>Content will be adapted for Christian leadership and ministry contexts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
