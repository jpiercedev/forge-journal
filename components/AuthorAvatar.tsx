// Removed Sanity imports - now using direct URLs

interface Author {
  name: string
  picture?: string
}
import Image from 'next/image'

export default function AuthorAvatar(props: Author) {
  const { name, picture } = props
  return (
    <div className="flex items-center">
      <div className="relative mr-4 h-12 w-12">
        <Image
          src={picture || 'https://picsum.photos/id/237/96'}
          className="rounded-full"
          height={96}
          width={96}
          alt={name}
        />
      </div>
      <div className="text-xl font-bold text-balance font-sans">{name}</div>
    </div>
  )
}
