
import React from 'react';

interface StartMenuProps {
  onStartGame: () => void;
  onShowLeaderboard: () => void;
  onShowRules: () => void;
  onShowSettings: () => void;
}

const MenuButton: React.FC<{ onClick: () => void, children: React.ReactNode }> = ({ onClick, children }) => (
    <button
        onClick={onClick}
        className="w-full max-w-xs bg-orange-600 hover:bg-orange-700 text-white font-bold text-2xl py-4 px-6 rounded-md border-b-4 border-orange-800 hover:border-orange-900 transition-all duration-200 transform hover:scale-105"
    >
        {children}
    </button>
);

const StartMenu: React.FC<StartMenuProps> = ({ onStartGame, onShowLeaderboard, onShowRules, onShowSettings }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="text-center mb-12">
        <h1 className="text-8xl font-creepster text-orange-500 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
          Haunted Chess 3D
        </h1>
        <p className="text-xl text-gray-400 mt-2">The ghoulish game of kings and spooks.</p>
      </div>
      <div className="flex flex-col items-center space-y-5">
        <MenuButton onClick={onStartGame}>Start Game</MenuButton>
        <MenuButton onClick={onShowLeaderboard}>Leaderboard</MenuButton>
        <MenuButton onClick={onShowRules}>Rules</MenuButton>
        <MenuButton onClick={onShowSettings}>Settings</MenuButton>
      </div>
    </div>
  );
};

export default StartMenu;
