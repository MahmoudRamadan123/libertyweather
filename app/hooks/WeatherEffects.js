const WeatherEffect = ({ animationType, timeOfDay }) => {
  switch (animationType) {
    case 'sunny':
      return timeOfDay === 'day' ? (
        <img
          src="/mascots/all/sunny-effect.png"
          className="absolute inset-0 -z-1 top-[25%] w-full h-[400px] object-contain opacity-70 animate-pulse"
          alt="Sun effect"
        />
      ) : null;

    case 'cloudy':
      return (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/mascots/all/clouds.png"
            className="absolute h-full -z-1 top-0 w-[4000px] opacity-50 animate-clouds object-cover "
            alt="Clouds"
                    style={{
          filter:
            timeOfDay === 'night'
              ? 'brightness(0.6) contrast(1.3)'
              : 'brightness(1)',
                    }}
          />
        </div>
      );

    case 'rainy':
      return (
        <> <div className="absolute h-full inset-0 object-contain rain" style={{ backgroundImage: "url('/mascots/all/rain.png')" }} />
     <div className="absolute inset-0 overflow-hidden">
          <img
            src="/mascots/all/clouds.png"
            className="absolute h-full -z-1 top-0 w-[4000px] opacity-50 animate-clouds object-cover "
            alt="Clouds"
                    style={{
          filter:
            timeOfDay === 'night'
              ? 'brightness(0.6) contrast(1.3)'
              : 'brightness(1)',
                    }}
          />
        </div>
        </>
        );

    case 'snowy':
      return (
        <> <div className="absolute h-full inset-0 snow-effect" style={{ backgroundImage: "url('/mascots/all/snow.png')",
          backgroundSize: '100px 100px',
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center',
         }} />
     <div className="absolute inset-0 overflow-hidden">
          <img
            src="/mascots/all/clouds.png"
            className="absolute h-full -z-1 top-0 w-[4000px] opacity-50 animate-clouds object-cover "
            alt="Clouds"
                    style={{
          filter:
            timeOfDay === 'night'
              ? 'brightness(0.6) contrast(1.3)'
              : 'brightness(1)',
                    }}
          />
        </div>
        </>
      );

    case 'stormy':
      return (
        <>
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/mascots/all/clouds.png"
            className="absolute h-full -z-1 top-0 w-[4000px] opacity-50 animate-clouds object-cover "
            alt="Clouds"
                    style={{
          filter:
            timeOfDay === 'night'
              ? 'brightness(0.6) contrast(1.3)'
              : 'brightness(1)',
                    }}
          />
        </div>
          <div className="absolute h-full inset-0 object-contain rain" style={{ backgroundImage: "url('/mascots/all/rain.png')" }} />
          <div className="absolute inset-0 lightning-effect" />
          <img className="absolute h-full inset-0 lightning object-cover" src="/mascots/all/lighting.png" />
        </>
      );

    default:
      return null;
  }
};
export default WeatherEffect;