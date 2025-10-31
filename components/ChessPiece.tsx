import React from 'react';
import { Piece } from '../types';
import { PIECE_DATA } from '../constants';

interface ChessPieceProps {
  piece: Piece;
}

const ChessPiece: React.FC<ChessPieceProps> = ({ piece }) => {
  const imageUrl = PIECE_DATA[piece.type].symbol[piece.color];
  const isPlayerPiece = piece.color === 'white';

  const glowClass = isPlayerPiece ? 'animate-piece-glow' : '';
  const staticGlowStyle = !isPlayerPiece ? { filter: 'drop-shadow(0 0 4px #a855f7)' } : {};

  return (
    <div
      className={`w-full h-full flex items-center justify-center p-[23.5%]`}
    >
      <img
        src={imageUrl}
        alt={`${piece.color} ${piece.type}`}
        className={`w-full h-full object-contain ${glowClass}`}
        style={staticGlowStyle}
        draggable="false"
      />
    </div>
  );
};

export default ChessPiece;
