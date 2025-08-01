/**
 * This component renders post content from both legacy Sanity and new Supabase formats.
 *
 * Legacy Sanity format uses Portable Text.
 * New Supabase format uses a custom JSON structure from Smart Import.
 */
import React from 'react'
import Image from 'next/image'

// Simple portable text renderer for legacy Sanity content
function SimplePortableText({ value, components }: { value: any[], components?: any }) {
  if (!value || !Array.isArray(value)) {
    return null
  }

  return (
    <div>
      {value.map((block, index) => {
        if (block._type === 'block') {
          const Tag = block.style === 'h1' ? 'h1' :
                     block.style === 'h2' ? 'h2' :
                     block.style === 'h3' ? 'h3' :
                     block.style === 'h4' ? 'h4' : 'p'

          return (
            <Tag key={index} className="mb-4 font-sans">
              {block.children?.map((child: any, childIndex: number) => {
                if (child.marks?.includes('strong')) {
                  return <strong key={childIndex}>{child.text}</strong>
                }
                if (child.marks?.includes('em')) {
                  return <em key={childIndex}>{child.text}</em>
                }
                return child.text
              })}
            </Tag>
          )
        }

        if (block._type === 'image' && components?.types?.image) {
          return <div key={index}>{components.types.image({ value: block })}</div>
        }

        return null
      })}
    </div>
  )
}

// Renderer for new Supabase content format from Smart Import
function SupabaseContentRenderer({ content }: { content: any }) {
  if (!content || !content.content || !Array.isArray(content.content)) {
    return null
  }

  return (
    <div className="px-4 md:px-0">
      {content.content.map((block: any, index: number) => {
        switch (block.type) {
          case 'heading':
            const level = Math.min(block.attrs?.level || 2, 6)
            const headingContent = block.content?.map((textNode: any, textIndex: number) => (
              <span key={textIndex}>{textNode.text}</span>
            ))

            switch (level) {
              case 1:
                return <h1 key={index} className="mb-4 font-sans font-bold text-gray-900">{headingContent}</h1>
              case 2:
                return <h2 key={index} className="mb-4 font-sans font-bold text-gray-900">{headingContent}</h2>
              case 3:
                return <h3 key={index} className="mb-4 font-sans font-bold text-gray-900">{headingContent}</h3>
              case 4:
                return <h4 key={index} className="mb-4 font-sans font-bold text-gray-900">{headingContent}</h4>
              case 5:
                return <h5 key={index} className="mb-4 font-sans font-bold text-gray-900">{headingContent}</h5>
              case 6:
                return <h6 key={index} className="mb-4 font-sans font-bold text-gray-900">{headingContent}</h6>
              default:
                return <h2 key={index} className="mb-4 font-sans font-bold text-gray-900">{headingContent}</h2>
            }

          case 'paragraph':
            return (
              <p key={index} className="mb-4 text-base md:text-lg text-gray-700 leading-relaxed font-sans">
                {block.content?.map((textNode: any, textIndex: number) => (
                  <span key={textIndex}>{textNode.text}</span>
                ))}
              </p>
            )

          case 'bullet_list':
            return (
              <ul key={index} className="mb-4 list-disc list-inside font-sans">
                {block.content?.map((listItem: any, itemIndex: number) => (
                  <li key={itemIndex} className="mb-2 text-gray-700">
                    {listItem.content?.[0]?.content?.map((textNode: any, textIndex: number) => (
                      <span key={textIndex}>{textNode.text}</span>
                    ))}
                  </li>
                ))}
              </ul>
            )

          case 'ordered_list':
            return (
              <ol key={index} className="mb-4 list-decimal list-inside font-sans">
                {block.content?.map((listItem: any, itemIndex: number) => (
                  <li key={itemIndex} className="mb-2 text-gray-700">
                    {listItem.content?.[0]?.content?.map((textNode: any, textIndex: number) => (
                      <span key={textIndex}>{textNode.text}</span>
                    ))}
                  </li>
                ))}
              </ol>
            )

          case 'blockquote':
            return (
              <blockquote key={index} className="mb-4 pl-4 border-l-4 border-gray-300 italic text-gray-700 font-sans">
                {block.content?.map((subBlock: any, subIndex: number) => {
                  if (subBlock.type === 'paragraph') {
                    return (
                      <p key={subIndex} className="mb-2">
                        {subBlock.content?.map((textNode: any, textIndex: number) => (
                          <span key={textIndex}>{textNode.text}</span>
                        ))}
                      </p>
                    )
                  }
                  return null
                })}
              </blockquote>
            )

          case 'image':
            return (
              <div key={index} className="my-6">
                <Image
                  src={block.attrs?.src || ''}
                  alt={block.attrs?.alt || ''}
                  width={800}
                  height={600}
                  className="w-full h-auto rounded-lg"
                />
                {block.attrs?.title && (
                  <p className="text-sm text-gray-600 text-center mt-2 font-sans italic">
                    {block.attrs.title}
                  </p>
                )}
              </div>
            )

          default:
            return null
        }
      })}
    </div>
  )
}

const myPortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (value?.url) {
        return (
          <div className="my-6">
            <Image
              src={value.url}
              alt={value.alt || ''}
              width={800}
              height={600}
              className="w-full h-auto rounded-lg"
            />
          </div>
        )
      }
      return null
    },
  },
}

export default function PostBody({ content }) {
  // Determine content format and render accordingly
  if (!content) {
    return null
  }

  // Debug: Log the content to see what format it's in
  console.log('PostBody content:', content)
  console.log('PostBody content type:', typeof content)

  // If content is a string that looks like JSON, try to parse it
  if (typeof content === 'string' && (content.startsWith('{') || content.startsWith('['))) {
    try {
      const parsedContent = JSON.parse(content)
      console.log('Parsed content:', parsedContent)

      // Check if it's the new Supabase format after parsing
      if (parsedContent.type === 'doc' && parsedContent.content && Array.isArray(parsedContent.content)) {
        return (
          <div>
            <SupabaseContentRenderer content={parsedContent} />
          </div>
        )
      }

      // Check if it's legacy Sanity format after parsing
      if (Array.isArray(parsedContent)) {
        return (
          <div>
            <SimplePortableText value={parsedContent} components={myPortableTextComponents} />
          </div>
        )
      }
    } catch (error) {
      console.error('Failed to parse content as JSON:', error)
      // Fall through to string handling
    }
  }

  // Check if it's the new Supabase format (has type: 'doc' and content array)
  if (content.type === 'doc' && content.content && Array.isArray(content.content)) {
    return (
      <div>
        <SupabaseContentRenderer content={content} />
      </div>
    )
  }

  // Check if it's legacy Sanity format (array of blocks)
  if (Array.isArray(content)) {
    return (
      <div>
        <SimplePortableText value={content} components={myPortableTextComponents} />
      </div>
    )
  }

  // Check if it's HTML content from Lexical editor
  if (typeof content === 'string' && content.includes('<')) {
    return (
      <div
        className="font-sans text-gray-700 px-4 md:px-0"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  // Check if it's plain text content
  if (typeof content === 'string') {
    return (
      <div className="font-sans text-gray-700 px-4 md:px-0">
        {content.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-4 text-base md:text-lg">
            {paragraph}
          </p>
        ))}
      </div>
    )
  }

  // Fallback for unknown formats
  return (
    <div className="font-sans text-gray-700 px-4 md:px-0">
      <p>Content format not supported</p>
    </div>
  )
}
