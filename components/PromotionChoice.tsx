import React from 'react';
import { PieceType, PlayerColor } from '../types';
import { PIECE_DATA } from '../constants';

interface PromotionChoiceProps {
  color: PlayerColor;
  onPromote: (pieceType: PieceType) => void;
}

const promotionPieces: PieceType[] = ['queen', 'rook', 'bishop', 'knight'];

const PromotionChoice: React.FC<PromotionChoiceProps> = ({ color, onPromote }) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-30">
      <div className="bg-gray-800 p-6 rounded-lg shadow-2xl border-2 border-purple-500 flex flex-col items-center">
        <h3 className="text-2xl font-bold text-white mb-4">Promote Pawn</h3>
        <div className="flex space-x-4">
          {promotionPieces.map((pieceType) => {
            const imageUrl = PIECE_DATA[pieceType].symbol[color];
            const isPlayerPiece = color === 'white';
            const glowStyle = isPlayerPiece
              ? { filter: 'drop-shadow(0 0 4px #f97316)' }
              : { filter: 'drop-shadow(0 0 4px #a855f7)' };

            return (
              <button
                key={pieceType}
                onClick={() => onPromote(pieceType)}
                className="p-2 w-20 h-20 bg-gray-700 rounded-md hover:bg-purple-600 transition-colors flex items-center justify-center group"
              >
                <img
                  src={imageUrl}
                  alt={pieceType}
                  className="w-12 h-12 object-contain transition-transform duration-200 group-hover:scale-110"
                  style={glowStyle}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PromotionChoice;