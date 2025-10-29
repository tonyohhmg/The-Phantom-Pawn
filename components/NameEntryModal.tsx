import React from 'react';
import { generateAvatarUrl } from '../constants';
import { PlayerProfile } from '../types';

interface NameEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  onProfileChange: (newProfile: PlayerProfile) => void;
}

const NameEntryModal: React.FC<NameEntryModalProps> = ({ isOpen, onClose, profile, onProfileChange }) => {
  if (!isOpen) return null;

  const handleRandomizeAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    const newAvatarUrl = generateAvatarUrl(randomSeed);
    onProfileChange({ ...profile, avatarUrl: newAvatarUrl });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="relative bg-gray-800 border-2 border-orange-500 rounded-lg shadow-2xl shadow-orange-500/30 w-full max-w-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white text-center mb-4 truncate">{profile.name}</h2>
          <div className="flex flex-col items-center mb-6">
            <img src={profile.avatarUrl} alt="Your Avatar" className="w-24 h-24 rounded-full border-4 border-orange-400 bg-gray-700 shadow-lg"/>
            <button
              type="button"
              onClick={handleRandomizeAvatar}
              className="mt-3 text-sm bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded-md transition-colors"
            >
              New Avatar
            </button>
          </div>
          
          <div className="mb-6">
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-300 mb-1">Your Name</label>
            <input
              type="text"
              id="playerName"
              value={profile.name}
              onChange={(e) => onProfileChange({ ...profile, name: e.target.value })}
              className="w-full bg-gray-900 border-2 border-purple-500 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              maxLength={20}
              autoComplete="off"
            />
          </div>

          <div className="text-center mb-6">
              <div className="flex justify-around items-center mt-2 px-4 py-2 bg-gray-900/50 rounded-lg">
                  <div className="text-lg">Level: <span className="font-bold text-white">{profile.level}</span></div>
                  <div className="text-lg">Wins: <span className="font-bold text-white">{profile.wins}</span></div>
                  <div className="text-lg">Draws: <span className="font-bold text-white">{profile.draws || 0}</span></div>
              </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full mt-6 bg-white hover:bg-gray-200 text-gray-800 font-bold text-xl py-3 px-6 rounded-md border-b-4 border-gray-400 hover:border-gray-500 transition-all duration-200"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NameEntryModal;