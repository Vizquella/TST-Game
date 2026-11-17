// audio.js - Web Audio API Procedural Sound & BGM Synthesizer
// Completely standalone - No external audio files needed!

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.sfxEnabled = true;
        this.bgmEnabled = true;
        this.masterVolume = 0.6;
        this.currentTheme = 'christmas';
        
        this.sfxGain = null;
        this.bgmGain = null;
        this.masterGain = null;
        
        this.bgmTimer = null;
        this.rainNoiseNode = null;
        this.rainGainNode = null;
        this.isInitialized = false;
        this.bgmStep = 0;
    }

    init() {
        if (this.isInitialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this.masterVolume;
            this.masterGain.connect(this.ctx.destination);
            
            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = 0.7;
            this.sfxGain.connect(this.masterGain);
            
            this.bgmGain = this.ctx.createGain();
            this.bgmGain.gain.value = 0.35;
            this.bgmGain.connect(this.masterGain);
            
            this.isInitialized = true;
            this.startBGM();
        } catch (e) {
            console.warn("Web Audio not supported or blocked", e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setMasterVolume(val) {
        this.masterVolume = Math.max(0, Math.min(1, val));
        if (this.masterGain) {
            this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
        }
    }

    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled;
        return this.sfxEnabled;
    }

    toggleBGM() {
        this.bgmEnabled = !this.bgmEnabled;
        if (!this.bgmEnabled) {
            this.stopBGM();
        } else {
            this.startBGM();
        }
        return this.bgmEnabled;
    }

    setTheme(theme) {
        this.currentTheme = theme;
        if (this.bgmEnabled && this.isInitialized) {
            this.stopBGM();
            this.startBGM();
        }
        this.playThemeChange();
    }

    // --- SOUND EFFECTS (SFX) ---

    playMove() {
        if (!this.sfxEnabled || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.start(now);
        osc.stop(now + 0.045);
    }

    playRotate() {
        if (!this.sfxEnabled || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.08);
        
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.start(now);
        osc.stop(now + 0.085);
    }

    playSoftDrop() {
        if (!this.sfxEnabled || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.03);
        
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.start(now);
        osc.stop(now + 0.035);
    }

    playHardDrop() {
        if (!this.sfxEnabled || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        
        // Punchy low-thud
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.16);
        gain.gain.setValueAtTime(0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.17);

        // Click transient
        const click = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        click.type = 'triangle';
        click.frequency.setValueAtTime(600, now);
        click.frequency.exponentialRampToValueAtTime(100, now + 0.05);
        clickGain.gain.setValueAtTime(0.3, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        click.connect(clickGain);
        clickGain.connect(this.sfxGain);
        click.start(now);
        click.stop(now + 0.055);
    }

    playHold() {
        if (!this.sfxEnabled || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        
        [440, 659.25].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.06);
            gain.gain.setValueAtTime(0.25, now + idx * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.12);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now + idx * 0.06);
            osc.stop(now + idx * 0.06 + 0.13);
        });
    }

    playLineClear(linesCount) {
        if (!this.sfxEnabled || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        
        // Dynamic chords based on lines cleared
        let freqs = [523.25, 659.25]; // Single: C5, E5
        if (linesCount === 2) freqs = [523.25, 659.25, 783.99]; // Double: C5, E5, G5
        if (linesCount === 3) freqs = [523.25, 659.25, 783.99, 1046.50]; // Triple: C5, E5, G5, C6
        if (linesCount >= 4) freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // TETRIS!!
        
        freqs.forEach((freq, i) => {
            const startTime = now + i * 0.065;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            // Choose wave based on theme
            if (this.currentTheme === 'christmas') {
                osc.type = 'sine'; // Bell like
            } else if (this.currentTheme === 'halloween') {
                osc.type = 'sawtooth'; // Eerie
            } else if (this.currentTheme === 'summer') {
                osc.type = 'triangle'; // Tropical marimba
            } else if (this.currentTheme === 'spring') {
                osc.type = 'sine'; // Spring floral chime
            } else { // Storm
                osc.type = 'sawtooth'; // Electric zap
            }
            
            osc.frequency.setValueAtTime(freq, startTime);
            
            const dur = linesCount >= 4 ? 0.35 : 0.2;
            gain.gain.setValueAtTime(0.28, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.start(startTime);
            osc.stop(startTime + dur + 0.01);
        });

        // Extra celebratory shimmer for Tetris
        if (linesCount >= 4) {
            setTimeout(() => {
                this.playTetrisSparkle();
            }, 250);
        }
    }

    playTetrisSparkle() {
        if (!this.sfxEnabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const arpeggio = [1046.50, 1318.51, 1567.98, 2093.00];
        arpeggio.forEach((f, idx) => {
            const t = now + idx * 0.05;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, t);
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t);
            osc.stop(t + 0.26);
        });
    }

    playLevelUp() {
        if (!this.sfxEnabled || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, now + i * 0.08);
            gain.gain.setValueAtTime(0.3, now + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.22);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.25);
        });
    }

    playGameOver() {
        if (!this.sfxEnabled || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const notes = [440, 415.30, 392, 349.23, 293.66];
        notes.forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(f, now + i * 0.16);
            gain.gain.setValueAtTime(0.22, now + i * 0.16);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.16 + 0.25);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now + i * 0.16);
            osc.stop(now + i * 0.16 + 0.27);
        });
    }

    playThemeChange() {
        if (!this.sfxEnabled || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.12);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.25);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.27);
    }

    // --- PROCEDURAL BACKGROUND MUSIC (BGM) & AMBIENCE ---

    startBGM() {
        if (!this.bgmEnabled || !this.ctx) return;
        this.resume();
        this.stopBGM();
        this.bgmStep = 0;

        if (this.currentTheme === 'storm' || this.currentTheme === 'rainy') {
            this.startRainAmbience();
        }

        // BGM Sequencer loop (every 300ms beat)
        this.bgmTimer = setInterval(() => {
            this.stepBGM();
        }, 320);
    }

    stopBGM() {
        if (this.bgmTimer) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
        this.stopRainAmbience();
    }

    stepBGM() {
        if (!this.bgmEnabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        this.bgmStep = (this.bgmStep + 1) % 32;

        if (this.currentTheme === 'christmas') {
            this.playChristmasNote(this.bgmStep, now);
        } else if (this.currentTheme === 'halloween') {
            this.playHalloweenNote(this.bgmStep, now);
        } else if (this.currentTheme === 'summer') {
            this.playSummerNote(this.bgmStep, now);
        } else if (this.currentTheme === 'storm' || this.currentTheme === 'rainy') {
            this.playStormNote(this.bgmStep, now);
        } else if (this.currentTheme === 'spring') {
            this.playSpringNote(this.bgmStep, now);
        }
    }

    playChristmasNote(step, now) {
        // Festive bells melody in F major / D minor
        // Notes: F4, A4, C5, D5, G4, E4, etc.
        const melody = [
            523.25, 0, 523.25, 0, 523.25, 0, 0, 0, // Jingle motif
            523.25, 0, 523.25, 0, 523.25, 0, 0, 0,
            523.25, 0, 659.25, 0, 440, 0, 493.88, 0,
            523.25, 0, 0, 0, 0, 0, 0, 0
        ];
        
        const note = melody[step];
        if (note > 0) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(note, now);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            osc.connect(gain);
            gain.connect(this.bgmGain);
            osc.start(now);
            osc.stop(now + 0.42);
        }

        // Soft warm bass pad on bar 0, 8, 16, 24
        if (step % 8 === 0) {
            const bassOsc = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();
            const bassNotes = [174.61, 220.00, 196.00, 130.81]; // F3, A3, G3, C3
            bassOsc.type = 'triangle';
            bassOsc.frequency.setValueAtTime(bassNotes[(step / 8) % 4], now);
            bassGain.gain.setValueAtTime(0.12, now);
            bassGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
            bassOsc.connect(bassGain);
            bassGain.connect(this.bgmGain);
            bassOsc.start(now);
            bassOsc.stop(now + 2.3);
        }
    }

    playHalloweenNote(step, now) {
        // Spooky music box / minor organ arpeggio in D minor
        const spookScale = [
            293.66, 311.13, 349.23, 415.30, 440.00, 311.13, 293.66, 0,
            349.23, 370.00, 415.30, 493.88, 440.00, 349.23, 311.13, 0,
            293.66, 349.23, 440.00, 587.33, 554.37, 440.00, 349.23, 0,
            220.00, 246.94, 293.66, 349.23, 311.13, 246.94, 220.00, 0
        ];
        
        const note = spookScale[step];
        if (note > 0) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(note, now);
            // Lowpass filter for spooky muffled music box feel
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(900, now);
            
            gain.gain.setValueAtTime(0.09, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.bgmGain);
            
            osc.start(now);
            osc.stop(now + 0.37);
        }

        // Sub bass drone
        if (step % 16 === 0) {
            const sub = this.ctx.createOscillator();
            const subGain = this.ctx.createGain();
            sub.type = 'sine';
            sub.frequency.setValueAtTime(73.42, now); // D2
            subGain.gain.setValueAtTime(0.18, now);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + 4.5);
            sub.connect(subGain);
            subGain.connect(this.bgmGain);
            sub.start(now);
            sub.stop(now + 4.6);
        }
    }

    playSummerNote(step, now) {
        // Bright sunny tropical marimba pentatonic riff (C, D, E, G, A)
        const summerNotes = [
            523.25, 0, 587.33, 0, 659.25, 0, 783.99, 0,
            880.00, 0, 783.99, 0, 659.25, 587.33, 523.25, 0,
            659.25, 0, 783.99, 0, 880.00, 0, 1046.50, 0,
            880.00, 783.99, 659.25, 0, 587.33, 0, 523.25, 0
        ];
        
        const note = summerNotes[step];
        if (note > 0) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note, now);
            gain.gain.setValueAtTime(0.13, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
            osc.connect(gain);
            gain.connect(this.bgmGain);
            osc.start(now);
            osc.stop(now + 0.24);
        }

        // Warm beach breeze bass
        if (step % 8 === 0) {
            const bass = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();
            bass.type = 'sine';
            const chordBass = [130.81, 146.83, 164.81, 174.61]; // C3, D3, E3, F3
            bass.frequency.setValueAtTime(chordBass[(step / 8) % 4], now);
            bassGain.gain.setValueAtTime(0.14, now);
            bassGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
            bass.connect(bassGain);
            bassGain.connect(this.bgmGain);
            bass.start(now);
            bass.stop(now + 2.1);
        }
    }

    playStormNote(step, now) {
        // High-energy driving storm synth in D minor
        const stormScale = [
            293.66, 0, 440.00, 0, 349.23, 0, 587.33, 0,
            293.66, 0, 440.00, 0, 523.25, 440.00, 349.23, 0,
            261.63, 0, 392.00, 0, 329.63, 0, 523.25, 0,
            233.08, 0, 349.23, 0, 466.16, 0, 440.00, 0
        ];

        const note = stormScale[step];
        if (note > 0) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(note, now);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1600, now);
            filter.frequency.exponentialRampToValueAtTime(400, now + 0.28);

            gain.gain.setValueAtTime(0.11, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.bgmGain);

            osc.start(now);
            osc.stop(now + 0.29);
        }

        // Heavy electric sub bass stabs
        if (step % 8 === 0) {
            const bass = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();
            bass.type = 'sawtooth';
            const chordBass = [73.42, 73.42, 65.41, 58.27]; // D2, D2, C2, Bb1
            bass.frequency.setValueAtTime(chordBass[(step / 8) % 4], now);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(280, now);

            bassGain.gain.setValueAtTime(0.2, now);
            bassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

            bass.connect(filter);
            filter.connect(bassGain);
            bassGain.connect(this.bgmGain);

            bass.start(now);
            bass.stop(now + 1.85);
        }
    }

    playSpringNote(step, now) {
        // Uplifting gentle harp / acoustic celesta melody in G major (G, A, B, D, E)
        const springMelody = [
            392.00, 0, 493.88, 0, 587.33, 0, 659.25, 0,
            783.99, 0, 659.25, 0, 587.33, 493.88, 392.00, 0,
            440.00, 0, 523.25, 0, 659.25, 0, 783.99, 0,
            880.00, 0, 783.99, 0, 659.25, 523.25, 440.00, 0
        ];

        const note = springMelody[step];
        if (note > 0) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(note, now);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
            osc.connect(gain);
            gain.connect(this.bgmGain);
            osc.start(now);
            osc.stop(now + 0.4);
        }

        // Soft floral warm bass pad
        if (step % 8 === 0) {
            const bass = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();
            bass.type = 'triangle';
            const chordBass = [196.00, 164.81, 174.61, 146.83]; // G3, E3, F3, D3
            bass.frequency.setValueAtTime(chordBass[(step / 8) % 4], now);
            bassGain.gain.setValueAtTime(0.12, now);
            bassGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
            bass.connect(bassGain);
            bassGain.connect(this.bgmGain);
            bass.start(now);
            bass.stop(now + 2.25);
        }

        // Procedural gentle bird chirps every 16 steps
        if (step === 4 || step === 20) {
            this.playBirdChirp(now + 0.05);
        }
    }

    playBirdChirp(startTime) {
        if (!this.bgmEnabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2400, startTime);
        osc.frequency.exponentialRampToValueAtTime(3200, startTime + 0.06);
        osc.frequency.exponentialRampToValueAtTime(2700, startTime + 0.12);
        gain.gain.setValueAtTime(0.04, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.14);
        osc.connect(gain);
        gain.connect(this.bgmGain);
        osc.start(startTime);
        osc.stop(startTime + 0.15);
    }

    playThunder() {
        if (!this.sfxEnabled || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;

        // 1. Low frequency rumble dive
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.exponentialRampToValueAtTime(24, now + 1.6);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 1.85);

        // 2. Filtered noise burst crackle
        const bufferSize = this.ctx.sampleRate * 1.5;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.35;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.exponentialRampToValueAtTime(80, now + 1.5);
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.45, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.sfxGain);
        noise.start(now);
        noise.stop(now + 1.65);
    }

    startRainAmbience() {
        if (this.rainNoiseNode || !this.ctx) return;
        try {
            // Generate 2 seconds of pink/brown noise buffer for natural rain sound
            const bufferSize = this.ctx.sampleRate * 2;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
                b6 = white * 0.115926;
            }

            this.rainNoiseNode = this.ctx.createBufferSource();
            this.rainNoiseNode.buffer = buffer;
            this.rainNoiseNode.loop = true;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1400, this.ctx.currentTime);

            this.rainGainNode = this.ctx.createGain();
            this.rainGainNode.gain.setValueAtTime(0.08, this.ctx.currentTime);

            this.rainNoiseNode.connect(filter);
            filter.connect(this.rainGainNode);
            this.rainGainNode.connect(this.bgmGain);

            this.rainNoiseNode.start();
        } catch (e) {
            console.warn("Rain ambience error", e);
        }
    }

    stopRainAmbience() {
        if (this.rainNoiseNode) {
            try {
                this.rainNoiseNode.stop();
                this.rainNoiseNode.disconnect();
            } catch (e) {}
            this.rainNoiseNode = null;
        }
        if (this.rainGainNode) {
            try {
                this.rainGainNode.disconnect();
            } catch (e) {}
            this.rainGainNode = null;
        }
    }
}

window.soundEngine = new SoundEngine();
