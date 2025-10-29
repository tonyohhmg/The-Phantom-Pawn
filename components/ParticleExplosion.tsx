import React from 'react';

const PARTICLE_COUNT = 50;

const ParticleExplosion: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none w-full h-full">
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
        const style = {
          '--angle': `${Math.random() * 360}deg`,
          '--distance': `${Math.random() * 80 + 50}px`,
          '--duration': `${Math.random() * 0.5 + 0.8}s`,
          '--delay': `${Math.random() * 0.1}s`,
          '--size': `${Math.floor(Math.random() * 8 + 6)}px`,
          '--color': ['#f97316', '#a855f7', '#eab308'][Math.floor(Math.random() * 3)],
        } as React.CSSProperties;

        return <div key={i} className="particle" style={style}></div>;
      })}
    </div>
  );
};

export default ParticleExplosion;