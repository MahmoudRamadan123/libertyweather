import { useEffect, useState } from 'react';

export default function useSkyTime() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeOfDay, setTimeOfDay] = useState('day');
  const [skyGradient, setSkyGradient] = useState('');

  /* ⏱ Update every minute */
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentTime(new Date());
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  /* 🌍 Sky model */
  useEffect(() => {
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    const t = hour + minute / 60;

    let gradient = '';
    let period = 'night';

    // 🌑 Astronomical night (00:00–04:30)
    if (t >= 0 && t < 4.5) {
      gradient = 'linear-gradient(#020111, #000814)';
    }

    // 🌘 Nautical dawn (04:30–05:30)
    else if (t >= 4.5 && t < 5.5) {
      gradient = 'linear-gradient(#020111, #1b2735)';
    }

    // 🌅 Civil dawn (05:30–06:30)
    else if (t >= 5.5 && t < 6.5) {
      gradient = 'linear-gradient(#2c1053, #ad5389)';
    }

    // 🌄 Sunrise (06:30–07:30)
    else if (t >= 6.5 && t < 7.5) {
      gradient = 'linear-gradient(#ff512f, #f09819)';
      period = 'day';
    }

    // 🌤 Morning (07:30–10:00)
    else if (t >= 7.5 && t < 10) {
      gradient = 'linear-gradient(#87ceeb, #e0f6ff)';
      period = 'day';
    }

    // ☀️ Midday (10:00–15:30)
    else if (t >= 10 && t < 15.5) {
      gradient = 'linear-gradient(#4facfe, #00f2fe)';
      period = 'day';
    }

    // 🌤 Afternoon (15:30–17:30)
    else if (t >= 15.5 && t < 17.5) {
      gradient = 'linear-gradient(#74ebd5, #acb6e5)';
      period = 'day';
    }

    // 🌇 Sunset (17:30–18:30)
    else if (t >= 17.5 && t < 18.5) {
      gradient = 'linear-gradient(#f83600, #f9d423)';
      period = 'day';
    }

    // 🌆 Civil twilight (18:30–19:30)
    else if (t >= 18.5 && t < 19.5) {
      gradient = 'linear-gradient(#3a1c71, #d76d77)';
    }

    // 🌌 Night (19:30–24:00)
    else {
      gradient = 'linear-gradient(#020111, #000814)';
    }

    setTimeOfDay(period);
    setSkyGradient(gradient);
  }, [currentTime]);

  return { currentTime, timeOfDay, skyGradient };
}
