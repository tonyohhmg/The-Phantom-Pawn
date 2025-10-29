import React from 'react';

interface StartMenuProps {
  onStartGame: () => void;
  onShowLeaderboard: () => void;
  onShowRules: () => void;
  onShowSettings: () => void;
}

interface MenuButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const MenuButton: React.FC<MenuButtonProps> = ({ onClick, children, variant = 'primary' }) => {
  const baseClasses = "w-full max-w-xs text-white font-bold text-2xl py-4 px-6 rounded-md border-b-4 transition-all duration-200 transform hover:scale-105";
  
  const variantClasses = variant === 'primary' 
    ? "bg-orange-600 hover:bg-orange-700 border-orange-800 hover:border-orange-900"
    : "bg-gray-500 hover:bg-gray-600 border-gray-700 hover:border-gray-800";
    
  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses}`}
    >
      {children}
    </button>
  );
};

const StartMenu: React.FC<StartMenuProps> = ({ onStartGame, onShowLeaderboard, onShowRules, onShowSettings }) => {
  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center text-white p-4"
    >
      <div className="text-center mb-12">
        <h1 className="text-8xl font-jolly-lodger text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
          The Phantom Pawn
        </h1>
        <p className="text-xl text-white/65 mt-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)]">
          A Halloween Chess Haunting
        </p>
      </div>
      <div className="flex flex-col items-center space-y-5">
        <MenuButton onClick={onStartGame} variant="primary">Start Game</MenuButton>
        <MenuButton onClick={onShowLeaderboard} variant="secondary">Leaderboard</MenuButton>
        <MenuButton onClick={onShowRules} variant="secondary">Rules</MenuButton>
        <MenuButton onClick={onShowSettings} variant="secondary">Settings</MenuButton>
      </div>
    </div>
  );
};

export default StartMenu;