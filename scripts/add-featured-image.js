const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-02-27',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

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
              filename: `cover-future-web-dev-${Date.now()}.jpg`
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

async function addFeaturedImageToArticle() {
  console.log('Starting to add featured image to existing article...');
  
  try {
    // First, find the article by title
    const article = await client.fetch(
      `*[_type == "post" && title == $title][0]`,
      { title: "The Future of Web Development: Embracing Modern Technologies" }
    );
    
    if (!article) {
      console.error('❌ Article not found!');
      return;
    }
    
    console.log(`✅ Found article: ${article.title} (ID: ${article._id})`);
    
    // Check if it already has a cover image
    if (article.coverImage) {
      console.log('ℹ️ Article already has a cover image. Updating it...');
    }
    
    // Upload a relevant technology/web development image from Unsplash
    const imageUrl = "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=675&fit=crop&crop=center";
    const imageAlt = "Modern web development workspace with code on multiple screens";
    
    console.log('📸 Uploading featured image...');
    const coverImage = await uploadImageFromUrl(imageUrl, imageAlt);
    
    if (!coverImage) {
      console.error('❌ Failed to upload image');
      return;
    }
    
    console.log('✅ Image uploaded successfully');
    
    // Update the article with the new cover image
    const updatedArticle = await client
      .patch(article._id)
      .set({ coverImage: coverImage })
      .commit();
    
    console.log(`✅ Successfully added featured image to article: ${updatedArticle.title}`);
    
  } catch (error) {
    console.error('❌ Error adding featured image:', error);
  }
}

// Run the script
addFeaturedImageToArticle().catch(console.error);
