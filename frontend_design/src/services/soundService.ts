// src/services/soundService.ts
export enum SoundType {
  WIN = 'win',
  LOSE = 'lose',
  BUTTON_CLICK = 'button_click',
  AMBIENCE = 'ambience',
  NOTIFICATION = 'notification',
  ROUND_START = 'round_start',
  BETTING_END = 'betting_end',
  ROUND_SETTLE = 'round_settle'
}

export enum RoundPhase {
  WAITING = 'waiting',
  BETTING = 'betting',
  PLAYING = 'playing',
  SETTLING = 'settling',
  COMPLETED = 'completed'
}

interface SoundConfig {
  src: string;
  volume: number;
  loop: boolean;
}

class SoundService {
  private sounds: Map<SoundType, HTMLAudioElement> = new Map();
  private isMuted: boolean = false;
  private masterVolume: number = 0.7;
  private isInitialized: boolean = false;
  private currentRoundPhase: RoundPhase = RoundPhase.WAITING;
  private ambienceVolumeMultiplier: number = 1.0;

  private soundConfigs: Record<SoundType, SoundConfig> = {
    [SoundType.WIN]: {
      src: '/audio/winner.mp3',
      volume: 0.8,
      loop: false
    },
    [SoundType.LOSE]: {
      src: '/audio/winner.mp3', // Using same file for now, can be changed
      volume: 0.6,
      loop: false
    },
    [SoundType.BUTTON_CLICK]: {
      src: '/audio/winner.mp3', // Using same file for now, can be changed
      volume: 0.3,
      loop: false
    },
    [SoundType.AMBIENCE]: {
      src: '/audio/ambience.mp3',
      volume: 0.4,
      loop: true
    },
    [SoundType.NOTIFICATION]: {
      src: '/audio/winner.mp3', // Using same file for now, can be changed
      volume: 0.5,
      loop: false
    },
    [SoundType.ROUND_START]: {
      src: '/audio/winner.mp3', // Using same file for now, can be changed
      volume: 0.6,
      loop: false
    },
    [SoundType.BETTING_END]: {
      src: '/audio/winner.mp3', // Using same file for now, can be changed
      volume: 0.5,
      loop: false
    },
    [SoundType.ROUND_SETTLE]: {
      src: '/audio/winner.mp3', // Using same file for now, can be changed
      volume: 0.7,
      loop: false
    }
  };

  constructor() {
    this.loadSoundPreferences();
    this.initializeSounds();
  }

  private initializeSounds() {
    if (typeof window === 'undefined') return;

    try {
      Object.entries(this.soundConfigs).forEach(([type, config]) => {
        const audio = new Audio(config.src);
        audio.volume = config.volume * this.masterVolume;
        audio.loop = config.loop;
        audio.preload = 'auto';

        // Handle loading errors gracefully
        audio.addEventListener('error', (e) => {
          console.warn(`Failed to load sound: ${type}`, e);
        });

        this.sounds.set(type as SoundType, audio);
      });

      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize sound service:', error);
    }
  }

  private loadSoundPreferences() {
    if (typeof window === 'undefined') return;

    try {
      const savedMuted = localStorage.getItem('soundMuted');
      const savedVolume = localStorage.getItem('soundVolume');

      this.isMuted = savedMuted === 'true';
      this.masterVolume = savedVolume ? parseFloat(savedVolume) : 0.7;
    } catch (error) {
      console.warn('Failed to load sound preferences:', error);
    }
  }

  private saveSoundPreferences() {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('soundMuted', this.isMuted.toString());
      localStorage.setItem('soundVolume', this.masterVolume.toString());
    } catch (error) {
      console.warn('Failed to save sound preferences:', error);
    }
  }

  public play(soundType: SoundType) {
    if (!this.isInitialized || this.isMuted) return;

    const audio = this.sounds.get(soundType);
    if (!audio) {
      console.warn(`Sound not found: ${soundType}`);
      return;
    }

    try {
      // Reset audio to beginning
      audio.currentTime = 0;

      // Play the sound
      const playPromise = audio.play();

      // Handle play promise for browsers that require user interaction
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn(`Failed to play sound: ${soundType}`, error);
        });
      }
    } catch (error) {
      console.warn(`Error playing sound: ${soundType}`, error);
    }
  }

  public stop(soundType: SoundType) {
    const audio = this.sounds.get(soundType);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  public stopAll() {
    this.sounds.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    this.saveSoundPreferences();

    if (muted) {
      this.stopAll();
    } else {
      // Resume ambience if it was playing
      if (this.currentRoundPhase !== RoundPhase.WAITING) {
        this.startAmbience();
      }
    }
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.saveSoundPreferences();

    // Update all audio volumes
    this.sounds.forEach((audio, type) => {
      const config = this.soundConfigs[type];
      let finalVolume = config.volume * this.masterVolume;

      // Apply ambience volume multiplier for round-based volume changes
      if (type === SoundType.AMBIENCE) {
        finalVolume *= this.ambienceVolumeMultiplier;
      }

      audio.volume = finalVolume;
    });
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // Game-specific sound methods
  public playWinSound() {
    this.play(SoundType.WIN);
  }

  public playLoseSound() {
    this.play(SoundType.LOSE);
  }

  public playButtonClick() {
    this.play(SoundType.BUTTON_CLICK);
  }

  public startAmbience() {
    if (!this.isMuted) {
      this.play(SoundType.AMBIENCE);
    }
  }

  public stopAmbience() {
    this.stop(SoundType.AMBIENCE);
  }

  public playNotification() {
    this.play(SoundType.NOTIFICATION);
  }

  // Trade result handler
  public handleTradeResult(won: boolean) {
    if (won) {
      this.playWinSound();
    } else {
      this.playLoseSound();
    }
  }

  // Initialize with user interaction (required by browsers)
  public initializeWithUserInteraction() {
    if (!this.isInitialized) {
      this.initializeSounds();
    }

    // Try to play a silent sound to unlock audio context
    this.sounds.forEach(audio => {
      const originalVolume = audio.volume;
      audio.volume = 0;
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = originalVolume;
      }).catch(() => {
        // Ignore errors for silent initialization
      });
    });
  }

  // Round-aware audio methods
  public setRoundPhase(phase: RoundPhase) {
    const previousPhase = this.currentRoundPhase;
    this.currentRoundPhase = phase;

    console.log(`[SoundService] Round phase changed: ${previousPhase} -> ${phase}`);

    // Handle phase-specific audio behavior
    switch (phase) {
      case RoundPhase.WAITING:
        this.stopAmbience();
        this.ambienceVolumeMultiplier = 1.0;
        break;

      case RoundPhase.BETTING:
        if (previousPhase === RoundPhase.WAITING || previousPhase === RoundPhase.COMPLETED) {
          this.play(SoundType.ROUND_START);
          this.startAmbience();
        }
        this.ambienceVolumeMultiplier = 1.0; // Normal volume during betting
        this.updateAmbienceVolume();
        break;

      case RoundPhase.PLAYING:
        if (previousPhase === RoundPhase.BETTING) {
          this.play(SoundType.BETTING_END);
        }
        this.ambienceVolumeMultiplier = 0.7; // Lower volume during play phase
        this.updateAmbienceVolume();
        break;

      case RoundPhase.SETTLING:
        this.play(SoundType.ROUND_SETTLE);
        this.ambienceVolumeMultiplier = 0.5; // Even lower during settlement
        this.updateAmbienceVolume();
        break;

      case RoundPhase.COMPLETED:
        this.ambienceVolumeMultiplier = 1.0; // Back to normal
        this.updateAmbienceVolume();
        break;
    }
  }

  private updateAmbienceVolume() {
    const ambienceAudio = this.sounds.get(SoundType.AMBIENCE);
    if (ambienceAudio) {
      const config = this.soundConfigs[SoundType.AMBIENCE];
      ambienceAudio.volume = config.volume * this.masterVolume * this.ambienceVolumeMultiplier;
    }
  }

  public getCurrentRoundPhase(): RoundPhase {
    return this.currentRoundPhase;
  }

  // Enhanced ambience control methods are already defined above

  // Round event handlers
  public handleRoundStart() {
    this.setRoundPhase(RoundPhase.BETTING);
  }

  public handleBettingEnd() {
    this.setRoundPhase(RoundPhase.PLAYING);
  }

  public handleRoundSettlement() {
    this.setRoundPhase(RoundPhase.SETTLING);
  }

  public handleRoundComplete() {
    this.setRoundPhase(RoundPhase.COMPLETED);
  }
}

// Singleton instance
export const soundService = new SoundService();

// React hook for sound service
export function useSoundService() {
  return soundService;
}
