/**
 * This component uses Portable Text to render a post body.
 *
 * You can learn more about Portable Text on:
 * https://www.sanity.io/docs/block-content
 * https://github.com/portabletext/react-portabletext
 * https://portabletext.org/
 *
 */
import { SanityImage } from './SanityImage'

// Simple portable text renderer for legacy content
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
            <Tag key={index} className="mb-4">
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

const myPortableTextComponents = {
  types: {
    image: ({ value }) => {
      return <SanityImage {...value} />
    },
  },
}

export default function PostBody({ content }) {
  return (
    <div>
      <SimplePortableText value={content} components={myPortableTextComponents} />
    </div>
  )
}
