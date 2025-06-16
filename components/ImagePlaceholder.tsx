interface ImagePlaceholderProps {
  width?: number
  height?: number
  className?: string
  aspectRatio?: 'video' | 'square' | 'portrait' | 'landscape'
  showIcon?: boolean
  text?: string
}

export default function ImagePlaceholder({ 
  width = 400, 
  height = 225, 
  className = '', 
  aspectRatio = 'video',
  showIcon = true,
  text = 'Image placeholder'
}: ImagePlaceholderProps) {
  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square', 
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]'
  }

  return (
    <div
      className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${aspectClasses[aspectRatio]} ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <div className="text-center text-gray-400">
        {showIcon && (
          <svg 
            className="w-12 h-12 mx-auto mb-2 opacity-50" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        )}
        <p className="text-xs font-medium opacity-75">{text}</p>
      </div>
    </div>
  )
}
