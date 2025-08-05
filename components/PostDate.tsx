import { formatPostDate } from 'lib/utils/date-formatting'

export default function PostDate({ dateString }: { dateString: string }) {
  if (!dateString) return null

  const formattedDate = formatPostDate(dateString)
  if (!formattedDate) return null

  return <time dateTime={dateString} className="font-sans">{formattedDate}</time>
}
