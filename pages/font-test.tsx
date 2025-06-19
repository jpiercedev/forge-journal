// Font Test Page - Verify Adobe Fonts are loading correctly

export default function FontTest() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Font Test Page
        </h1>

        {/* Sans Font (Proxima Nova) Tests */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-forge-teal font-sans">
            Sans Font (Proxima Nova) - font-sans
          </h2>
          
          <div className="space-y-4">
            <p className="text-lg font-sans font-light">
              Light: The quick brown fox jumps over the lazy dog
            </p>
            <p className="text-lg font-sans font-normal">
              Regular: The quick brown fox jumps over the lazy dog
            </p>
            <p className="text-lg font-sans font-medium">
              Medium: The quick brown fox jumps over the lazy dog
            </p>
            <p className="text-lg font-sans font-semibold">
              Semibold: The quick brown fox jumps over the lazy dog
            </p>
            <p className="text-lg font-sans font-bold">
              Bold: The quick brown fox jumps over the lazy dog
            </p>
            <p className="text-lg font-sans font-black">
              Black: The quick brown fox jumps over the lazy dog
            </p>
          </div>
        </div>

        {/* Serif Font (Garamond) Tests */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-forge-teal font-sans">
            Serif Font (Adobe Garamond Pro) - font-serif
          </h2>
          
          <div className="space-y-4">
            <p className="text-lg font-serif font-light">
              Light: The quick brown fox jumps over the lazy dog
            </p>
            <p className="text-lg font-serif font-normal">
              Regular: The quick brown fox jumps over the lazy dog
            </p>
            <p className="text-lg font-serif font-medium">
              Medium: The quick brown fox jumps over the lazy dog
            </p>
            <p className="text-lg font-serif font-semibold">
              Semibold: The quick brown fox jumps over the lazy dog
            </p>
            <p className="text-lg font-serif font-bold">
              Bold: The quick brown fox jumps over the lazy dog
            </p>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-forge-teal font-sans">
            Usage Examples
          </h2>
          
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold font-sans mb-2 text-gray-900">
                Admin Interface Example (Proxima Nova)
              </h3>
              <p className="font-sans text-gray-600 mb-4">
                This is how text appears in the admin interface using Proxima Nova. 
                It should be clean, modern, and highly readable for interface elements.
              </p>
              <button className="bg-forge-teal text-white px-4 py-2 rounded-lg font-sans font-medium hover:bg-forge-teal-hover transition-colors">
                Sample Button
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold font-serif mb-2 text-gray-900">
                Content Example (Adobe Garamond Pro)
              </h3>
              <p className="font-serif text-gray-700 leading-relaxed">
                This is how content appears using Adobe Garamond Pro. This elegant serif font 
                is perfect for author names, volume information, and other content elements 
                that need a more traditional, authoritative feel. The font should maintain 
                excellent readability while adding sophistication to the design.
              </p>
            </div>
          </div>
        </div>

        {/* Font Loading Status */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-bold font-sans mb-4 text-gray-900">
            Font Loading Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="font-sans">Sans Font Family:</strong>
              <code className="ml-2 bg-gray-200 px-2 py-1 rounded font-mono">
                proxima-nova
              </code>
            </div>
            <div>
              <strong className="font-sans">Serif Font Family:</strong>
              <code className="ml-2 bg-gray-200 px-2 py-1 rounded font-mono">
                adobe-garamond-pro
              </code>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4 font-sans">
            If the fonts above don&apos;t look different from system fonts, there may be an issue with the Adobe Fonts loading.
          </p>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/"
            className="inline-flex items-center px-6 py-3 bg-forge-teal text-white font-sans font-medium rounded-lg hover:bg-forge-teal-hover transition-colors"
          >
            ← Back to Homepage
          </a>
        </div>
      </div>
    </div>
  )
}
