'use client';

import { useState } from 'react';
import WeatherEffect from '../hooks/WeatherEffects';
import Stars from '../hooks/Starts';

export default function Mascot({
  isHolidayToday,
  mascotVideoUrl,
  animationType,
  cityName,
  timeOfDay = 'day',
}) {
  // State to track if images loaded successfully
  const [bgLoaded, setBgLoaded] = useState(true);
  const [mascotLoaded, setMascotLoaded] = useState(true);
  const [bottomLoaded, setBottomLoaded] = useState(true);

  return (
    <div className="flex h-[calc(100vh-290px)] w-full items-center justify-center overflow-hidden">
      {/* Background */}
      {bgLoaded && (
        <img
          src={`/mascots/${cityName}/${timeOfDay === 'night' ? 'night-bg' : 'bg'}.png`}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          alt="Background"
          onError={() => setBgLoaded(false)}
        />
      )}

      {timeOfDay === 'night' && <Stars />}

      {/* Weather Effect */}
      <WeatherEffect animationType={animationType} timeOfDay={timeOfDay} />

      {/* Mascot */}
      {mascotLoaded && (
        <img
          src={`/mascots/${cityName}/state.png`}
          className="absolute bottom-0 h-[70%] w-full object-contain z-10 transition-all duration-1000"
          style={{
            filter:
              timeOfDay === 'night'
                ? 'brightness(0.7) contrast(1.1)'
                : 'brightness(1)',
          }}
          alt="Mascot"
          onError={() => setMascotLoaded(false)}
        />
      )}

      {/* Bottom layer */}
      {bottomLoaded && (
        <img
          src="/mascots/all/bottom.png"
          className="absolute bottom-0 lg:-bottom-16 h-[30%] lg:h-[60%] w-full object-cover z-20"
          alt="Bottom"
          onError={() => setBottomLoaded(false)}
        />
      )}
    </div>
  );
}
