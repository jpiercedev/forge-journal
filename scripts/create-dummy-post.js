const { createClient } = require('@sanity/client')
const { v4: uuidv4 } = require('uuid')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2025-02-27',
  useCdn: false,
})

async function createDummyContent() {
  try {
    console.log('Creating dummy author and blog post...')

    // First, create an author
    const authorId = uuidv4()
    const author = {
      _id: authorId,
      _type: 'author',
      name: 'Alex Thompson',
      picture: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: 'image-placeholder', // This would need to be a real image asset
        },
        alt: 'Alex Thompson - Tech Writer and Developer',
      },
    }

    // Create the author document
    const createdAuthor = await client.create(author)
    console.log('✅ Author created:', createdAuthor.name)

    // Create a blog post with rich content
    const postId = uuidv4()
    const post = {
      _id: postId,
      _type: 'post',
      title: 'The Future of Web Development: Embracing Modern Technologies',
      slug: {
        _type: 'slug',
        current: 'future-of-web-development-modern-technologies',
      },
      excerpt: 'Exploring the latest trends and technologies shaping the future of web development, from AI integration to edge computing and beyond.',
      date: new Date().toISOString(),
      author: {
        _type: 'reference',
        _ref: authorId,
      },
      content: [
        {
          _type: 'block',
          _key: uuidv4(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: uuidv4(),
              text: 'The landscape of web development is evolving at an unprecedented pace. As we forge ahead into 2025, developers are witnessing a paradigm shift that\'s reshaping how we build, deploy, and interact with web applications.',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: uuidv4(),
          style: 'h2',
          children: [
            {
              _type: 'span',
              _key: uuidv4(),
              text: 'The Rise of AI-Powered Development',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: uuidv4(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: uuidv4(),
              text: 'Artificial Intelligence is no longer a futuristic concept—it\'s actively transforming how we write code. From ',
              marks: [],
            },
            {
              _type: 'span',
              _key: uuidv4(),
              text: 'GitHub Copilot',
              marks: ['strong'],
            },
            {
              _type: 'span',
              _key: uuidv4(),
              text: ' to advanced code completion tools, AI is becoming an indispensable coding companion.',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: uuidv4(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: uuidv4(),
              text: 'Key benefits of AI in development include:',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: uuidv4(),
          style: 'normal',
          listItem: 'bullet',
          children: [
            {
              _type: 'span',
              _key: uuidv4(),
              text: 'Accelerated code generation and debugging',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: uuidv4(),
          style: 'normal',
          listItem: 'bullet',
          children: [
            {
              _type: 'span',
              _key: uuidv4(),
              text: 'Intelligent code suggestions and refactoring',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: uuidv4(),
          style: 'normal',
          listItem: 'bullet',
          children: [
            {
              _type: 'span',
              _key: uuidv4(),
              text: 'Automated testing and quality assurance',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: uuidv4(),
          style: 'h2',
          children: [
            {
              _type: 'span',
              _key: uuidv4(),
              text: 'Edge Computing and Performance',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: uuidv4(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: uuidv4(),
              text: 'The shift towards edge computing is revolutionizing web performance. By processing data closer to users, we\'re achieving:',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: uuidv4(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: uuidv4(),
              text: '⚡ Lightning-fast response times',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: uuidv4(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: uuidv4(),
              text: '🌍 Global scalability with reduced latency',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: uuidv4(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: uuidv4(),
              text: '💰 Cost-effective infrastructure solutions',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: uuidv4(),
          style: 'h2',
          children: [
            {
              _type: 'span',
              _key: uuidv4(),
              text: 'The Component-Driven Future',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: uuidv4(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: uuidv4(),
              text: 'Modern frameworks like ',
              marks: [],
            },
            {
              _type: 'span',
              _key: uuidv4(),
              text: 'React',
              marks: ['strong'],
            },
            {
              _type: 'span',
              _key: uuidv4(),
              text: ', ',
              marks: [],
            },
            {
              _type: 'span',
              _key: uuidv4(),
              text: 'Vue',
              marks: ['strong'],
            },
            {
              _type: 'span',
              _key: uuidv4(),
              text: ', and ',
              marks: [],
            },
            {
              _type: 'span',
              _key: uuidv4(),
              text: 'Svelte',
              marks: ['strong'],
            },
            {
              _type: 'span',
              _key: uuidv4(),
              text: ' continue to evolve, emphasizing reusable components and declarative programming patterns.',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: uuidv4(),
          style: 'blockquote',
          children: [
            {
              _type: 'span',
              _key: uuidv4(),
              text: '"The future belongs to developers who can adapt quickly to new technologies while maintaining a strong foundation in core principles." - Industry Expert',
              marks: ['em'],
            },
          ],
        },
        {
          _type: 'block',
          _key: uuidv4(),
          style: 'h2',
          children: [
            {
              _type: 'span',
              _key: uuidv4(),
              text: 'Looking Ahead',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: uuidv4(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: uuidv4(),
              text: 'As we continue to forge new paths in web development, the key is to stay curious, keep learning, and embrace the tools that make us more productive and creative. The future is bright for developers who are willing to evolve with the technology.',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          _key: uuidv4(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: uuidv4(),
              text: 'What technologies are you most excited about? Share your thoughts and let\'s discuss the future of web development together!',
              marks: [],
            },
          ],
        },
      ],
    }

    // Create the blog post
    const createdPost = await client.create(post)
    console.log('✅ Blog post created:', createdPost.title)
    console.log('🔗 Slug:', createdPost.slug.current)
    console.log('📅 Date:', new Date(createdPost.date).toLocaleDateString())

    console.log('\n🎉 Dummy content created successfully!')
    console.log('You can now view your blog post at: http://localhost:3000/posts/' + createdPost.slug.current)
    console.log('Or edit it in Sanity Studio at: http://localhost:3000/studio')

  } catch (error) {
    console.error('❌ Error creating dummy content:', error)
  }
}

createDummyContent()
