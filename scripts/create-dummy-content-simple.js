const { createClient } = require('@sanity/client')

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
    console.log('🚀 Creating dummy content for Forge Journal...')
    
    // Check if we have a write token
    if (!process.env.SANITY_API_WRITE_TOKEN) {
      console.log('❌ No SANITY_API_WRITE_TOKEN found in .env.local')
      console.log('📝 To create content programmatically, you need to:')
      console.log('   1. Go to https://manage.sanity.io')
      console.log('   2. Select your project')
      console.log('   3. Go to API > Tokens')
      console.log('   4. Create a new token with "Editor" permissions')
      console.log('   5. Add it to your .env.local file as SANITY_API_WRITE_TOKEN=your_token_here')
      console.log('')
      console.log('🎨 Alternatively, you can create content manually in Sanity Studio:')
      console.log('   👉 Open http://localhost:3000/studio')
      console.log('   👉 Click "Create" and select "Post"')
      console.log('   👉 Use the sample data from dummy-data/sample-blog-post.json')
      return
    }

    // First, create an author
    console.log('👤 Creating author...')
    const author = await client.create({
      _type: 'author',
      name: 'Alex Thompson',
      picture: {
        _type: 'image',
        // Note: You'll need to upload an image through the Studio for this to work
        alt: 'Alex Thompson - Tech Writer and Developer',
      },
    })
    console.log('✅ Author created:', author.name)

    // Create a blog post with rich content
    console.log('📝 Creating blog post...')
    const post = await client.create({
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
        _ref: author._id,
      },
      content: [
        {
          _type: 'block',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'The landscape of web development is evolving at an unprecedented pace. As we forge ahead into 2025, developers are witnessing a paradigm shift that\'s reshaping how we build, deploy, and interact with web applications.',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          style: 'h2',
          children: [
            {
              _type: 'span',
              text: 'The Rise of AI-Powered Development',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Artificial Intelligence is no longer a futuristic concept—it\'s actively transforming how we write code. From ',
              marks: [],
            },
            {
              _type: 'span',
              text: 'GitHub Copilot',
              marks: ['strong'],
            },
            {
              _type: 'span',
              text: ' to advanced code completion tools, AI is becoming an indispensable coding companion.',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Key benefits of AI in development include:',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          style: 'normal',
          listItem: 'bullet',
          children: [
            {
              _type: 'span',
              text: 'Accelerated code generation and debugging',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          style: 'normal',
          listItem: 'bullet',
          children: [
            {
              _type: 'span',
              text: 'Intelligent code suggestions and refactoring',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          style: 'normal',
          listItem: 'bullet',
          children: [
            {
              _type: 'span',
              text: 'Automated testing and quality assurance',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          style: 'h2',
          children: [
            {
              _type: 'span',
              text: 'Edge Computing and Performance',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'The shift towards edge computing is revolutionizing web performance. By processing data closer to users, we\'re achieving lightning-fast response times, global scalability with reduced latency, and cost-effective infrastructure solutions.',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          style: 'blockquote',
          children: [
            {
              _type: 'span',
              text: '"The future belongs to developers who can adapt quickly to new technologies while maintaining a strong foundation in core principles." - Industry Expert',
              marks: ['em'],
            },
          ],
        },
        {
          _type: 'block',
          style: 'h2',
          children: [
            {
              _type: 'span',
              text: 'Looking Ahead',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'As we continue to forge new paths in web development, the key is to stay curious, keep learning, and embrace the tools that make us more productive and creative. The future is bright for developers who are willing to evolve with the technology.',
              marks: [],
            },
          ],
        },
        {
          _type: 'block',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'What technologies are you most excited about? Share your thoughts and let\'s discuss the future of web development together!',
              marks: [],
            },
          ],
        },
      ],
    })

    console.log('✅ Blog post created successfully!')
    console.log('📄 Title:', post.title)
    console.log('🔗 Slug:', post.slug.current)
    console.log('📅 Date:', new Date(post.date).toLocaleDateString())
    console.log('')
    console.log('🎉 You can now view your blog post at:')
    console.log('   👉 Frontend: http://localhost:3000/posts/' + post.slug.current)
    console.log('   👉 Studio: http://localhost:3000/studio')

  } catch (error) {
    console.error('❌ Error creating dummy content:', error.message)
    if (error.message.includes('Insufficient permissions')) {
      console.log('💡 Make sure your SANITY_API_WRITE_TOKEN has "Editor" permissions')
    }
  }
}

// Run the script
createDummyContent()
