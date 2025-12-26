const Stars = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(60)].map((_, i) => (
      <span
        key={i}
        className="absolute bg-white rounded-full animate-twinkle"
        style={{
          width: Math.random() * 2 + 1 + 'px',
          height: Math.random() * 2 + 1 + 'px',
          top: Math.random() * 100 + '%',
          left: Math.random() * 100 + '%',
          animationDelay: `${Math.random() * 5}s`,
        }}
      />
    ))}
  </div>
);
export default Stars;