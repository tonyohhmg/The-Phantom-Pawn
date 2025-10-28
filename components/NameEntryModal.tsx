import React, { useState } from 'react';

interface NameEntryModalProps {
  isOpen: boolean;
  onStart: (name: string) => void;
  onClose: () => void;
}

const NameEntryModal: React.FC<NameEntryModalProps> = ({ isOpen, onStart, onClose }) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onStart(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border-2 border-orange-500 rounded-lg shadow-2xl shadow-orange-500/30 w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-2xl font-creepster text-orange-400 tracking-wider">Enter Your Name</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <label htmlFor="playerName" className="block text-lg text-gray-300 mb-2">
            Enter your name:
          </label>
          <input
            id="playerName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="e.g., Spooky Knight"
            maxLength={20}
            autoFocus
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xl py-3 px-6 rounded-md border-b-4 border-orange-800 hover:border-orange-900 transition-all duration-200 disabled:bg-gray-600 disabled:border-gray-700 disabled:cursor-not-allowed"
          >
            Start Haunting
          </button>
        </form>
      </div>
    </div>
  );
};

export default NameEntryModal;