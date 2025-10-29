import React from 'react';
import { Piece } from '../types';
import { PIECE_DATA } from '../constants';

interface ChessPieceProps {
  piece: Piece;
}

const ChessPiece: React.FC<ChessPieceProps> = ({ piece }) => {
  const { symbol } = PIECE_DATA[piece.type];
  const pieceSymbol = symbol[piece.color];
  const isPlayerPiece = piece.color === 'white';

  const glowClass = isPlayerPiece ? 'animate-piece-glow' : '';
  const textColorClass = isPlayerPiece ? 'text-orange-400' : 'text-purple-600';
  const textShadowStyle = !isPlayerPiece ? { textShadow: '0 0 10px rgba(0, 0, 0, 0.15), 0 0 15px rgba(0, 0, 0, 0.15)' } : {};

  return (
    <div
      className={`w-full h-full flex items-center justify-center cursor-pointer text-5xl md:text-6xl lg:text-7xl transition-transform hover:scale-110 ${textColorClass} ${glowClass}`}
      style={textShadowStyle}
    >
      {pieceSymbol}
    </div>
  );
};

export default ChessPiece;