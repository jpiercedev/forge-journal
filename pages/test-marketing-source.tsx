import { useState, useEffect } from 'react'
import ForgeLayout from 'components/ForgeLayout'
import { useMarketingSource } from 'hooks/useMarketingSource'
import { getMarketingSource, clearMarketingSource } from 'lib/utils/cookieUtils'
import { db, type Post } from 'lib/supabase/client'
import { GetStaticProps } from 'next'
import Head from 'next/head'

interface PageProps {
  posts: Post[]
}

export default function TestMarketingSource({ posts }: PageProps) {
  const { source, isLoading, clearSource } = useMarketingSource()
  const [currentUrl, setCurrentUrl] = useState('')
  const [testResults, setTestResults] = useState<string[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href)
    }
  }, [])

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const testDirectAccess = () => {
    const directSource = getMarketingSource()
    addTestResult(`Direct access to marketing source: ${directSource || 'null'}`)
  }

  const clearAndTest = () => {
    clearMarketingSource()
    const afterClear = getMarketingSource()
    addTestResult(`After clearing: ${afterClear || 'null'}`)
    // Force re-render by clearing the hook state too
    clearSource()
  }

  return (
    <>
      <Head>
        <title>Marketing Source Test - Forge Journal</title>
        <meta name="description" content="Test page for marketing source tracking" />
      </Head>
      
      <ForgeLayout recentPosts={posts} showSidebar={false}>
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
            Marketing Source Tracking Test
          </h1>

          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
              Current Status
            </h2>
            
            <div className="space-y-2 text-sm font-mono">
              <div><strong>Current URL:</strong> {currentUrl}</div>
              <div><strong>Marketing Source (Hook):</strong> {isLoading ? 'Loading...' : (source || 'null')}</div>
              <div><strong>Is Loading:</strong> {isLoading.toString()}</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
              Test Instructions
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded">
                <h3 className="font-semibold mb-2">Test 1: URL Parameter Capture</h3>
                <p className="text-sm mb-2">
                  Visit this URL to test the &quot;orange&quot; source parameter:
                </p>
                <code className="block p-2 bg-gray-100 rounded text-sm break-all">
                  {currentUrl.split('?')[0]}?src=orange
                </code>
                <p className="text-xs text-gray-600 mt-2">
                  The marketing source should be captured and stored in localStorage for 30 days.
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded">
                <h3 className="font-semibold mb-2">Test 2: Other Source Parameters</h3>
                <p className="text-sm mb-2">Try these URLs to test different sources:</p>
                <div className="space-y-1 text-xs">
                  <code className="block p-1 bg-gray-100 rounded break-all">
                    {currentUrl.split('?')[0]}?src=facebook
                  </code>
                  <code className="block p-1 bg-gray-100 rounded break-all">
                    {currentUrl.split('?')[0]}?src=google
                  </code>
                  <code className="block p-1 bg-gray-100 rounded break-all">
                    {currentUrl.split('?')[0]}?src=email
                  </code>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded">
                <h3 className="font-semibold mb-2">Test 3: Form Submission</h3>
                <p className="text-sm">
                  After setting a marketing source, try submitting any newsletter signup form on the site. 
                  The source should be included in the Virtuous contact as a tag and saved to the database.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
              Test Actions
            </h2>
            
            <div className="space-x-4">
              <button
                onClick={testDirectAccess}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                style={{ fontFamily: 'Proxima Nova, sans-serif' }}
              >
                Test Direct Access
              </button>
              
              <button
                onClick={clearAndTest}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                style={{ fontFamily: 'Proxima Nova, sans-serif' }}
              >
                Clear Source & Test
              </button>
            </div>
          </div>

          {testResults.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                Test Results
              </h2>
              
              <div className="space-y-1 text-sm font-mono">
                {testResults.map((result, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded">
                    {result}
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => setTestResults([])}
                className="mt-4 px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                style={{ fontFamily: 'Proxima Nova, sans-serif' }}
              >
                Clear Results
              </button>
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
              How to Verify in Browser DevTools
            </h3>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Open Browser DevTools (F12)</li>
              <li>Go to Application tab → Local Storage</li>
              <li>Look for key: <code className="bg-gray-200 px-1 rounded">forge-journal-marketing-source</code></li>
              <li>The value should be a JSON object with source, timestamp, and expires fields</li>
            </ol>
          </div>
        </div>
      </ForgeLayout>
    </>
  )
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  try {
    const { data: posts } = await db.getPosts({
      status: 'published',
      limit: 5,
      includeAuthor: true
    })

    return {
      props: {
        posts: posts || [],
      },
      revalidate: 60,
    }
  } catch (error) {
    console.error('Error fetching posts for test page:', error)
    return {
      props: {
        posts: [],
      },
      revalidate: 60,
    }
  }
}
