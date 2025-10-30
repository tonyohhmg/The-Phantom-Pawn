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
  variant?: 'primary' | 'secondary' | 'tertiary';
}

const MenuButton: React.FC<MenuButtonProps> = ({ onClick, children, variant = 'primary' }) => {
  const baseClasses = "w-full max-w-xs text-white font-bold text-xl py-3 px-6 rounded-md transition-all duration-200";
  
  let variantClasses = '';
  switch(variant) {
    case 'primary':
      variantClasses = "bg-purple-600 hover:bg-purple-700 border-b-4 border-purple-800 hover:border-purple-900 transform hover:scale-105";
      break;
    case 'secondary':
      variantClasses = "bg-gray-800 hover:bg-gray-700 border-b-4 border-gray-900 hover:border-black transform hover:scale-105";
      break;
    case 'tertiary':
      variantClasses = "bg-transparent hover:bg-white/20";
      break;
  }
    
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
      className="min-h-screen w-full flex flex-col items-center justify-start pt-28 text-white p-4"
    >
      <div className="w-full max-w-2xl text-center">
        <div className="text-center mb-8">
          <img
            src="https://anthonyorsa.com/wp-content/uploads/2025/10/Logo@2x.png"
            alt="The Phantom Pawn Logo"
            className="mx-auto w-80 h-80"
          />
        </div>
        <div className="flex flex-col items-center space-y-5">
          <MenuButton onClick={onStartGame} variant="primary">Play</MenuButton>
          <MenuButton onClick={onShowProfile} variant="tertiary">Profile</MenuButton>
          {/* <MenuButton onClick={onShowLeaderboard} variant="tertiary">Leaderboard</MenuButton> */}
          {/* Fix: Corrected typo in the closing tag. */}
          <MenuButton onClick={onShowRules} variant="tertiary">Rules</MenuButton>
          {/* <MenuButton onClick={onShowSettings} variant="secondary">Settings</MenuButton> */}
        </div>
      </div>
    </div>
  );
};

export default StartMenu;