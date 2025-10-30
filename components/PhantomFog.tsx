import React from 'react';
import { Position } from '../types';

interface PhantomFogProps {
  center: Position;
}

const PhantomFog: React.FC<PhantomFogProps> = ({ center }) => {
  const fogSquares = [];
  for (let r = -1; r <= 1; r++) {
    for (let c = -1; c <= 1; c++) {
      const row = center.row + r;
      const col = center.col + c;
      if (row >= 0 && row < 8 && col >= 0 && col < 8) {
        fogSquares.push({ row, col });
      }
    }
  }

  return (
    <>
      {fogSquares.map(({ row, col }) => (
        <div
          key={`fog-${row}-${col}`}
          className="absolute w-[12.5%] h-[12.5%] phantom-fog pointer-events-none"
          style={{
            transform: `translate(${col * 100}%, ${row * 100}%)`,
          }}
        />
      ))}
    </>
  );
};

export default PhantomFog;
