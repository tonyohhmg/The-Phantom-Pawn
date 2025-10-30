import React, { useState, useEffect, useCallback, useRef } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
}

const EtherealCursor: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const nextId = useRef(0);

  const addParticle = useCallback((x: number, y: number) => {
    const id = nextId.current++;
    setParticles(prev => [...prev, { id, x, y }]);

    // Automatically remove the particle from the state after its animation completes
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, 1000); // Should match the CSS animation duration
  }, []);

  useEffect(() => {
    let lastTimestamp = 0;
    const throttleInterval = 40; // Generate a particle every 40ms for a smooth trail

    const handleMouseMove = (e: MouseEvent) => {
      const timestamp = Date.now();
      if (timestamp - lastTimestamp > throttleInterval) {
        lastTimestamp = timestamp;
        // Add a bit of random offset for a more dynamic, "wispy" look
        const randomXOffset = (Math.random() - 0.5) * 15;
        const randomYOffset = (Math.random() - 0.5) * 15;
        addParticle(e.clientX + randomXOffset, e.clientY + randomYOffset);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [addParticle]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="cursor-particle"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
          }}
        />
      ))}
    </div>
  );
};

export default EtherealCursor;
