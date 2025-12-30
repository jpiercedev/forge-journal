import ForgeLayout from 'components/ForgeLayout'
import { db, type Post } from 'lib/supabase/client'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import type { SharedPageProps } from 'pages/_app'

interface Settings {
  title: string
  description: any[]
}

interface PageProps extends SharedPageProps {
  posts: Post[]
  settings: Settings
}

export default function SupportPage(props: PageProps) {
  const { posts } = props

  const handleDonateClick = () => {
    window.open('https://deka.gives/grace-community-church-woodlands', '_blank')
  }

  return (
    <>
      <Head>
        <title>Partner with FORGE - The Forge Journal</title>
        <meta name="description" content="Partner with FORGE to shape pastors who will shape the nation. Your support helps equip church leaders with biblical resources and training." />
        <meta property="og:title" content="Partner with FORGE - The Forge Journal" />
        <meta property="og:description" content="Partner with FORGE to shape pastors who will shape the nation. Your support helps equip church leaders with biblical resources and training." />
        <meta property="og:image" content="https://theforgejournal.com/images/contributors/4e0707f3-0a44-4e6a-99ba-96fcf1106bf6.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://theforgejournal.com/support" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Partner with FORGE - The Forge Journal" />
        <meta name="twitter:description" content="Partner with FORGE to shape pastors who will shape the nation. Your support helps equip church leaders with biblical resources and training." />
        <meta name="twitter:image" content="https://theforgejournal.com/images/contributors/4e0707f3-0a44-4e6a-99ba-96fcf1106bf6.jpg" />
      </Head>

      <ForgeLayout
        preview={false}
        loading={false}
        recentPosts={posts.slice(0, 3)}
        showSidebar={true}
      >
        <div>
          {/* Header Banner - Desktop: Partner with FORGE, Mobile: Donate Button */}
          <div className="mb-8">
            {/* Desktop Header - Teal */}
            <div className="hidden md:block py-4 px-6 mb-8 border-t-4 border-b-4 shadow-lg" style={{ backgroundColor: '#1e4356', borderColor: '#163344' }}>
              <h2 className="text-xl md:text-2xl font-bold text-center font-sans uppercase tracking-wide text-white">
                Partner with FORGE
              </h2>
            </div>
            {/* Mobile Donate Button - Red */}
            <div className="md:hidden mb-8">
              <button
                onClick={handleDonateClick}
                className="w-full text-white px-6 py-4 text-lg font-bold uppercase tracking-wider transition-all duration-200 font-sans border-2 shadow-lg"
                style={{ backgroundColor: '#B91C1C', borderColor: '#B91C1C' }}
              >
                Click to Donate
              </button>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6 font-sans">
              Will you partner with us today to save our nation?
            </h1>
            <div className="border-b-4 border-gray-900 w-16 mb-8"></div>
          </div>

          {/* Hero Section with Image */}
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="prose prose-lg max-w-none">
              <p className="text-base text-gray-700 leading-relaxed mb-6 font-sans">
                The Forge pastoral training program (based in The Woodlands, Texas) is shaping pastors who will shape the nation — to stand with courage and proclaim the whole counsel of God without compromise! We&apos;re raising up men and women from all backgrounds—united by a common call with an uncommon commitment to a great cause. We believe the Forge model of pastoral training has the potential to turn the tide and help save our nation.
              </p>
              <p className="text-base text-gray-700 leading-relaxed mb-6 font-sans font-semibold">
                FORGE is only possible because of financial partners who support this vital ministry.
              </p>
              <p className="text-lg text-gray-900 leading-relaxed mb-6 font-sans font-bold italic">
                Please become a FORGE partner today!
              </p>
            </div>
            <div className="relative">
              <Image
                src="/images/contributors/4e0707f3-0a44-4e6a-99ba-96fcf1106bf6.jpg"
                alt="FORGE Pastoral Training"
                width={500}
                height={300}
                className="w-full h-auto rounded-lg shadow-lg object-cover"
              />
            </div>
          </div>

          {/* Donate Button - Uses red to differentiate from header */}
          <div className="mb-8">
            <button
              onClick={handleDonateClick}
              className="w-full text-white px-8 py-5 text-xl font-bold uppercase tracking-wider transition-all duration-200 font-sans border-2 shadow-lg hover:bg-transparent"
              style={{ backgroundColor: '#B91C1C', borderColor: '#B91C1C' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#B91C1C';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#B91C1C';
                e.currentTarget.style.color = 'white';
              }}
            >
              Click to Donate
            </button>
          </div>

          {/* Content Section */}
          <div className="bg-white p-6 md:p-8 shadow-sm border border-gray-200 mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 font-sans uppercase tracking-wide">
              Our Greatest Need...
            </h2>
            <p className="text-base text-gray-700 leading-relaxed mb-6 font-sans font-semibold">
              MONTHLY PARTNERS—people like you who will stand with FORGE at $100, $500, or $1,500 per month.
            </p>
            <p className="text-base text-gray-600 leading-relaxed mb-8 font-sans italic">
              Your ongoing support provides the foundation that allows us to equip pastors with these resources—completely free of charge to them!
            </p>

            <h3 className="text-lg font-bold text-gray-900 mb-4 font-sans">
              Or you make a one-time gift...
            </h3>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-red-700 font-bold text-lg mr-3">•</span>
                <p className="text-base text-gray-700 font-sans">
                  <strong className="text-gray-900">$100</strong> equips a pastor with basic resources and one week of training.
                </p>
              </li>
              <li className="flex items-start">
                <span className="text-red-700 font-bold text-lg mr-3">•</span>
                <p className="text-base text-gray-700 font-sans">
                  <strong className="text-gray-900">$500</strong> provides a month of ministry resources and training.
                </p>
              </li>
              <li className="flex items-start">
                <span className="text-red-700 font-bold text-lg mr-3">•</span>
                <p className="text-base text-gray-700 font-sans">
                  <strong className="text-gray-900">$1,500</strong> sponsors one pastoral couple through a multi-day onsite intensive that will transform their ministry—and their city.
                </p>
              </li>
            </ul>

            {/* Other Giving Section */}
            <div className="bg-gray-50 p-6 border border-gray-200 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 font-sans uppercase tracking-wide">
                Other Giving / Planning Gifts
              </h3>
              <p className="text-base text-gray-700 leading-relaxed mb-4 font-sans">
                To give stocks, bonds, mutual funds, real estate, or legacy gifts, call the church office{' '}
                <a href="tel:+8323812306" className="text-blue-700 hover:text-blue-900 font-semibold">(832) 381-2306</a>,
                email <a href="mailto:legacy@gracewoodlands.com" className="text-blue-700 hover:text-blue-900 font-semibold">legacy@gracewoodlands.com</a>,
                or visit our{' '}
                <a
                  href="http://gm.giftlegacy.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:text-blue-900 font-semibold underline"
                >
                  Legacy Giving Website
                </a>.
              </p>
              <p className="text-sm text-gray-600 font-sans">
                FORGE is a ministry of Grace Woodlands and all gifts are tax-deductible.
              </p>
            </div>

            {/* Urgency Section */}
            <div className="bg-red-50 p-6 border-l-4 border-red-700 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-2 font-sans uppercase">
                The Need is Urgent.
              </h3>
              <p className="text-base text-gray-700 leading-relaxed mb-4 font-sans">
                There is a window of opportunity open right now in our nation—but it might not stay open forever.
              </p>
              <p className="text-base text-gray-900 leading-relaxed font-sans font-bold">
                Your gift today ensures pastors are prepared to lead with both a Bible... and a backbone.
              </p>
            </div>

            {/* Thank You */}
            <p className="text-lg text-gray-900 leading-relaxed font-sans font-bold text-center">
              We are deeply grateful for your partnership in FORGE.
            </p>
          </div>

          {/* Contact Section */}
          <div className="bg-gray-50 p-6 border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Image
                  src="https://uvnbfnobyqbonuxztjuz.supabase.co/storage/v1/object/public/assets/logo-horizontal.png"
                  alt="The Forge Journal"
                  width={150}
                  height={40}
                  className="h-10 w-auto"
                />
                <a
                  href="https://theforgejournal.com"
                  className="text-blue-700 hover:text-blue-900 font-sans font-medium"
                >
                  TheForgeJournal.com
                </a>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 text-gray-700 font-sans">
                <a href="mailto:forge@gracewoodlands.com" className="text-blue-700 hover:text-blue-900">
                  forge@gracewoodlands.com
                </a>
                <a href="tel:+8323812306" className="text-blue-700 hover:text-blue-900">
                  (832) 381-2306
                </a>
              </div>
            </div>
          </div>
        </div>
      </ForgeLayout>
    </>
  )
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  try {
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

    const settings: Settings = {
      title: 'Forge Journal',
      description: []
    }

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
      revalidate: 60,
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
