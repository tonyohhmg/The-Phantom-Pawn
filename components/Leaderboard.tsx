
import React from 'react';
import { LEADERBOARD_DATA } from '../constants';

interface LeaderboardProps {
  onBack: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-900 p-4">
      <h1 className="text-6xl font-creepster text-orange-500 mb-8">World Leaderboard</h1>
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg border-2 border-purple-500">
        <div className="grid grid-cols-3 text-center p-3 border-b border-gray-600 font-bold text-gray-400">
          <span>Rank</span>
          <span>Player</span>
          <span>Score</span>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {LEADERBOARD_DATA.map(({ rank, name, score }, index) => (
            <div
              key={index}
              className={`grid grid-cols-3 text-center p-3 ${index % 2 === 0 ? 'bg-gray-700/50' : ''}`}
            >
              <span className="font-bold text-orange-400">{rank}</span>
              <span>{name}</span>
              <span className="text-green-400">{score}</span>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={onBack}
        className="mt-8 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-md"
      >
        Back to Menu
      </button>
    </div>
  );
};

export default Leaderboard;
