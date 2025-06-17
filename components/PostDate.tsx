import { format, parseISO } from 'date-fns'

export default function PostDate({ dateString }: { dateString: string }) {
  if (!dateString) return null

  const date = parseISO(dateString)
  return <time dateTime={dateString} className="font-sans">{format(date, 'LLLL	d, yyyy')}</time>
}
