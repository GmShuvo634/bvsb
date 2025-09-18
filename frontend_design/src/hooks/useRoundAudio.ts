// frontend_design/src/hooks/useRoundAudio.ts
import { useEffect, useRef } from 'react';
import { soundService, RoundPhase } from '@/services/soundService';

interface UseRoundAudioOptions {
  enabled?: boolean;
  autoStartAmbience?: boolean;
}

interface UseRoundAudioReturn {
  setRoundPhase: (phase: RoundPhase) => void;
  getCurrentPhase: () => RoundPhase;
  handleRoundStart: () => void;
  handleBettingEnd: () => void;
  handleRoundSettlement: () => void;
  handleRoundComplete: () => void;
  handleWin: () => void;
  handleLoss: () => void;
}

export const useRoundAudio = (options: UseRoundAudioOptions = {}): UseRoundAudioReturn => {
  const { enabled = true, autoStartAmbience = true } = options;
  const lastPhaseRef = useRef<RoundPhase>(RoundPhase.WAITING);
  const isInitializedRef = useRef(false);

  // Initialize sound service on first use
  useEffect(() => {
    if (enabled && !isInitializedRef.current) {
      // Initialize with user interaction when available
      const handleFirstInteraction = () => {
        soundService.initializeWithUserInteraction();
        if (autoStartAmbience) {
          soundService.startAmbience();
        }
        isInitializedRef.current = true;
        
        // Remove listeners after first interaction
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
        document.removeEventListener('touchstart', handleFirstInteraction);
      };

      document.addEventListener('click', handleFirstInteraction);
      document.addEventListener('keydown', handleFirstInteraction);
      document.addEventListener('touchstart', handleFirstInteraction);

      return () => {
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
        document.removeEventListener('touchstart', handleFirstInteraction);
      };
    }
  }, [enabled, autoStartAmbience]);

  const setRoundPhase = (phase: RoundPhase) => {
    if (!enabled) return;
    
    const previousPhase = lastPhaseRef.current;
    lastPhaseRef.current = phase;
    
    console.log(`[useRoundAudio] Phase change: ${previousPhase} -> ${phase}`);
    soundService.setRoundPhase(phase);
  };

  const getCurrentPhase = (): RoundPhase => {
    return soundService.getCurrentRoundPhase();
  };

  const handleRoundStart = () => {
    if (!enabled) return;
    console.log('[useRoundAudio] Round started');
    soundService.handleRoundStart();
  };

  const handleBettingEnd = () => {
    if (!enabled) return;
    console.log('[useRoundAudio] Betting ended');
    soundService.handleBettingEnd();
  };

  const handleRoundSettlement = () => {
    if (!enabled) return;
    console.log('[useRoundAudio] Round settlement');
    soundService.handleRoundSettlement();
  };

  const handleRoundComplete = () => {
    if (!enabled) return;
    console.log('[useRoundAudio] Round completed');
    soundService.handleRoundComplete();
  };

  const handleWin = () => {
    if (!enabled) return;
    console.log('[useRoundAudio] Player won');
    soundService.handleTradeResult(true);
  };

  const handleLoss = () => {
    if (!enabled) return;
    console.log('[useRoundAudio] Player lost');
    soundService.handleTradeResult(false);
  };

  return {
    setRoundPhase,
    getCurrentPhase,
    handleRoundStart,
    handleBettingEnd,
    handleRoundSettlement,
    handleRoundComplete,
    handleWin,
    handleLoss
  };
};
