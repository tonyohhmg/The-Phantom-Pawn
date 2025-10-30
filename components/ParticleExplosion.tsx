import React from 'react';

const PARTICLE_COUNT = 40; // Slightly fewer particles for a less dense, more wispy effect

const ParticleExplosion: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none w-full h-full">
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
        const style = {
          '--angle': `${Math.random() * 360}deg`,
          '--distance': `${Math.random() * 70 + 50}px`, // Adjusted distance for the new upward motion
          '--duration': `${Math.random() * 0.8 + 1.2}s`, // Slower, more "floaty" duration
          '--delay': `${Math.random() * 0.2}s`,
          '--size': `${Math.floor(Math.random() * 12 + 10)}px`, // Larger, softer particles
          // Ghostly colors: wispy white and ethereal lavender
          '--color': ['rgba(255, 255, 255, 0.8)', 'rgba(221, 214, 254, 0.7)'][Math.floor(Math.random() * 2)],
        } as React.CSSProperties;

        return <div key={i} className="particle" style={style}></div>;
      })}
    </div>
  );
};

export default ParticleExplosion;