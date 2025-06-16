import ForgeLayout from 'components/ForgeLayout'
import { readToken } from 'lib/sanity.api'
import { getAllPosts, getClient, getSettings } from 'lib/sanity.client'
import { Post, Settings } from 'lib/sanity.queries'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import type { SharedPageProps } from 'pages/_app'

interface PageProps extends SharedPageProps {
  posts: Post[]
  settings: Settings
}

export default function AboutPage(props: PageProps) {
  const { posts, settings, draftMode } = props

  return (
    <>
      <Head>
        <title>About - The Forge Journal</title>
        <meta name="description" content="Learn about The Forge Journal and our mission to equip church leaders." />
      </Head>

      <ForgeLayout
        preview={draftMode}
        loading={false}
        recentPosts={posts.slice(0, 3)}
        showSidebar={true}
      >
        <div className="max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              About The Forge Journal
            </h1>
            <div className="border-b-4 border-gray-900 w-16 mb-8"></div>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              The Forge Journal is dedicated to equipping pastors and church leaders with thoughtful,
              biblical content that strengthens their ministry and deepens their understanding of
              theological principles.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              We believe that strong churches are built by well-equipped leaders. Through in-depth
              articles, practical insights, and theological reflection, The Forge Journal serves as
              a resource for pastors seeking to grow in their calling and better serve their congregations.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Offer</h2>
            <ul className="text-gray-700 leading-relaxed mb-6 space-y-2">
              <li>• Biblical exposition and theological insights</li>
              <li>• Practical ministry guidance and leadership principles</li>
              <li>• Historical perspectives on church doctrine and practice</li>
              <li>• Contemporary issues facing the modern church</li>
              <li>• Resources for personal spiritual growth</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Commitment</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Every article in The Forge Journal is carefully crafted to honor Scripture,
              encourage faithful ministry, and provide practical wisdom for the challenges
              facing today's church leaders. We are committed to excellence in both content
              and presentation, ensuring that each issue serves as a valuable resource for
              your ministry library.
            </p>

            <div className="bg-gray-50 p-6 mt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Involved</h3>
              <p className="text-gray-700 leading-relaxed">
                We welcome contributions from pastors, theologians, and church leaders who
                share our commitment to biblical faithfulness and practical ministry wisdom.
                If you're interested in contributing to The Forge Journal, please contact us
                to learn more about our submission guidelines.
              </p>
            </div>
          </div>
        </div>
      </ForgeLayout>
    </>
  )
}

export const getStaticProps: GetStaticProps<PageProps> = async (ctx) => {
  const { draftMode = false } = ctx
  const client = getClient(draftMode ? { token: readToken } : undefined)

  const [posts, settings] = await Promise.all([
    getAllPosts(client),
    getSettings(client),
  ])

  return {
    props: {
      posts,
      settings,
      draftMode,
      token: draftMode ? readToken : '',
    },
  }
}
