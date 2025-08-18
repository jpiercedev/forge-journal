import ForgeLayout from 'components/ForgeLayout'
import { db, type Post } from 'lib/supabase/client'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import type { SharedPageProps } from 'pages/_app'

interface Settings {
  title: string
  description: any[]
}

interface PageProps extends SharedPageProps {
  posts: Post[]
  settings: Settings
}

export default function WhatWeBelievePage(props: PageProps) {
  const { posts } = props

  return (
    <>
      <Head>
        <title>What We Believe - The Forge Journal</title>
        <meta name="description" content="Learn about the foundational beliefs and doctrines of The Forge Journal and FORGE ministry." />
      </Head>

      <ForgeLayout
        preview={false}
        loading={false}
        recentPosts={posts.slice(0, 3)}
        showSidebar={true}
      >
        <div>
          <div className="mb-8">
            <div className="py-4 px-6 mb-8 border-t-4 border-b-4 shadow-lg" style={{ backgroundColor: '#B91C1C', borderColor: '#991B1B' }}>
              <h2 className="text-xl md:text-2xl font-bold text-center font-sans uppercase tracking-wide text-white">
                Our Foundation of Faith
              </h2>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6 font-sans">
              What We Believe
            </h1>
            <div className="border-b-4 border-gray-900 w-16 mb-8"></div>
          </div>

          <div className="prose prose-lg max-w-none">
            
            {/* The Bible */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 font-sans">The Bible</h2>
              <p className="text-base text-gray-700 leading-relaxed mb-4 font-sans">
                We believe the Bible to be the inspired, the only infallible, authoritative, eternal Word of God.
              </p>
              <p className="text-sm text-gray-600 italic font-sans">
                (II Timothy 3:16, 17; Hebrews 4:12; II Peter 1:21; Isaiah 40:8; Psalm 119:89, 160)
              </p>
            </div>

            {/* The Trinity */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 font-sans">The Trinity</h2>
              <p className="text-base text-gray-700 leading-relaxed mb-4 font-sans">
                We believe that there is one triune God, eternally existent as Father, Son and Holy Spirit.
              </p>
              <p className="text-sm text-gray-600 italic font-sans">
                (Matt. 28:19; Mark 1:9-11; John 5:18, 23; 10:29, 30; Psalm 139:7; I Corinthians 2:10,11; Hebrews 1:5-12 (cf. Psalms 102:25ff); Hebrews 9:14; II Corinthians 13:14)
              </p>
            </div>

            {/* Jesus */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 font-sans">Jesus</h2>
              <p className="text-base text-gray-700 leading-relaxed mb-4 font-sans">
                We believe in the deity of our Lord Jesus Christ, in His virgin birth, in His sinless life, in His vicarious and atoning death, in His bodily resurrection, in His ascension to the right hand of the Father, and in His personal return in power and glory.
              </p>
              <p className="text-sm text-gray-600 italic font-sans">
                (John 1: 1-5; 20:28; Colossians 1:15-17; Matthew 1:22, 23; 3:16, 17; II Corinthians 5:21; Romans 3:25; Matthew 28: 5-7; Corinthians 15:3-8; Acts 1:9-11; 2:32-33; Romans 8:34; Ephesians 4:8-10; Hebrews 1:2-3; I Thessalonians. 4:16-18)
              </p>
            </div>

            {/* Salvation */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 font-sans">Salvation</h2>
              <p className="text-base text-gray-700 leading-relaxed mb-4 font-sans">
                We believe that for the salvation of lost and sinful man, regeneration by the Holy Spirit is absolutely essential. Salvation is by faith alone through grace alone. Both justification and sanctification are the works of the Holy Spirit in those who trust in Jesus.
              </p>
              <p className="text-sm text-gray-600 italic font-sans">
                (John 3:5, 6; Titus 3:5, 6; Ephesians 2:8; Galatians 3:2-3; I Peter 1:2)
              </p>
            </div>

            {/* Holy Spirit */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 font-sans">Holy Spirit</h2>
              <p className="text-base text-gray-700 leading-relaxed mb-4 font-sans">
                We believe in the present ministry of the Holy Spirit, by whose indwelling the Christian is enabled to live a godly life.
              </p>
              <p className="text-sm text-gray-600 italic mb-4 font-sans">
                (Luke 24:49; Acts 1:8; Romans 8:9-11, 13-15; 15:18,19; II Corinthians 1:21, 22; Ephesians 3:14-19; 5:18-20)
              </p>
              <p className="text-base text-gray-700 leading-relaxed mb-4 font-sans">
                We believe in the personal baptism with the Holy Spirit as received by believers "at the beginning." We believe in the present day manifestation of all the gifts of the Holy Spirit in the Church.
              </p>
              <p className="text-sm text-gray-600 italic font-sans">
                (John 1:33; 20:21-23; Acts 1:8; 2:4; 4:31; 8:17; 10:44-46; 19:3-6; Romans 12:6-8; I Corinthians 12:13, 27-31; 14:1-40; Ephesians 5:18)
              </p>
            </div>

            {/* Sanctity of Human Life */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 font-sans">Sanctity of Human Life</h2>
              <p className="text-base text-gray-700 leading-relaxed mb-4 font-sans">
                We believe in the sanctity of human life from the moment of conception to the time of death. All human life is precious in the sight of God.
              </p>
              <p className="text-sm text-gray-600 italic font-sans">
                (Luke 1:15; Galatians 1:15; Psalm 22:10; 71:6; 139:13-14; Mark 8:36; Psalm 72:14; Isaiah 43:4)
              </p>
            </div>

            {/* Marriage and Family */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 font-sans">Marriage and Family</h2>
              <p className="text-base text-gray-700 leading-relaxed mb-4 font-sans">
                We believe that marriage and family are institutions ordained by the Lord God Himself from the very beginning of human history and these are sacred institutions. Marriage is between one man and one woman. Any other definition of marriage is contrary to the clear teachings of the Holy Bible and hence against the expressed will of God.
              </p>
              <p className="text-sm text-gray-600 italic mb-4 font-sans">
                (Genesis 1:27-28; 2:20b-24; Corinthians 7:2; Hebrews 13:4)
              </p>
              <p className="text-base text-gray-700 leading-relaxed mb-4 font-sans">
                We believe that God created men and women as sexual beings. Sexuality is an integral and beautiful part of creation. The Bible clearly teaches that any sexual act outside of marriage whether in thought, word, or deed is sin.
              </p>
              <p className="text-sm text-gray-600 italic mb-4 font-sans">
                (Genesis 1:27-28; Matthew 5:27-28; Proverbs 6:25-26; I Corinthians 6:9-10,18; I Thessalonians 4:3-8)
              </p>
              <p className="text-base text-gray-700 leading-relaxed mb-4 font-sans">
                We affirm that biological sex is a gift of God to every individual and to the human community to which that individual belongs. We believe that according to Scripture each person was intentionally woven together in their mother's womb.
              </p>
              <p className="text-sm text-gray-600 italic mb-4 font-sans">
                (Psalm 139:13)
              </p>
              <p className="text-base text-gray-700 leading-relaxed mb-4 font-sans">
                We believe that God wonderfully created each person as either male or female in conformity with their biological sex. These two distinct yet equal and complementary genders reflect the image and nature of God.
              </p>
              <p className="text-sm text-gray-600 italic mb-4 font-sans">
                (Genesis 1:26-27)
              </p>
              <p className="text-base text-gray-700 leading-relaxed mb-4 font-sans">
                We uncompromisingly hold, therefore, that to be born biologically male is to be male and to be born biologically female is to be female.
              </p>
              <p className="text-sm text-gray-600 italic font-sans">
                (Deuteronomy 23:1; Matthew 19:4; Romans 1:24-25; I Corinthians 6:19-20)
              </p>
            </div>

            {/* Unity in the Body of Christ */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 font-sans">Unity in the Body of Christ</h2>
              <p className="text-base text-gray-700 leading-relaxed mb-4 font-sans">
                We believe that unity regarding the foundational doctrines clearly taught in the Holy Bible is absolutely essential. At the same time, we also affirm that we must accept one another in the love of Jesus recognizing that there are different styles and expressions of worship. All the members of the Body do not look alike. Together, we are the Body of Christ, called to build the Kingdom in harmony and agape love.
              </p>
              <p className="text-sm text-gray-600 italic font-sans">
                (John 17:11; Romans 12:1-13; 14:1-23; Corinthians 12:4-6; 27-28; Ephesians 4:1-6)
              </p>
            </div>

            {/* Great Commission */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 font-sans">Great Commission</h2>
              <p className="text-base text-gray-700 leading-relaxed mb-4 font-sans">
                We believe in obeying the Great Commission in the spirit of the Great Commandment.
              </p>
              <p className="text-sm text-gray-600 italic font-sans">
                (Matthew 22:37, 38; 28:18-20; Mark 16:15; Luke 24:46-48; John 20:21; Acts 1:8)
              </p>
            </div>

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
          settings: {
            title: 'Forge Journal',
            description: []
          },
        },
        revalidate: 60,
      }
    }

    // Get published posts from Supabase
    const { data: posts, error: postsError } = await db.getPosts({
      status: 'published',
      limit: 10,
      includeAuthor: true
    })

    if (postsError) {
      console.error('Error fetching posts:', postsError)
      return {
        props: {
          posts: [],
          settings: {
            title: 'Forge Journal',
            description: []
          },
        },
        revalidate: 60,
      }
    }

    // Default settings
    const settings: Settings = {
      title: 'Forge Journal',
      description: []
    }

    // Ensure posts is an array of Post objects
    const validPosts: Post[] = []
    if (Array.isArray(posts)) {
      for (const post of posts) {
        try {
          if (post &&
              typeof post === 'object' &&
              typeof (post as any).id === 'string' &&
              typeof (post as any).title === 'string' &&
              typeof (post as any).slug === 'string') {
            validPosts.push(post as Post)
          }
        } catch (e) {
          // Skip invalid posts
        }
      }
    }

    return {
      props: {
        posts: validPosts,
        settings,
      },
      revalidate: 60, // Revalidate every minute
    }
  } catch (error) {
    console.error('Error in getStaticProps:', error)
    return {
      props: {
        posts: [],
        settings: {
          title: 'Forge Journal',
          description: []
        },
      },
      revalidate: 60,
    }
  }
}
