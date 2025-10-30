import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 animate-fade-in">
      <div className="w-full max-w-md px-4 text-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-[14pt] font-sans text-white">Loading...</h2>
      </div>
    </div>
  );
};

export default LoadingScreen;