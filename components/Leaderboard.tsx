export default function Leaderboard() {
  return (
    <div className="w-full h-[90px] bg-gray-100">
      <div className="w-[90%] mx-auto max-w-[1280px] h-full">
        <div className="flex items-center justify-center h-full py-2">
          {/* Forge Pastors Training Ad */}
          <div
            className="w-full h-full bg-gradient-to-r from-blue-900 via-red-800 to-blue-900 relative overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 group"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1606768666853-403c90a981ad?w=800&h=200&fit=crop&crop=center)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundBlendMode: 'overlay'
            }}
          >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-red-800/70 to-blue-900/80"></div>

            {/* Ad Content */}
            <div className="relative z-10 flex items-center justify-between h-full px-6">
              {/* Left Side - Main Message */}
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg font-sans tracking-wide">
                  FORGE PASTORS TRAINING
                </h3>
                <p className="text-blue-100 text-sm font-sans">
                  Equipping Leaders to Shape the Nation • Next Cohort Starting Soon
                </p>
              </div>

              {/* Right Side - CTA */}
              <div className="flex-shrink-0 ml-4">
                <div className="bg-white text-blue-900 px-4 py-2 font-bold text-sm font-sans uppercase tracking-wider hover:bg-blue-50 transition-colors duration-200 group-hover:scale-105 transform transition-transform">
                  SIGN UP NOW
                </div>
              </div>
            </div>

            {/* Subtle stars pattern overlay */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-2 left-8 text-white text-xs">★</div>
              <div className="absolute top-4 right-12 text-white text-xs">★</div>
              <div className="absolute bottom-3 left-16 text-white text-xs">★</div>
              <div className="absolute bottom-2 right-20 text-white text-xs">★</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
