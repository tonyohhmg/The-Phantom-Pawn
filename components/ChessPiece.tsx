import React from 'react';
import { Piece } from '../types';
import { PIECE_SYMBOLS } from '../constants';

interface ChessPieceProps {
  piece: Piece;
}

const ChessPiece: React.FC<ChessPieceProps> = ({ piece }) => {
  const symbolInfo = PIECE_SYMBOLS[piece.type];
  const pieceColorClass = 'text-gray-200'; // All pieces are now the same base color
  
  // Define outline colors based on player, matching the UI theme
  const outlineColor = piece.color === 'white' ? '#fb923c' /* orange-400 */ : '#a855f7' /* purple-500 */;

  return (
    <div className="relative w-full h-full flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-110">
      <div 
        className={`absolute text-5xl md:text-6xl ${pieceColorClass}`}
        style={{ textShadow: `0 0 8px ${outlineColor}, 0 0 4px rgba(0,0,0,0.8)` }}
      >
        {symbolInfo.symbol}
      </div>
      <div className="absolute bottom-1 right-1 text-xs md:text-sm font-bold text-white bg-black bg-opacity-50 rounded-full px-1.5 py-0.5">
        {symbolInfo.label}
      </div>
    </div>
  );
};

export default ChessPiece;