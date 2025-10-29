import React from 'react';
import { PlayerProfile } from '../types';

interface StartMenuProps {
  profile: PlayerProfile;
  onStartGame: () => void;
  onShowLeaderboard: () => void;
  onShowRules: () => void;
  onShowSettings: () => void;
  onShowProfile: () => void;
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
    : "bg-gray-800 hover:bg-gray-700 border-gray-900 hover:border-black";
    
  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses}`}
    >
      {children}
    </button>
  );
};

const StartMenu: React.FC<StartMenuProps> = ({ profile, onStartGame, onShowLeaderboard, onShowRules, onShowSettings, onShowProfile }) => {
  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center text-white p-4"
    >
      <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg py-12 shadow-lg w-full max-w-2xl text-center">
        <div className="text-center mb-8">
          <h1 className="text-8xl font-jolly-lodger text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] whitespace-nowrap">
            The Phantom Pawn
          </h1>
          <p className="text-xl text-white/65 mt-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)]">
            A Halloween Chess Haunting
          </p>
        </div>
        <div className="flex flex-col items-center space-y-5">
          <MenuButton onClick={onStartGame} variant="primary">Play</MenuButton>
          <MenuButton onClick={onShowProfile} variant="secondary">Profile</MenuButton>
          <MenuButton onClick={onShowLeaderboard} variant="secondary">Leaderboard</MenuButton>
          {/* Fix: Corrected typo in the closing tag. */}
          <MenuButton onClick={onShowRules} variant="secondary">Rules</MenuButton>
          <MenuButton onClick={onShowSettings} variant="secondary">Settings</MenuButton>
        </div>
      </div>
    </div>
  );
};

export default StartMenu;