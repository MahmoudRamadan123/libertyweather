export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col items-center justify-center p-4">
      {/* Animated Weather Icons */}
      <div className="relative w-32 h-32 mb-8">
        {/* Sun */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute w-20 h-20 bg-yellow-400/20 rounded-full animate-ping"></div>
        </div>
        
        {/* Cloud */}
        <div className="absolute -top-4 -right-4">
          <div className="w-12 h-8 bg-gray-300/30 rounded-full animate-pulse"></div>
        </div>
        
        {/* Rain drops */}
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-4 bg-blue-400/50 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
        </div>
        </div>
      </div>

    </div>
  );
}