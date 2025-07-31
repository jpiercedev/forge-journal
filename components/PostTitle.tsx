export default function PostTitle({ children }) {
  return (
    <h1 className="mb-8 md:mb-12 text-center text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight tracking-tighter md:text-left md:leading-none text-balance font-sans px-4 md:px-0">
      {children}
    </h1>
  )
}
