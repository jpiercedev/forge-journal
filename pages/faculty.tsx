import Container from 'components/BlogContainer'
import Header from 'components/BlogHeader'
import Layout from 'components/BlogLayout'
import { readToken } from 'lib/sanity.api'
import { getClient, getSettings } from 'lib/sanity.client'
import { Settings } from 'lib/sanity.queries'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import type { SharedPageProps } from 'pages/_app'
import * as demo from 'lib/demo.data'

interface PageProps extends SharedPageProps {
  settings: Settings
}

const facultyMembers = [
  {
    name: 'Alex Thompson',
    role: 'Senior Technology Writer',
    bio: 'Alex is a seasoned developer and writer with over 10 years of experience in web development. Specializes in modern JavaScript frameworks and AI integration.',
    expertise: ['Web Development', 'AI & ML', 'JavaScript', 'React'],
    posts: 15,
    image: '/api/placeholder/150/150', // Placeholder for now
  },
  {
    name: 'Sarah Chen',
    role: 'UX Design Lead',
    bio: 'Sarah brings a unique perspective to design and user experience, with a background in psychology and human-computer interaction.',
    expertise: ['UI/UX Design', 'User Research', 'Design Systems', 'Accessibility'],
    posts: 12,
    image: '/api/placeholder/150/150',
  },
  {
    name: 'Marcus Rodriguez',
    role: 'DevOps Engineer',
    bio: 'Marcus is passionate about infrastructure, automation, and helping teams deploy better software faster.',
    expertise: ['DevOps', 'Cloud Computing', 'Docker', 'Kubernetes'],
    posts: 8,
    image: '/api/placeholder/150/150',
  },
  {
    name: 'Emily Watson',
    role: 'Data Science Researcher',
    bio: 'Emily explores the intersection of data science and practical applications, making complex topics accessible to everyone.',
    expertise: ['Data Science', 'Machine Learning', 'Python', 'Analytics'],
    posts: 10,
    image: '/api/placeholder/150/150',
  },
  {
    name: 'David Kim',
    role: 'Mobile Development Expert',
    bio: 'David has been building mobile applications for over 8 years and loves sharing insights about mobile development trends.',
    expertise: ['Mobile Development', 'React Native', 'iOS', 'Android'],
    posts: 7,
    image: '/api/placeholder/150/150',
  },
  {
    name: 'Lisa Park',
    role: 'Open Source Advocate',
    bio: 'Lisa is a strong advocate for open source software and community-driven development. She contributes to multiple OSS projects.',
    expertise: ['Open Source', 'Community Building', 'Git', 'Collaboration'],
    posts: 9,
    image: '/api/placeholder/150/150',
  },
]

export default function FacultyPage(props: PageProps) {
  const { settings, draftMode } = props
  const { title = demo.title } = settings || {}

  return (
    <>
      <Head>
        <title>Faculty | {title}</title>
        <meta name="description" content="Meet our team of expert writers and contributors who share their knowledge and insights on Forge Journal." />
      </Head>

      <Layout preview={draftMode} loading={false}>
        <Container>
          <Header title={title} level={2} />
          <article className="mx-auto max-w-6xl">
            <header className="mb-12 text-center">
              <h1 className="text-4xl font-bold tracking-tight mb-4">Our Faculty</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Meet our team of expert writers, developers, and thought leaders who contribute their knowledge 
                and insights to help you grow in your journey.
              </p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {facultyMembers.map((member) => (
                <div
                  key={member.name}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="text-center mb-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-500">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-blue-600 font-medium text-sm mb-2">
                      {member.role}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {member.posts} posts published
                    </p>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {member.bio}
                  </p>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Expertise:</h4>
                    <div className="flex flex-wrap gap-1">
                      {member.expertise.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <Link
                    href={`/authors/${member.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View posts by {member.name.split(' ')[0]} →
                  </Link>
                </div>
              ))}
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Join Our Faculty</h2>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Are you an expert in your field with insights to share? We're always looking for 
                  passionate writers and educators to join our faculty and contribute to our community.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/support"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Apply to Write
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </article>
        </Container>
      </Layout>
    </>
  )
}

export const getStaticProps: GetStaticProps<PageProps> = async (ctx) => {
  const { draftMode = false } = ctx
  const client = getClient(draftMode ? { token: readToken } : undefined)

  const settings = await getSettings(client)

  return {
    props: {
      settings,
      draftMode,
      token: draftMode ? readToken : '',
    },
  }
}
