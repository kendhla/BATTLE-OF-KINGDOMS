// Web Audio API Synthesizer for Medieval Sound Effects & Background Music Themes
export type MusicThemeName =
  | 'login' // The Kingdom Awakens
  | 'dashboard' // Kingdom of Legends
  | 'wizard' // War Council
  | 'kingdom_setup' // Royal Court
  | 'barracks' // Knights' Quarters
  | 'council' // Whispers of the Crown
  | 'question_bank' // Library of Wisdom
  | 'goblet' // Tournament Fanfare
  | 'question' // The Scholar's Trial
  | 'attack' // Battle for the Kingdom
  | 'role_capture' // Fallen Royalty
  | 'champions' // Hall of Glory
  | 'game_logs' // Royal Chronicles
  | 'reports' // Kingdom Records
  | 'ceremony' // Royal Honors
  | 'victory' // Victory of the Kingdom
  | 'settings'; // Castle Ambience

class MedievalSoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public musicEnabled: boolean = true;
  public sfxEnabled: boolean = true;
  public musicVolume: number = 0.35;
  public sfxVolume: number = 0.6;

  private activeTheme: MusicThemeName | null = null;
  private currentThemeGainNode: GainNode | null = null;
  private themeIntervalId: any = null;
  private themeStep: number = 0;
  private isDucked: boolean = false;
  private duckTimeout: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.initCtx();
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
      };
      window.addEventListener('pointerdown', unlock, { once: true });
      window.addEventListener('keydown', unlock, { once: true });
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Audio Ducking helper: temporarily dips music volume when loud SFX play
  private duckMusic() {
    if (!this.currentThemeGainNode || !this.ctx) return;
    const now = this.ctx.currentTime;
    const targetVol = this.musicEnabled ? this.musicVolume * 0.35 : 0;
    
    this.currentThemeGainNode.gain.cancelScheduledValues(now);
    this.currentThemeGainNode.gain.linearRampToValueAtTime(targetVol, now + 0.1);

    if (this.duckTimeout) clearTimeout(this.duckTimeout);
    this.duckTimeout = setTimeout(() => {
      if (this.currentThemeGainNode && this.ctx) {
        const restoreNow = this.ctx.currentTime;
        const normalVol = this.musicEnabled ? this.musicVolume : 0;
        this.currentThemeGainNode.gain.cancelScheduledValues(restoreNow);
        this.currentThemeGainNode.gain.linearRampToValueAtTime(normalVol, restoreNow + 1.2);
      }
    }, 1200);
  }

  // Setters for Audio Controls
  setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.currentThemeGainNode && this.ctx) {
      this.currentThemeGainNode.gain.linearRampToValueAtTime(
        this.musicEnabled ? this.musicVolume : 0,
        this.ctx.currentTime + 0.2
      );
    }
  }

  setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (this.currentThemeGainNode && this.ctx) {
      this.currentThemeGainNode.gain.linearRampToValueAtTime(
        enabled ? this.musicVolume : 0,
        this.ctx.currentTime + 0.3
      );
    }
    if (!enabled) {
      this.stopTheme();
    }
  }

  setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
  }

  // ==========================================
  // BACKGROUND MUSIC ENGINE (17 THEMES)
  // ==========================================

  playTheme(theme: MusicThemeName) {
    if (!this.musicEnabled || !this.enabled) return;
    if (this.activeTheme === theme && this.themeIntervalId) return; // Already playing

    this.initCtx();
    if (!this.ctx) return;

    // Smooth Crossfade: Fade out current theme
    if (this.currentThemeGainNode) {
      const oldGain = this.currentThemeGainNode;
      const now = this.ctx.currentTime;
      oldGain.gain.cancelScheduledValues(now);
      oldGain.gain.linearRampToValueAtTime(0.001, now + 0.8);
      setTimeout(() => {
        try { oldGain.disconnect(); } catch (e) {}
      }, 1000);
    }

    if (this.themeIntervalId) {
      clearInterval(this.themeIntervalId);
      this.themeIntervalId = null;
    }

    this.activeTheme = theme;
    this.themeStep = 0;

    // Create new theme gain node and fade in
    const newGainNode = this.ctx.createGain();
    newGainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
    newGainNode.gain.linearRampToValueAtTime(this.musicVolume, this.ctx.currentTime + 1.2);
    newGainNode.connect(this.ctx.destination);
    this.currentThemeGainNode = newGainNode;

    // Theme Sequencers (Rhythmic procedural music loops)
    const tickTimeMs = this.getThemeTickRate(theme);
    this.renderThemeStep(theme, newGainNode);

    this.themeIntervalId = setInterval(() => {
      this.themeStep++;
      if (this.activeTheme === theme && this.currentThemeGainNode === newGainNode) {
        this.renderThemeStep(theme, newGainNode);
      } else {
        clearInterval(this.themeIntervalId);
      }
    }, tickTimeMs);
  }

  stopTheme() {
    if (this.themeIntervalId) {
      clearInterval(this.themeIntervalId);
      this.themeIntervalId = null;
    }
    if (this.currentThemeGainNode && this.ctx) {
      const now = this.ctx.currentTime;
      this.currentThemeGainNode.gain.cancelScheduledValues(now);
      this.currentThemeGainNode.gain.linearRampToValueAtTime(0.001, now + 0.5);
    }
    this.activeTheme = null;
  }

  private getThemeTickRate(theme: MusicThemeName): number {
    switch (theme) {
      case 'attack': return 220; // Fast epic battle beat
      case 'goblet': return 280; // Tournament fanfare tempo
      case 'victory': return 250; // Grand celebratory tempo
      case 'barracks': return 320; // Tavern bouncy tempo
      case 'wizard': return 350; // War council march
      case 'kingdom_setup': return 380; // Royal Court tempo
      case 'champions': return 300; // Hall of Glory tempo
      case 'role_capture': return 400; // Somber dramatic pace
      case 'question': return 450; // Scholar trial calm pace
      case 'question_bank': return 500; // Peaceful library
      case 'login': return 480; // Kingdom awakens gentle
      case 'dashboard': return 400; // Kingdom of legends
      case 'council': return 550; // Whispers ambient
      case 'game_logs': return 520; // Chronicles soft
      case 'reports': return 500; // Records calm
      case 'ceremony': return 320; // Royal Honors
      case 'settings': return 600; // Castle ambience quiet
      default: return 400;
    }
  }

  private renderThemeStep(theme: MusicThemeName, targetGain: GainNode) {
    if (!this.ctx || !this.musicEnabled) return;
    const now = this.ctx.currentTime;
    const step = this.themeStep;

    // Modal scales frequencies in Hz
    const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, B4 = 493.88;
    const C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99, A5 = 880.00, B5 = 987.77, C6 = 1046.50;
    const Bb4 = 466.16, Fsharp4 = 369.99, Gsharp4 = 415.30, Csharp5 = 554.37, Eb4 = 311.13, Ab4 = 415.30, Eb5 = 622.25, Fsharp5 = 739.99;

    switch (theme) {
      case 'login': {
        // "The Kingdom Awakens" – Harp arpeggios, flute melody, castle bell
        const harpPattern = [G4, B4, D5, G5, D5, B4, G4, D5];
        this.playPluckedString(harpPattern[step % harpPattern.length], targetGain, 0.12, 0.4, 'sine');
        
        if (step % 8 === 0) {
          const fluteNotes = [D5, G5, A5, B5, A5, G5, E5, D5];
          this.playWindFlute(fluteNotes[(step / 8) % fluteNotes.length], targetGain, 0.15, 1.2);
        }
        if (step % 32 === 0) {
          this.playDistantBell(880, targetGain, 0.18);
        }
        break;
      }

      case 'dashboard': {
        // "Kingdom of Legends" – D Dorian, lute strumming, cello drone, noble horns
        const luteNotes = [D4, F4, A4, D5, A4, F4, G4, E4];
        this.playPluckedString(luteNotes[step % luteNotes.length], targetGain, 0.14, 0.35, 'triangle');

        if (step % 16 === 0) {
          this.playBowStringDrone(D4 / 2, targetGain, 0.18, 3.0); // Cello drone
        }
        if (step % 24 === 0) {
          this.playBrassHornCall(A4, targetGain, 0.2, 1.4);
        }
        break;
      }

      case 'wizard': {
        // "War Council" – D Minor march, low strings, war drum, heroic horn
        if (step % 4 === 0) {
          this.playWarDrumSynth(targetGain, 0.35);
        }
        const stringPattern = [D4, D4, F4, A4, D4, D4, G4, E4];
        this.playPluckedString(stringPattern[step % stringPattern.length], targetGain, 0.12, 0.25, 'sawtooth');
        if (step % 16 === 8) {
          this.playBrassHornCall(D4 * 1.5, targetGain, 0.22, 1.2);
        }
        break;
      }

      case 'kingdom_setup': {
        // "Royal Court" – F Lydian noble court, harp arpeggios, violin melody
        const courtPattern = [F4, A4, C5, E5, C5, A4, G4, B4];
        this.playPluckedString(courtPattern[step % courtPattern.length], targetGain, 0.15, 0.4, 'sine');
        if (step % 12 === 0) {
          this.playWindFlute(C5, targetGain, 0.16, 1.5);
        }
        break;
      }

      case 'barracks': {
        // "Knights' Quarters" – Tavern lute, bouncy fiddle, light percussion
        const tavernPattern = [G4, B4, D5, B4, C5, E5, D5, B4];
        this.playPluckedString(tavernPattern[step % tavernPattern.length], targetGain, 0.18, 0.25, 'triangle');
        if (step % 2 === 1) {
          this.playPercussionTap(targetGain, 0.12);
        }
        break;
      }

      case 'council': {
        // "Whispers of the Crown" – A Harmonic Minor, choir pad, glass bells
        if (step % 8 === 0) {
          this.playChoirPadNote(A4 / 2, targetGain, 0.15, 3.2);
        }
        if (step % 6 === 0) {
          const bellNotes = [E5, F5, Gsharp4, A5, C6];
          this.playDistantBell(bellNotes[(step / 6) % bellNotes.length], targetGain, 0.12);
        }
        break;
      }

      case 'question_bank': {
        // "Library of Wisdom" – Peaceful harp/piano, soft flute, parchment ambience
        const libraryPattern = [C4, E4, G4, B4, C5, B4, G4, E4];
        this.playPluckedString(libraryPattern[step % libraryPattern.length], targetGain, 0.12, 0.5, 'sine');
        if (step % 16 === 0) {
          this.playWindFlute(G5, targetGain, 0.12, 2.0);
        }
        break;
      }

      case 'goblet': {
        // "Tournament Fanfare" – Exciting medieval drums, trumpets
        if (step % 2 === 0) {
          this.playWarDrumSynth(targetGain, step % 8 === 0 ? 0.45 : 0.25);
        }
        const fanfarePattern = [E4, G4, B4, E5, B4, G4, E5, G5];
        if (step % 4 === 0) {
          this.playBrassHornCall(fanfarePattern[(step / 4) % fanfarePattern.length], targetGain, 0.22, 0.8);
        }
        break;
      }

      case 'question': {
        // "The Scholar's Trial" – Calm strings, harp ticks
        const trialPattern = [D4, F4, A4, D5, A4, F4];
        this.playPluckedString(trialPattern[step % trialPattern.length], targetGain, 0.1, 0.4, 'sine');
        if (step % 12 === 0) {
          this.playBowStringDrone(D4, targetGain, 0.1, 2.5);
        }
        break;
      }

      case 'attack': {
        // "Battle for the Kingdom" – Epic battle music, double war drums, brass horn riffs
        if (step % 2 === 0) {
          this.playWarDrumSynth(targetGain, 0.45);
        } else {
          this.playPercussionTap(targetGain, 0.25);
        }
        const battleNotes = [C4, Eb4, G4, C5, Bb4, G4, C4, G4];
        if (step % 4 === 0) {
          this.playBrassHornCall(battleNotes[(step / 4) % battleNotes.length], targetGain, 0.28, 0.6);
        }
        break;
      }

      case 'role_capture': {
        // "Fallen Royalty" – Dramatic somber cue, cathedral bell, brass
        if (step % 8 === 0) {
          this.playWarDrumSynth(targetGain, 0.4);
          this.playDistantBell(220, targetGain, 0.25);
        }
        if (step % 16 === 0) {
          this.playChoirPadNote(D4 / 2, targetGain, 0.22, 3.5);
        }
        break;
      }

      case 'champions': {
        // "Hall of Glory" – Triumphant orchestral, brass fanfare, noble strings
        const gloryPattern = [G4, B4, D5, G5, D5, B4, C5, E5];
        this.playPluckedString(gloryPattern[step % gloryPattern.length], targetGain, 0.16, 0.35, 'triangle');
        if (step % 8 === 0) {
          this.playBrassHornCall(G4, targetGain, 0.25, 1.2);
        }
        break;
      }

      case 'game_logs': {
        // "Royal Chronicles" – Soft lute & flute
        const chronicleNotes = [A4, C5, E5, A5, E5, C5];
        this.playPluckedString(chronicleNotes[step % chronicleNotes.length], targetGain, 0.12, 0.4, 'sine');
        break;
      }

      case 'reports': {
        // "Kingdom Records" – Calm strings & piano
        const reportNotes = [Eb4, G4, Bb4, Eb5, Bb4, G4];
        this.playPluckedString(reportNotes[step % reportNotes.length], targetGain, 0.12, 0.45, 'sine');
        break;
      }

      case 'ceremony': {
        // "Royal Honors" – Grand ceremonial trumpets & choir
        if (step % 4 === 0) {
          const honorBrass = [D4, Fsharp4, A4, D5];
          this.playBrassHornCall(honorBrass[(step / 4) % honorBrass.length], targetGain, 0.25, 1.0);
        }
        if (step % 12 === 0) {
          this.playChoirPadNote(D4, targetGain, 0.2, 2.5);
        }
        break;
      }

      case 'victory': {
        // "Victory of the Kingdom" – Epic finale, trumpets, bells, celebration drums
        if (step % 2 === 0) {
          this.playWarDrumSynth(targetGain, 0.4);
        }
        const victoryNotes = [D4, Fsharp4, A4, D5, Fsharp5, D5, A4, Fsharp4];
        this.playBrassHornCall(victoryNotes[step % victoryNotes.length], targetGain, 0.28, 0.5);
        if (step % 16 === 0) {
          this.playDistantBell(1046.50, targetGain, 0.3); // High victory bell C6
        }
        break;
      }

      case 'settings': {
        // "Castle Ambience" – Quiet harp, fireplace, wind
        if (step % 8 === 0) {
          const ambientHarp = [E4, G4, B4, E5];
          this.playPluckedString(ambientHarp[(step / 8) % ambientHarp.length], targetGain, 0.08, 0.6, 'sine');
        }
        break;
      }
    }
  }

  // Instrument Synthesizer Helpers
  private playPluckedString(freq: number, targetGain: GainNode, vol: number, decay: number, type: OscillatorType = 'sine') {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(vol * this.musicVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + decay);

    osc.connect(gain);
    gain.connect(targetGain);

    osc.start();
    osc.stop(this.ctx.currentTime + decay);
  }

  private playWindFlute(freq: number, targetGain: GainNode, vol: number, duration: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    // Vibrato
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(5, this.ctx.currentTime); // 5Hz vibrato
    lfoGain.gain.setValueAtTime(3, this.ctx.currentTime);
    lfo.connect(osc.frequency);
    lfo.start();
    lfo.stop(this.ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol * this.musicVolume, this.ctx.currentTime + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(targetGain);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  private playBrassHornCall(freq: number, targetGain: GainNode, vol: number, duration: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(1800, this.ctx.currentTime + 0.1);
    filter.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol * this.musicVolume, this.ctx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(targetGain);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  private playChoirPadNote(freq: number, targetGain: GainNode, vol: number, duration: number) {
    if (!this.ctx) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc2.frequency.setValueAtTime(freq * 1.005, this.ctx.currentTime); // Slight detune for choir thickness

    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol * this.musicVolume, this.ctx.currentTime + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(targetGain);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + duration);
    osc2.stop(this.ctx.currentTime + duration);
  }

  private playBowStringDrone(freq: number, targetGain: GainNode, vol: number, duration: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol * this.musicVolume, this.ctx.currentTime + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(targetGain);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  private playWarDrumSynth(targetGain: GainNode, vol: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(vol * this.musicVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(targetGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  private playPercussionTap(targetGain: GainNode, vol: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(vol * this.musicVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(targetGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  private playDistantBell(freq: number, targetGain: GainNode, vol: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(vol * this.musicVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.0);

    osc.connect(gain);
    gain.connect(targetGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 2.0);
  }

  // ==========================================
  // AMBIENT ENVIRONMENTAL SOUND EFFECTS (SFX)
  // ==========================================

  playTorchFlames() {
    if (!this.sfxEnabled || !this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    this.duckMusic();

    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  playCastleWind() {
    if (!this.sfxEnabled || !this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 1.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(250, this.ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(500, this.ctx.currentTime + 0.7);
    filter.frequency.linearRampToValueAtTime(200, this.ctx.currentTime + 1.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1 * this.sfxVolume, this.ctx.currentTime + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  playBirdChirp() {
    if (!this.sfxEnabled || !this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(3200, this.ctx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(2800, this.ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.15 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playChurchBell() {
    if (!this.sfxEnabled || !this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    this.duckMusic();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 2.0);

    gain.gain.setValueAtTime(0.25 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 2.5);
  }

  playFootsteps() {
    if (!this.sfxEnabled || !this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    [0, 0.2, 0.4].forEach((delay) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime + delay);
      osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + delay + 0.08);

      gain.gain.setValueAtTime(0.12 * this.sfxVolume, this.ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + 0.08);
    });
  }

  playTrumpetFanfare() {
    if (!this.sfxEnabled || !this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    this.duckMusic();

    const notes = [
      { f: 392, t: 0, d: 0.15 },
      { f: 523.25, t: 0.15, d: 0.15 },
      { f: 659.25, t: 0.3, d: 0.15 },
      { f: 783.99, t: 0.45, d: 0.6 },
    ];
    notes.forEach((n) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(n.f, this.ctx.currentTime + n.t);

      gain.gain.setValueAtTime(0.25 * this.sfxVolume, this.ctx.currentTime + n.t);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + n.t + n.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + n.t);
      osc.stop(this.ctx.currentTime + n.t + n.d);
    });
  }

  playCheeringFireworks() {
    if (!this.sfxEnabled || !this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    this.duckMusic();

    // Firework pops
    [0, 0.25, 0.5, 0.8, 1.1].forEach((delay) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, this.ctx.currentTime + delay);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + delay + 0.1);
      osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + delay + 0.3);

      gain.gain.setValueAtTime(0.3 * this.sfxVolume, this.ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + 0.3);
    });
  }

  // ==========================================
  // EXISTING GAME SOUND EFFECTS (SFX)
  // ==========================================

  playCardFlip() {
    if (!this.sfxEnabled || !this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.2 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playGobletSelect() {
    if (!this.sfxEnabled || !this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.2 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playGobletReveal() {
    if (!this.sfxEnabled || !this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    this.duckMusic();

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const startTime = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.25 * this.sfxVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  }

  playScrollOpen() {
    if (!this.sfxEnabled || !this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.Q.setValueAtTime(3, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  playTick() {
    if (!this.sfxEnabled || !this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.05 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playChestUnlock(isPositive: boolean = true) {
    if (!this.sfxEnabled || !this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    this.duckMusic();

    if (isPositive) {
      const freqs = [440, 554.37, 659.25, 880];
      freqs.forEach((f, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime + i * 0.1);

        gain.gain.setValueAtTime(0.2 * this.sfxVolume, this.ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.1 + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + i * 0.1);
        osc.stop(this.ctx.currentTime + i * 0.1 + 0.5);
      });
    } else {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.2 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    }
  }

  playVictoryFanfare() {
    if (!this.sfxEnabled || !this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    this.duckMusic();

    const notes = [
      { f: 261.63, d: 0.2, t: 0 },
      { f: 329.63, d: 0.2, t: 0.2 },
      { f: 392.00, d: 0.2, t: 0.4 },
      { f: 523.25, d: 0.3, t: 0.6 },
      { f: 659.25, d: 0.3, t: 0.9 },
      { f: 783.99, d: 0.3, t: 1.2 },
      { f: 1046.50, d: 0.8, t: 1.5 },
    ];

    notes.forEach((n) => {
      if (!this.ctx) return;
      const startTime = this.ctx.currentTime + n.t;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, startTime);

      gain.gain.setValueAtTime(0.3 * this.sfxVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + n.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + n.d);
    });
  }

  playSwordClash() {
    if (!this.sfxEnabled || !this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    this.duckMusic();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.35 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(3200, this.ctx.currentTime);
    gain2.gain.setValueAtTime(0.15 * this.sfxVolume, this.ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start();
    osc2.stop(this.ctx.currentTime + 0.4);
  }

  playBattleHorn() {
    if (!this.sfxEnabled || !this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    this.duckMusic();

    const notes = [146.83, 220, 293.66];
    notes.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12 * this.sfxVolume, this.ctx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 1.2);
    });
  }

  playMagicExplosion() {
    if (!this.sfxEnabled || !this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    this.duckMusic();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.3);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.8);

    gain.gain.setValueAtTime(0.3 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.8);
  }

  playScoreTick(isPositive: boolean = true) {
    if (!this.sfxEnabled || !this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isPositive ? 'sine' : 'sawtooth';
    const pitch = isPositive ? 600 + Math.random() * 200 : 300 - Math.random() * 100;
    osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.08 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playJokerSound() {
    if (!this.sfxEnabled || !this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    this.duckMusic();

    const freqs = [500, 420, 350, 280, 200];
    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const startTime = this.ctx.currentTime + idx * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, startTime);

      gain.gain.setValueAtTime(0.18 * this.sfxVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.15);
    });
  }

  playHarpFlourish() {
    if (!this.sfxEnabled || !this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [392, 523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const startTime = this.ctx.currentTime + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.15 * this.sfxVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  }

  playHammerImpact() {
    if (!this.sfxEnabled || !this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.25 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playWarDrum() {
    if (!this.sfxEnabled || !this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.4 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  playSwordSlash() {
    if (!this.sfxEnabled || !this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 0.3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(3000, this.ctx.currentTime + 0.15);
    filter.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.3);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();

    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1800, this.ctx.currentTime + 0.05);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.25);
    oscGain.gain.setValueAtTime(0.15 * this.sfxVolume, this.ctx.currentTime + 0.05);
    oscGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(this.ctx.currentTime + 0.05);
    osc.stop(this.ctx.currentTime + 0.25);
  }

  playChestOpen() {
    if (!this.sfxEnabled || !this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    this.duckMusic();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.25 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.6);

    setTimeout(() => {
      if (!this.ctx) return;
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const startTime = this.ctx.currentTime + idx * 0.07;
        const chimeOsc = this.ctx.createOscillator();
        const chimeGain = this.ctx.createGain();
        chimeOsc.type = 'sine';
        chimeOsc.frequency.setValueAtTime(freq, startTime);
        chimeGain.gain.setValueAtTime(0.2 * this.sfxVolume, startTime);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
        chimeOsc.connect(chimeGain);
        chimeGain.connect(this.ctx.destination);
        chimeOsc.start(startTime);
        chimeOsc.stop(startTime + 0.5);
      });
    }, 400);
  }

  playMagicalHum() {
    if (!this.sfxEnabled || !this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(261.63, this.ctx.currentTime + 1.5);
    gain.gain.setValueAtTime(0.01 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15 * this.sfxVolume, this.ctx.currentTime + 0.5);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 1.8);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 1.8);
  }

  playGobletRise(index: number = 0) {
    if (!this.sfxEnabled || !this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const scale = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5, 1174.66, 1318.51];
    const freq = scale[index % scale.length];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq * 0.5, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.6);
  }

  playBellChime() {
    if (!this.sfxEnabled || !this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.8);

    gain.gain.setValueAtTime(0.3 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.8);
  }

  playGateRattle() {
    if (!this.sfxEnabled || !this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(45, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.35 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.6);

    [0.1, 0.25, 0.4].forEach((t) => {
      if (!this.ctx) return;
      const clank = this.ctx.createOscillator();
      const cGain = this.ctx.createGain();
      clank.type = 'square';
      clank.frequency.setValueAtTime(350 + Math.random() * 200, this.ctx.currentTime + t);
      cGain.gain.setValueAtTime(0.15 * this.sfxVolume, this.ctx.currentTime + t);
      cGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + t + 0.12);
      clank.connect(cGain);
      cGain.connect(this.ctx.destination);
      clank.start(this.ctx.currentTime + t);
      clank.stop(this.ctx.currentTime + t + 0.12);
    });
  }

  playGateOpen() {
    if (!this.sfxEnabled || !this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(70, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 1.2);
    gain.gain.setValueAtTime(0.4 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 1.3);

    setTimeout(() => {
      if (!this.ctx) return;
      this.playMagicalHum();
    }, 300);
  }
}

export const sound = new MedievalSoundEngine();

