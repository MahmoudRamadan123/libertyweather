'use client';

import { useEffect, useState } from 'react';
import WeatherEffect from '../hooks/WeatherEffects';
import Stars from '../hooks/Starts';

export default function Mascot({
  isHolidayToday,
  mascotVideoUrl,
  animationType,
  cityName,
  timeOfDay = 'day',
}) {
  return (
    <div className=" flex h-[calc(100vh-290px)] w-full items-center justify-center overflow-hidden">

      {/* Background */}
      <img
        src={`/mascots/${cityName}/${timeOfDay === 'night' ? 'night-bg' : 'bg'}.png`}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
        alt="Background"
      />

      {/* Stars at night */}
      {timeOfDay === 'night' && <Stars />}

      {/* Weather Effect */}
      <WeatherEffect animationType={animationType} timeOfDay={timeOfDay} />

      {/* Mascot */}
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
      />

      {/* Bottom layer */}
      <img
        src="/mascots/all/bottom.png"
        className="absolute bottom-0 lg:-bottom-16 h-[30%] lg:h-[60%] w-full object-cover z-20"
        alt="Bottom"
      />
    </div>
  );
}
