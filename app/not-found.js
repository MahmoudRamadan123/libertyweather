'use client';

import { useEffect, useState } from 'react';
import { Home, RefreshCw, CloudOff, Navigation, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const [countdown, setCountdown] = useState(10);
  const [weatherEffect, setWeatherEffect] = useState('clear');
  const router = useRouter();

  // Weather effects rotation
  useEffect(() => {
    const effects = ['clear', 'rain', 'snow', 'storm', 'wind'];
    let index = 0;
    
    const interval = setInterval(() => {
      index = (index + 1) % effects.length;
      setWeatherEffect(effects[index]);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Countdown for auto-redirect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  // Weather effect classes
  const getWeatherClasses = () => {
    switch (weatherEffect) {
      case 'rain':
        return 'bg-gradient-to-br from-gray-800 to-blue-900';
      case 'snow':
        return 'bg-gradient-to-br from-gray-800 to-gray-300';
      case 'storm':
        return 'bg-gradient-to-br from-gray-900 to-purple-900';
      case 'wind':
        return 'bg-gradient-to-br from-gray-800 to-teal-900';
      default:
        return 'bg-gradient-to-br from-blue-900 to-purple-900';
    }
  };

  const goBack = () => {
    router.back();
  };

  const goHome = () => {
    router.push('/');
  };

  return (
    <div className={`min-h-screen transition-all duration-1000 ${getWeatherClasses()}`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {weatherEffect === 'rain' && (
          <>
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-8 bg-blue-400/30 animate-rain"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-20px',
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`
                }}
              />
            ))}
          </>
        )}
        
        {weatherEffect === 'snow' && (
          <>
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full animate-snow"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10px',
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${5 + Math.random() * 10}s`
                }}
              />
            ))}
          </>
        )}
        
        {weatherEffect === 'wind' && (
          <div className="absolute inset-0 animate-wind">
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 text-center">
        {/* Weather Icon */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 bg-white/10 rounded-full backdrop-blur-sm flex items-center justify-center border-4 border-white/20">
            <CloudOff className="w-16 h-16 text-white/80" />
          </div>
          <div className="absolute -top-2 -right-2">
            <AlertTriangle className="w-10 h-10 text-yellow-400 animate-pulse" />
          </div>
        </div>

        {/* Error Code */}
        <div className="mb-6">
          <h1 className="text-9xl font-bold text-white mb-2">
            404
            <span className="text-4xl ml-4 text-yellow-400">WEATHER</span>
          </h1>
          <div className="w-48 h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto"></div>
        </div>

        {/* Message */}
        <div className="max-w-2xl mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Weather Forecast Not Found
          </h2>
          <p className="text-gray-300 text-lg mb-4">
            It looks like the weather page you're looking for has drifted away like a cloud in the wind.
          </p>
          <div className="inline-block p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
            <p className="text-gray-400">
              <span className="text-yellow-400 font-semibold">Current condition:</span> {' '}
              {weatherEffect === 'rain' && 'Rainy with scattered clouds'}
              {weatherEffect === 'snow' && 'Snowfall and cold winds'}
              {weatherEffect === 'storm' && 'Stormy with heavy showers'}
              {weatherEffect === 'wind' && 'Windy with clear skies'}
              {weatherEffect === 'clear' && 'Clear skies ahead'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={goHome}
            className="group flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
          >
            <Home className="w-5 h-5" />
            Return to Home
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
          
          <button
            onClick={goBack}
            className="group flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <Navigation className="w-5 h-5 transform rotate-180" />
            Go Back
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform" />
          </button>
        </div>

        {/* Auto Redirect Countdown */}
        <div className="mb-8 p-4 bg-black/30 rounded-lg backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <p className="text-gray-300">
              Redirecting to home in{' '}
              <span className="text-white font-bold text-xl">{countdown}</span> seconds
            </p>
          </div>
          <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-1000"
              style={{ width: `${(countdown / 10) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Helpful Tips */}
        <div className="max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
            <h3 className="text-white font-semibold mb-2">Check the URL</h3>
            <p className="text-gray-400 text-sm">
              Make sure the weather location name is spelled correctly
            </p>
          </div>
          
          <div className="p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
            <h3 className="text-white font-semibold mb-2">Search Again</h3>
            <p className="text-gray-400 text-sm">
              Use the search feature to find specific weather locations
            </p>
          </div>
          
          <div className="p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
            <h3 className="text-white font-semibold mb-2">Report Issue</h3>
            <p className="text-gray-400 text-sm">
              Contact support if this page appears frequently
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <p className="text-gray-500 text-xs flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Page not found • Try searching for a different location
          </p>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes rain {
          0% { transform: translateY(-20px) rotate(15deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh) rotate(15deg); opacity: 0; }
        }
        
        @keyframes snow {
          0% { transform: translateY(-10px) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { 
            transform: translateY(100vh) translateX(${Math.random() * 100 - 50}px); 
            opacity: 0; 
          }
        }
        
        @keyframes wind {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        
        .animate-rain {
          animation: rain linear infinite;
        }
        
        .animate-snow {
          animation: snow linear infinite;
        }
        
        .animate-wind {
          animation: wind 3s linear infinite;
        }
      `}</style>
    </div>
  );
}