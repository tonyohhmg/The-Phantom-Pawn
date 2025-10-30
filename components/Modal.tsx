
import React from 'react';

interface ModalProps {
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  hideHeader?: boolean;
}

const Modal: React.FC<ModalProps> = ({ title, isOpen, onClose, children, hideHeader = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gray-800 border-2 border-purple-500 rounded-lg shadow-2xl shadow-purple-500/30 w-full max-w-lg max-h-[90vh] flex flex-col">
        {!hideHeader && (
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h2 className="text-xl font-sans font-bold text-white tracking-wider">{title}</h2>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
            >
                &times;
            </button>
            </div>
        )}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;