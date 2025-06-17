const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-02-27',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// Test articles data
const testArticles = [
  {
    title: "Building Resilient Church Communities in Times of Crisis",
    slug: "building-resilient-church-communities-crisis",
    excerpt: "Discover practical strategies for strengthening your congregation's unity and faith during challenging seasons. Learn how biblical principles can guide your community through uncertainty and emerge stronger together.",
    content: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'In an era marked by unprecedented challenges—from global pandemics to social upheaval—church leaders find themselves navigating uncharted waters. The question isn\'t whether our communities will face crisis, but how we\'ll respond when they do.'
          }
        ],
        style: 'normal'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'The Foundation of Resilience',
            marks: ['strong']
          }
        ],
        style: 'h2'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Resilient church communities don\'t emerge by accident. They are built on the solid foundation of biblical truth, authentic relationships, and intentional discipleship. When storms come, these communities bend but don\'t break because their roots run deep.'
          }
        ],
        style: 'normal'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Scripture reminds us in Ephesians 4:16 that the body of Christ grows and builds itself up in love as each part does its work. This interconnectedness becomes our strength in times of trial.'
          }
        ],
        style: 'normal'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Practical Steps for Building Resilience',
            marks: ['strong']
          }
        ],
        style: 'h2'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'First, prioritize transparent communication. Your congregation needs to hear from leadership regularly, especially during uncertain times. Share both struggles and victories, creating an atmosphere where authenticity is valued over perfection.'
          }
        ],
        style: 'normal'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Second, invest in small group ministry. Large gatherings may be disrupted, but smaller communities can adapt more quickly and provide the personal care that people desperately need during crisis.'
          }
        ],
        style: 'normal'
      }
    ],
    coverImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=675&fit=crop&crop=center",
    coverImageAlt: "People holding hands in prayer circle",
    authorName: "Dr. Michael Harrison",
    date: "2025-01-15T10:00:00.000Z"
  },
  {
    title: "The Art of Biblical Preaching: Connecting Ancient Truth to Modern Hearts",
    slug: "art-biblical-preaching-ancient-truth-modern-hearts",
    excerpt: "Master the delicate balance of faithful exposition and relevant application. Explore time-tested methods for making God's Word come alive for today's congregation while maintaining theological integrity.",
    content: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Every Sunday, pastors across the nation face the same sacred challenge: how do we faithfully communicate God\'s eternal Word to people living in a rapidly changing world? The art of biblical preaching requires both deep reverence for Scripture and genuine understanding of our contemporary context.'
          }
        ],
        style: 'normal'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'The Preacher\'s Primary Calling',
            marks: ['strong']
          }
        ],
        style: 'h2'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Before we consider methodology or technique, we must remember our fundamental calling: to be faithful stewards of God\'s Word. As Paul charged Timothy, we are to "preach the word; be ready in season and out of season" (2 Timothy 4:2).'
          }
        ],
        style: 'normal'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'This means our first responsibility is not to be clever or entertaining, but to be accurate. We must allow the text to speak on its own terms before we attempt to apply it to contemporary life.'
          }
        ],
        style: 'normal'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Building Bridges, Not Walls',
            marks: ['strong']
          }
        ],
        style: 'h2'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Effective biblical preaching builds bridges between the ancient world of Scripture and the modern world of our hearers. This requires careful study of both the historical context of the passage and the cultural context of our congregation.'
          }
        ],
        style: 'normal'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Consider using contemporary illustrations that illuminate rather than overshadow the biblical text. The goal is to help people see how God\'s truth applies to their daily struggles, relationships, and decisions.'
          }
        ],
        style: 'normal'
      }
    ],
    coverImageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=675&fit=crop&crop=center",
    coverImageAlt: "Open Bible on wooden pulpit with soft lighting",
    authorName: "Rev. Sarah Chen",
    date: "2025-01-08T09:30:00.000Z"
  },
  {
    title: "Shepherding the Next Generation: Youth Ministry in a Digital Age",
    slug: "shepherding-next-generation-youth-ministry-digital-age",
    excerpt: "Navigate the unique challenges of ministering to digital natives while maintaining biblical foundations. Learn innovative approaches to engage young people without compromising the timeless truths of faith.",
    content: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Today\'s teenagers live in a world that would be unrecognizable to previous generations. They are digital natives, constantly connected, and facing pressures that require new approaches to ministry while maintaining unchanging biblical truths.'
          }
        ],
        style: 'normal'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Understanding the Digital Generation',
            marks: ['strong']
          }
        ],
        style: 'h2'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Generation Z has never known a world without the internet. They process information differently, communicate through multiple platforms simultaneously, and often struggle with anxiety and depression at unprecedented rates.'
          }
        ],
        style: 'normal'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Yet beneath the digital exterior, their hearts cry out for the same things every generation has needed: authentic relationships, purpose, and hope. Our challenge is to meet them where they are while pointing them to eternal truth.'
          }
        ],
        style: 'normal'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Practical Ministry Strategies',
            marks: ['strong']
          }
        ],
        style: 'h2'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'First, embrace technology as a tool, not a master. Use social media, apps, and digital platforms to enhance relationships and communication, but never let them replace face-to-face discipleship.'
          }
        ],
        style: 'normal'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Second, create spaces for authentic conversation. Young people are hungry for real talk about real issues. Don\'t shy away from difficult topics—address them with biblical wisdom and pastoral care.'
          }
        ],
        style: 'normal'
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Finally, invest in long-term relationships. Youth ministry isn\'t about entertaining teenagers—it\'s about walking alongside them as they discover their identity in Christ and learn to live out their faith in a complex world.'
          }
        ],
        style: 'normal'
      }
    ],
    coverImageUrl: "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=1200&h=675&fit=crop&crop=center",
    coverImageAlt: "Young people in discussion circle with mentor",
    authorName: "Pastor David Rodriguez",
    date: "2025-01-22T14:15:00.000Z"
  }
];

async function createAuthorIfNotExists(authorName) {
  // Check if author already exists
  const existingAuthor = await client.fetch(
    `*[_type == "author" && name == $name][0]`,
    { name: authorName }
  );

  if (existingAuthor) {
    return existingAuthor._id;
  }

  // Upload a placeholder author image
  const authorImageUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face";
  const authorImage = await uploadImageFromUrl(authorImageUrl, `Portrait of ${authorName}`);

  // Create new author
  const author = await client.create({
    _type: 'author',
    name: authorName,
    picture: authorImage
  });

  return author._id;
}

async function uploadImageFromUrl(imageUrl, alt) {
  try {
    const https = require('https');
    const http = require('http');

    return new Promise((resolve, reject) => {
      const protocol = imageUrl.startsWith('https:') ? https : http;

      protocol.get(imageUrl, (response) => {
        const chunks = [];

        response.on('data', (chunk) => {
          chunks.push(chunk);
        });

        response.on('end', async () => {
          try {
            const buffer = Buffer.concat(chunks);

            const asset = await client.assets.upload('image', buffer, {
              filename: `image-${Date.now()}.jpg`
            });

            resolve({
              _type: 'image',
              asset: {
                _type: 'reference',
                _ref: asset._id
              },
              alt: alt
            });
          } catch (uploadError) {
            reject(uploadError);
          }
        });

        response.on('error', reject);
      }).on('error', reject);
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

async function createTestArticles() {
  console.log('Starting to create test articles...');
  
  for (const article of testArticles) {
    try {
      console.log(`Creating article: ${article.title}`);
      
      // Create or get author
      const authorId = await createAuthorIfNotExists(article.authorName);
      
      // Upload cover image
      const coverImage = await uploadImageFromUrl(article.coverImageUrl, article.coverImageAlt);
      
      // Create the post
      const post = await client.create({
        _type: 'post',
        title: article.title,
        slug: {
          _type: 'slug',
          current: article.slug
        },
        excerpt: article.excerpt,
        content: article.content,
        coverImage: coverImage,
        date: article.date,
        author: {
          _type: 'reference',
          _ref: authorId
        }
      });
      
      console.log(`✅ Created article: ${post.title}`);
      
    } catch (error) {
      console.error(`❌ Error creating article "${article.title}":`, error);
    }
  }
  
  console.log('Finished creating test articles!');
}

// Run the script
createTestArticles().catch(console.error);
