// Fix: Implemented the full content of the App component to structure and render the application.
import React, { useState, useEffect, useCallback } from 'react';
import GameBoard from './components/GameBoard';
import GameUI from './components/GameUI';
import StartMenu from './components/StartMenu';
import Leaderboard from './components/Leaderboard';
import Modal from './components/Modal';
import PromotionChoice from './components/PromotionChoice';
import NameEntryModal from './components/NameEntryModal';
import { useGameLogic } from './hooks/useGameLogic';
import { PlayerProfile, Position } from './types';
import { getProfile, saveProfile } from './services/playerProfileService';

type View = 'start' | 'game' | 'leaderboard';

const App: React.FC = () => {
  const [view, setView] = useState<View>('start');
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(getProfile());
  const [modalProfileData, setModalProfileData] = useState<PlayerProfile>(playerProfile);
  const { gameState, isAiThinking, aiMoveError, handleMove, resetGame, handlePromotion } = useGameLogic(playerProfile);

  const [rotation] = useState({ x: 0, y: 0 });
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [captureEffectToDisplay, setCaptureEffectToDisplay] = useState<{ position: Position; key: number } | null>(null);

  useEffect(() => {
    setModalProfileData(playerProfile);
  }, [playerProfile]);

  useEffect(() => {
    if (gameState.lastCapturePosition) {
        setCaptureEffectToDisplay(gameState.lastCapturePosition);
    }
  }, [gameState.lastCapturePosition]);

  const handlePlayerWin = useCallback(() => {
    setPlayerProfile(prevProfile => {
        const newProfile = { ...prevProfile, wins: prevProfile.wins + 1 };
        saveProfile(newProfile);
        return newProfile;
    });
  }, []);

  const handlePlayerDraw = useCallback(() => {
    setPlayerProfile(prevProfile => {
        const newProfile = { ...prevProfile, draws: (prevProfile.draws || 0) + 1 };
        saveProfile(newProfile);
        return newProfile;
    });
  }, []);

  useEffect(() => {
    if (gameState.gameover) {
        if (gameState.winner === 'white') {
            handlePlayerWin();
        } else if (gameState.status === 'draw') {
            handlePlayerDraw();
        }
    }
  }, [gameState.gameover, gameState.winner, gameState.status, handlePlayerWin, handlePlayerDraw]);

  const openProfileModal = () => {
    setModalProfileData(playerProfile);
    setIsProfileModalOpen(true);
  };
  
  const handleProfileModalClose = () => {
    // Always save profile on close, as avatar could have been changed
    setPlayerProfile(modalProfileData);
    saveProfile(modalProfileData);
    setIsProfileModalOpen(false);
  };

  const handleStartGame = () => {
    resetGame(playerProfile);
    setView('game');
  };

  const handleEndGame = () => {
    setView('start');
  };

  const handlePlayAgain = () => {
    resetGame(playerProfile);
  };
  
  const renderContent = () => {
    switch (view) {
      case 'leaderboard':
        return <Leaderboard onBack={() => setView('start')} />;
      case 'game':
        return (
          <div className="relative w-full h-screen overflow-hidden flex items-center justify-center">
            <GameUI 
                gameState={gameState} 
                onReset={handleStartGame} 
                onEndGame={handleEndGame}
                onPlayAgain={handlePlayAgain}
                isAiThinking={isAiThinking} 
            />
            <GameBoard
              board={gameState.board}
              onMove={handleMove}
              rotation={rotation}
              currentPlayer={gameState.currentPlayer}
              disabled={gameState.currentPlayer === 'black' || gameState.gameover || !!gameState.promotionPending}
              captureEffect={captureEffectToDisplay}
            />
            {gameState.promotionPending && (
                <PromotionChoice
                    color={gameState.promotionPending.color}
                    onPromote={handlePromotion}
                />
            )}
          </div>
        );
      case 'start':
      default:
        return (
          <StartMenu
            profile={playerProfile}
            onStartGame={handleStartGame}
            onShowProfile={openProfileModal}
            onShowLeaderboard={() => setView('leaderboard')}
            onShowRules={() => setIsRulesModalOpen(true)}
            onShowSettings={() => setIsSettingsModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen w-full text-white">
        {renderContent()}

        <NameEntryModal 
            isOpen={isProfileModalOpen}
            onClose={handleProfileModalClose}
            profile={modalProfileData}
            onProfileChange={setModalProfileData}
        />
        
        <Modal title="Game Rules" isOpen={isRulesModalOpen} onClose={() => setIsRulesModalOpen(false)}>
            <div className="space-y-4 text-gray-300">
                <p><strong>Objective:</strong> Checkmate the opponent's King (🎃).</p>
                <p><strong>Checkmate:</strong> When the opponent's King is in check and cannot make any legal moves to escape.</p>
                <p><strong>Stalemate:</strong> If a player is not in check but has no legal moves, the game is a draw.</p>
                <p><strong>Time:</strong> Each player has 5 minutes. If your time runs out, you lose the game.</p>
                <p>Each piece has unique moves. White (your team, with orange outlines) moves first.</p>
                <p>If your pawn (💀) reaches the opposite end of the board, it can be promoted to a more powerful piece.</p>
                <p>The game ends by checkmate, stalemate, timeout, or after 50 moves (resulting in a draw).</p>
            </div>
        </Modal>

        <Modal title="Settings" isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)}>
            <p className="text-gray-300">Settings are not yet implemented. Stay tuned for spooky updates!</p>
        </Modal>
    </div>
  );
};

export default App;