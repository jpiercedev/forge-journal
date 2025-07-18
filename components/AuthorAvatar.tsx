import Image from 'next/image'
import type { Author } from 'lib/supabase/client'

interface AuthorAvatarProps {
  name: string
  picture?: string
}

export default function AuthorAvatar(props: AuthorAvatarProps) {
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
