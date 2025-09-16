import Head from 'next/head'
import { useState, useEffect } from 'react'
import ForgeLayout from 'components/ForgeLayout'
import { useMarketingSource } from 'hooks/useMarketingSource'
import { getMarketingSource, clearMarketingSource } from 'lib/utils/cookieUtils'
import type { Post } from 'lib/supabase/client'
import { db } from 'lib/supabase/client'
import { GetStaticProps } from 'next'

interface PageProps {
  posts: Post[]
}

export default function TestHoustonSource({ posts }: PageProps) {
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
    clearSource()
  }

  return (
    <>
      <Head>
        <title>Houston Marketing Source Test - Forge Journal</title>
        <meta name="description" content="Test page for Houston marketing source tracking" />
      </Head>
      
      <ForgeLayout recentPosts={posts} showSidebar={false}>
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
            Houston Marketing Source Test
          </h1>

          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
              Current Status
            </h2>
            
            <div className="space-y-2 text-sm font-mono">
              <div><strong>Current URL:</strong> {currentUrl}</div>
              <div><strong>Marketing Source:</strong> {isLoading ? 'Loading...' : (source || 'null')}</div>
              <div><strong>Is Loading:</strong> {isLoading.toString()}</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
              Houston Source Test
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded">
                <h3 className="font-semibold mb-2">Test Houston URL Parameter</h3>
                <p className="text-sm mb-2">
                  Click this link to test the Houston source parameter:
                </p>
                <a 
                  href={`${currentUrl.split('?')[0]}?src=houston`}
                  className="block p-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors text-center"
                >
                  Test Houston Source (?src=houston)
                </a>
                <p className="text-xs text-gray-600 mt-2">
                  This will set the marketing source to &quot;houston&quot; and store it for 30 days.
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded">
                <h3 className="font-semibold mb-2">Virtuous Integration</h3>
                <p className="text-sm mb-2">
                  When users subscribe with the Houston source:
                </p>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  <li>Houston tag (ID: 31) will be applied in Virtuous</li>
                  <li>Base tags &quot;The Forge Journal&quot; and &quot;FJ Welcome Series&quot; will also be applied</li>
                  <li>Source will be tracked in the local database</li>
                </ul>
              </div>

              <div className="p-4 bg-yellow-50 rounded">
                <h3 className="font-semibold mb-2">Other Test URLs</h3>
                <div className="space-y-2">
                  <a 
                    href={`${currentUrl.split('?')[0]}?src=orange`}
                    className="block p-1 bg-orange-100 rounded text-sm hover:bg-orange-200 transition-colors text-center"
                  >
                    Test Orange Source
                  </a>
                  <a 
                    href={`${currentUrl.split('?')[0]}?src=texas`}
                    className="block p-1 bg-red-100 rounded text-sm hover:bg-red-200 transition-colors text-center"
                  >
                    Test Texas Source
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
              Test Controls
            </h2>
            
            <div className="space-x-4">
              <button
                onClick={testDirectAccess}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Test Direct Access
              </button>
              
              <button
                onClick={clearAndTest}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Clear Source
              </button>
            </div>
          </div>

          {testResults.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                Test Results
              </h2>
              
              <div className="space-y-1 text-sm font-mono bg-gray-100 p-4 rounded max-h-64 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index}>{result}</div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
              How to Verify
            </h3>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Click the &quot;Test Houston Source&quot; button above</li>
              <li>Check that the marketing source shows as &quot;houston&quot;</li>
              <li>Go to the contact form and submit a test subscription</li>
              <li>Verify in Virtuous that the contact has the Houston tag applied</li>
            </ol>
          </div>
        </div>
      </ForgeLayout>
    </>
  )
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  try {
    // Check if Supabase is available (might not be during build time)
    if (!db || typeof db.getPosts !== 'function') {
      console.warn('Supabase client not available during build, returning empty data')
      return {
        props: {
          posts: [],
        },
        revalidate: 60,
      }
    }

    // Get published posts from Supabase
    const { data: posts, error: postsError } = await db.getPosts({
      status: 'published',
      limit: 5,
      includeAuthor: true
    })

    if (postsError) {
      console.error('Error fetching posts:', postsError)
      return {
        props: {
          posts: [],
        },
        revalidate: 60,
      }
    }

    return {
      props: {
        posts: posts || [],
      },
      revalidate: 60, // Revalidate every minute
    }
  } catch (error) {
    console.error('Error in getStaticProps:', error)
    return {
      props: {
        posts: [],
      },
      revalidate: 60,
    }
  }
}
