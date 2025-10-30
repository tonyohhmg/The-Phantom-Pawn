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
import LoadingScreen from './components/LoadingScreen';
import EtherealCursor from './components/EtherealCursor';

type View = 'start' | 'game' | 'leaderboard';

const App: React.FC = () => {
  const [view, setView] = useState<View>('start');
  const [isLoading, setIsLoading] = useState(false);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(getProfile());
  const [modalProfileData, setModalProfileData] = useState<PlayerProfile>(playerProfile);
  const { gameState, isAiThinking, aiMoveError, handleMove, resetGame, handlePromotion, handleActivatePowerUp, handlePlacePawn, handlePossessionMove, handleEtherealEscape, handlePlaceStolenPiece } = useGameLogic(playerProfile);
  const [version, setVersion] = useState<string>('v1.0.0');

  const [rotation] = useState({ x: 0, y: 0 });
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [captureEffectToDisplay, setCaptureEffectToDisplay] = useState<{ position: Position; key: number } | null>(null);

  useEffect(() => {
    // Re-established connection to a public repository to fetch a valid version number.
    // The previous repository was inaccessible. Using chess.js as a public example.
    fetch('https://api.github.com/repos/jhlywa/chess.js/tags')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Assuming the API returns an array of tags, and the first one is the latest
        if (data && data.length > 0 && data[0].name) {
          setVersion(data[0].name);
        }
      })
      .catch(error => {
        console.error('Failed to fetch GitHub version:', error);
        // If the fetch fails, we'll just stick with the default version.
      });
  }, []); // The empty dependency array ensures this runs only once on mount.

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
        const profileWithNewWin = { ...prevProfile, wins: prevProfile.wins + 1 };
        const fullyUpdatedProfile = saveProfile(profileWithNewWin);
        return fullyUpdatedProfile;
    });
  }, []);

  const handlePlayerDraw = useCallback(() => {
    setPlayerProfile(prevProfile => {
        const profileWithNewDraw = { ...prevProfile, draws: (prevProfile.draws || 0) + 1 };
        const fullyUpdatedProfile = saveProfile(profileWithNewDraw);
        return fullyUpdatedProfile;
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
    const updatedProfile = saveProfile(modalProfileData);
    setPlayerProfile(updatedProfile);
    setIsProfileModalOpen(false);
  };

  const navigateToStartMenu = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
        setView('start');
        setIsLoading(false);
    }, 1000);
  }, []);

  const handleStartGame = () => {
    setIsLoading(true);
    setTimeout(() => {
        resetGame(playerProfile);
        setView('game');
        setIsLoading(false);
    }, 1500);
  };

  const handleEndGame = () => {
    navigateToStartMenu();
  };
  
  const handleConfirmForfeit = () => {
    navigateToStartMenu();
  };

  const handlePlayAgain = () => {
    resetGame(playerProfile);
  };
  
  const renderContent = () => {
    switch (view) {
      case 'leaderboard':
        return <Leaderboard onBack={navigateToStartMenu} />;
      case 'game':
        return (
          <div className="relative w-full h-screen overflow-hidden flex items-center justify-center">
            <GameUI 
                gameState={gameState} 
                onReset={handleStartGame} 
                onEndGame={handleEndGame}
                onConfirmForfeit={handleConfirmForfeit}
                onPlayAgain={handlePlayAgain}
                isAiThinking={isAiThinking} 
                onActivatePowerUp={handleActivatePowerUp}
            />
            <GameBoard
              gameState={gameState}
              onMove={handleMove}
              rotation={rotation}
              disabled={gameState.currentPlayer === 'black' || gameState.gameover || !!gameState.promotionPending}
              captureEffect={captureEffectToDisplay}
              onPlacePawn={handlePlacePawn}
              onPossessionMove={handlePossessionMove}
              onEtherealEscape={handleEtherealEscape}
              onPlaceStolenPiece={handlePlaceStolenPiece}
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
    <div className={`min-h-screen w-full text-white ${view === 'game' ? 'backdrop-blur-sm' : ''}`}>
        <EtherealCursor />
        {isLoading ? <LoadingScreen /> : (
            <>
                {renderContent()}

                <NameEntryModal 
                    isOpen={isProfileModalOpen}
                    onClose={handleProfileModalClose}
                    profile={modalProfileData}
                    onProfileChange={setModalProfileData}
                />
                
                <Modal isOpen={isRulesModalOpen} onClose={() => setIsRulesModalOpen(false)} hideHeader>
                    <div className="flex flex-col">
                        <h3 className="text-2xl font-bold text-white mb-4">Game Rules</h3>
                        <div className="space-y-4 text-gray-300">
                            <p><strong>Objective:</strong> Checkmate the opponent's King.</p>
                            <p><strong>Random Event: Phantom Thief!</strong> A phantom may randomly steal one of your pieces during the game. Use a 'Séance' power-up to bring it back!</p>
                            <p><strong>Power-ups:</strong> Capturing an opponent's piece (not a pawn) grants a random power-up. You can hold up to two. Click to activate!</p>
                            <ul className="list-disc list-inside pl-4 space-y-2">
                                <li><strong>Time Twist (⏳):</strong> Instantly adds 30 seconds to your timer.</li>
                                <li><strong>Spectral Move (👻):</strong> Your next Queen, Rook, or Bishop move can pass through one piece.</li>
                                <li><strong>Ghostly Pawn (💀):</strong> Summon a new pawn on an empty square in your starting pawn row.</li>
                                <li><strong>Ghastly Possession (👿):</strong> Possess an enemy Pawn or Knight, forcing it to make one non-capturing move.</li>
                                <li><strong>Ethereal Escape (💨):</strong> While in check, teleport your King to an adjacent safe square.</li>
                                <li><strong>Séance (🕯️):</strong> Return a piece stolen by a phantom to an empty square on your first two ranks.</li>
                            </ul>
                            <p><strong>Draws:</strong> A game can end in a draw in several ways:</p>
                            <ul className="list-disc list-inside pl-4 space-y-2">
                                <li><strong>Stalemate:</strong> A player has no legal moves, and their King is not in check.</li>
                                <li><strong>Fifty-Move Rule:</strong> 50 moves are made by each player without a pawn move or a capture.</li>
                                <li><strong>Insufficient Material:</strong> Neither player has enough pieces left to force a checkmate.</li>
                            </ul>
                            <p>Each piece has unique moves. White (your team, with orange pieces) moves first.</p>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setIsRulesModalOpen(false)}
                                className="bg-white hover:bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-md border-b-4 border-gray-400 hover:border-gray-500 transition-all duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </Modal>

                <Modal title="Settings" isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)}>
                    <p className="text-gray-300">Settings are not yet implemented. Stay tuned for spooky updates!</p>
                </Modal>
            </>
        )}
        <div className="fixed bottom-2 left-1/2 -translate-x-1/2 font-sans text-[12pt] text-white/30 pointer-events-none">
            {version}
        </div>
    </div>
  );
};

export default App;