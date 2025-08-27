// src/components/SoundControl.tsx
import React, { useState, useEffect } from 'react';
import { soundService } from '../services/soundService';

interface SoundControlProps {
  className?: string;
  showVolumeSlider?: boolean;
}

export const SoundControl: React.FC<SoundControlProps> = ({ 
  className = "",
  showVolumeSlider = false 
}) => {
  const [isMuted, setIsMuted] = useState(soundService.isSoundMuted());
  const [volume, setVolume] = useState(soundService.getVolume());
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    // Initialize sound service with user interaction
    const handleFirstInteraction = () => {
      soundService.initializeWithUserInteraction();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  const handleToggleMute = () => {
    const newMutedState = soundService.toggleMute();
    setIsMuted(newMutedState);
    
    // Play a test sound when unmuting
    if (!newMutedState) {
      soundService.playButtonClick();
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    soundService.setVolume(newVolume);
  };

  const handleTestSound = () => {
    soundService.playButtonClick();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main mute/unmute button */}
      <button
        onClick={handleToggleMute}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-[#181923] to-[#292a3a] border border-[#3f404f] hover:border-[#7074b9] rounded-lg transition-all duration-200"
        title={isMuted ? "Unmute sounds" : "Mute sounds"}
      >
        {isMuted ? (
          // Muted icon
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          // Unmuted icon
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>

      {/* Extended controls (shown on hover or when showVolumeSlider is true) */}
      {(showControls || showVolumeSlider) && (
        <div 
          className="absolute top-full left-0 mt-2 bg-[#1a1b26] border border-[#3f404f] rounded-lg shadow-xl z-50 p-4 min-w-[200px]"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <div className="space-y-4">
            {/* Volume slider */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Volume
              </label>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072" />
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  disabled={isMuted}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-xs text-gray-400 w-8">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            </div>

            {/* Test sound button */}
            <button
              onClick={handleTestSound}
              disabled={isMuted}
              className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white transition-all duration-200"
            >
              Test Sound
            </button>

            {/* Sound status */}
            <div className="text-xs text-gray-500 text-center">
              {isMuted ? "🔇 Sounds muted" : "🔊 Sounds enabled"}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e40af;
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e40af;
        }

        .slider:disabled::-webkit-slider-thumb {
          background: #6b7280;
          border-color: #4b5563;
        }

        .slider:disabled::-moz-range-thumb {
          background: #6b7280;
          border-color: #4b5563;
        }
      `}</style>
    </div>
  );
};

export default SoundControl;
