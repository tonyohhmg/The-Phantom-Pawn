import React from 'react';
import { PieceType, PlayerColor } from '../types';
import { PIECE_SYMBOLS } from '../constants';

interface PromotionChoiceProps {
  color: PlayerColor;
  onPromote: (pieceType: PieceType) => void;
}

const promotionPieces: PieceType[] = ['queen', 'rook', 'bishop', 'knight'];

const PromotionChoice: React.FC<PromotionChoiceProps> = ({ color, onPromote }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border-2 border-orange-400 flex flex-col items-center animate-fade-in">
        <h3 className="text-2xl font-bold text-white mb-4 font-creepster tracking-wider">Promote Pawn</h3>
        <div className="flex gap-4">
          {promotionPieces.map(pieceType => (
            <button
              key={pieceType}
              onClick={() => onPromote(pieceType)}
              className="w-20 h-20 bg-gray-700 rounded-md flex items-center justify-center text-5xl hover:bg-orange-600 transition-colors transform hover:scale-110"
              title={`Promote to ${pieceType}`}
            >
              {PIECE_SYMBOLS[pieceType].symbol}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromotionChoice;