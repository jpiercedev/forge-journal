import Link from 'next/link'

import styles from './BlogHeader.module.css'

// Simple portable text renderer for legacy content
function SimplePortableText({ value }: { value: any[] }) {
  if (!value || !Array.isArray(value)) {
    return null
  }

  return (
    <>
      {value.map((block, index) => {
        if (block._type === 'block') {
          return <p key={index}>{block.children?.map((child: any) => child.text).join('')}</p>
        }
        return null
      })}
    </>
  )
}

export default function Header({
  title,
  description,
  level,
}: {
  title: string
  description?: any[]
  level: 1 | 2
}) {
  switch (level) {
    case 1:
      return (
        <header className="mb-10 mt-16 flex flex-col items-center md:mb-12 md:flex-row md:justify-between text-pretty">
          <h1 className="text-6xl font-bold leading-tight tracking-tighter md:pr-8 md:text-8xl">
            {title}
          </h1>
          <h4
            className={`mt-5 text-center text-lg md:pl-8 md:text-left ${styles.portableText}`}
          >
            <SimplePortableText value={description} />
          </h4>
        </header>
      )

    case 2:
      return (
        <header>
          <h2 className="mb-20 mt-8 text-2xl font-bold leading-tight tracking-tight md:text-4xl md:tracking-tighter text-pretty">
            <Link href="/" className="hover:underline">
              {title}
            </Link>
          </h2>
        </header>
      )

    default:
      throw new Error(
        `Invalid level: ${
          JSON.stringify(level) || typeof level
        }, only 1 or 2 are allowed`,
      )
  }
}
