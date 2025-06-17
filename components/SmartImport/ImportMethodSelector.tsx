// Import Method Selector Component

import { ImportMethod } from '../../types/smart-import';

interface ImportMethodSelectorProps {
  onMethodSelect: (method: ImportMethod) => void;
}

export default function ImportMethodSelector({ onMethodSelect }: ImportMethodSelectorProps) {
  const methods = [
    {
      id: 'url' as ImportMethod,
      title: 'Import from URL',
      description: 'Extract content from a web article or blog post',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      features: [
        'Automatic content extraction',
        'Image detection and import',
        'Author and date detection',
        'SEO metadata extraction'
      ],
      examples: [
        'Blog posts and articles',
        'News articles',
        'Medium posts',
        'WordPress sites'
      ]
    },
    {
      id: 'text' as ImportMethod,
      title: 'Import from Text',
      description: 'Structure and format raw text content',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      features: [
        'AI-powered content structuring',
        'Automatic title generation',
        'Excerpt creation',
        'Category suggestions'
      ],
      examples: [
        'Copied text from documents',
        'Email content',
        'Notes and drafts',
        'Transcribed content'
      ]
    },
    {
      id: 'file' as ImportMethod,
      title: 'Import from File',
      description: 'Upload and extract content from documents',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      features: [
        'PDF content extraction',
        'Word document support',
        'Plain text files',
        'Automatic formatting'
      ],
      examples: [
        'PDF articles and papers',
        'Word documents',
        'Text files',
        'Research papers'
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {methods.map((method) => (
          <div
            key={method.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-blue-300"
            onClick={() => onMethodSelect(method.id)}
          >
            <div className="p-6">
              {/* Icon and Title */}
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 p-3 bg-blue-50 rounded-lg text-blue-600">
                  {method.icon}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Merriweather, serif' }}>
                    {method.title}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {method.description}
              </p>

              {/* Features */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Features:
                </h4>
                <ul className="space-y-1">
                  {method.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Examples */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Best for:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {method.examples.map((example, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onMethodSelect(method.id)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Select This Method
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Information */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-blue-900 mb-2" style={{ fontFamily: 'Merriweather, serif' }}>
              How Smart Import Works
            </h3>
            <div className="text-blue-800 space-y-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <p>
                Smart Import uses advanced AI to analyze and structure your content automatically. 
                Here&apos;s what happens:
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Content is extracted and cleaned from your chosen source</li>
                <li>AI analyzes the content to identify key elements like title, author, and structure</li>
                <li>Content is formatted according to Forge Journal&apos;s standards</li>
                <li>You review and edit the results before publishing</li>
              </ol>
              <p className="text-sm mt-3">
                <strong>Note:</strong> All imported content will be formatted for Christian leadership and ministry contexts, 
                ensuring it aligns with Forge Journal&apos;s mission and audience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
