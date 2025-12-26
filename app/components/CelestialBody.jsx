function CelestialBody({ currentTime, sunTimes }) {
  if (!sunTimes) return null;


  const now = currentTime.getTime();
  const sunrise = sunTimes.sunrise.getTime();
  const sunset = sunTimes.sunset.getTime();

  const isDay = now >= sunrise && now < sunset;
  let progress;

  if (isDay) {
    // ☀️ Sun vertical motion
    progress = (now - sunrise) / (sunset - sunrise);
  } else {
    // 🌙 Moon vertical motion
    const nextSunrise =
      now < sunrise ? sunrise : sunrise + 24 * 60 * 60 * 1000;

    progress = (now - sunset) / (nextSunrise - sunset);
  }

  progress = Math.min(Math.max(progress, 0), 1);

  // 🌤 Vertical range
  const topMin = 12; // highest (vh)
  const topMax = 72; // lowest (vh)
  const y = topMin + (topMax - topMin) * progress;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute rounded-full transition-all  ease-in-out"
        style={{
          right: '20%',
          top: `${y}vh`,
          transform: 'translate(-50%, -50%)',
          width: 'clamp(90px, 9vw, 120px)',
          height: 'clamp(90px, 9vw, 120px)',
          background: isDay
            ? 'radial-gradient(circle, #fff6b0, #ff9800)'
            : 'radial-gradient(circle, #ffffff, #bfc7d5)',
          boxShadow: isDay
            ? '0 0 80px rgba(255,180,50,.9)'
            : '0 0 40px rgba(255,255,255,.7)',
        }}
      />
    </div>
  );
}

export default CelestialBody;
