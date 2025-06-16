import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Forge Journal
            </Link>
            <p className="mt-2 text-gray-600 max-w-md">
              A modern journaling platform built to help you craft your thoughts and forge your story with purpose and clarity.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Navigation
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-gray-900">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-gray-900">
                  About
                </Link>
              </li>
              <li>
                <Link href="/topics" className="text-gray-600 hover:text-gray-900">
                  Topics
                </Link>
              </li>
              <li>
                <Link href="/faculty" className="text-gray-600 hover:text-gray-900">
                  Faculty
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Resources
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a
                  href="https://github.com/sanity-io/nextjs-blog-cms-sanity-v3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://www.sanity.io/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/sanity-io/nextjs-blog-cms-sanity-v3/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Forge Journal. Built with Next.js and Sanity.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a
                href="https://nextjs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Next.js</span>
                <span className="text-sm">Next.js</span>
              </a>
              <a
                href="https://sanity.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Sanity</span>
                <span className="text-sm">Sanity</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
