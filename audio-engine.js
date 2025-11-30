// Audio Engine for Sorting Animation Sounds
class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.isEnabled = true;
        this.volume = 0.3;
        this.initAudioContext();
        this.noteFrequencies = {
            C4: 261.63,
            D4: 293.66,
            E4: 329.63,
            F4: 349.23,
            G4: 392.00,
            A4: 440.00,
            B4: 493.88,
            C5: 523.25,
            D5: 587.33,
            E5: 659.25,
            F5: 698.46,
            G5: 783.99
        };
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }

    // Play a tone for comparison - soft and pleasant
    playComparison(frequency = null) {
        if (!this.isEnabled || !this.audioContext) return;
        
        const freq = frequency || this.noteFrequencies.C4;
        this.playTone(freq, 0.08, 'sine', 0.12);
    }

    // Play a tone for swap - crisp and clear
    playSwap(frequency = null) {
        if (!this.isEnabled || !this.audioContext) return;
        
        const freq = frequency || this.noteFrequencies.E4;
        // Use triangle for softer sound than square
        this.playTone(freq, 0.12, 'triangle', 0.18);
    }

    // Play a tone for pivot selection - bright and clear
    playPivot(frequency = null) {
        if (!this.isEnabled || !this.audioContext) return;
        
        const freq = frequency || this.noteFrequencies.G4;
        this.playTone(freq, 0.10, 'triangle', 0.15);
    }

    // Play a tone for merge/combine - smooth and flowing
    playMerge(frequency = null) {
        if (!this.isEnabled || !this.audioContext) return;
        
        const freq = frequency || this.noteFrequencies.A4;
        // Longer, more musical tone
        this.playTone(freq, 0.12, 'sine', 0.15);
        
        // Add a subtle higher note for harmony
        setTimeout(() => {
            if (this.isEnabled && this.audioContext) {
                this.playTone(freq * 1.5, 0.08, 'sine', 0.08);
            }
        }, 20);
    }

    // Play a tone when element is sorted - celebratory
    playSorted(frequency = null) {
        if (!this.isEnabled || !this.audioContext) return;
        
        const freq = frequency || this.noteFrequencies.C5;
        this.playTone(freq, 0.20, 'sine', 0.25);
    }

    // Play completion sound - impressive triumphant chord
    playComplete() {
        if (!this.isEnabled || !this.audioContext) return;
        
        try {
            // Impressive triumphant chord progression - more dramatic
            const chord1 = [this.noteFrequencies.C5, this.noteFrequencies.E5, this.noteFrequencies.G5];
            const chord2 = [this.noteFrequencies.E5, this.noteFrequencies.G5, this.noteFrequencies.B5, this.noteFrequencies.C6 || 1046.50];
            
            // First chord - strong and clear
            chord1.forEach((freq, index) => {
                if (isFinite(freq) && freq > 0 && freq <= 20000) {
                    setTimeout(() => {
                        this.playTone(freq, 0.4, 'sine', 0.35);
                    }, index * 40);
                }
            });
            
            // Second chord - triumphant resolution
            setTimeout(() => {
                chord2.forEach((freq, index) => {
                    if (isFinite(freq) && freq > 0 && freq <= 20000) {
                        setTimeout(() => {
                            this.playTone(freq, 0.35, 'sine', 0.3);
                        }, index * 40);
                    }
                });
            }, 200);
            
            // Final flourish
            const finalFreq = this.noteFrequencies.C6 || 1046.50;
            if (isFinite(finalFreq) && finalFreq > 0 && finalFreq <= 20000) {
                setTimeout(() => {
                    this.playTone(finalFreq, 0.3, 'sine', 0.4);
                }, 500);
            }
        } catch (error) {
            console.warn('Error playing completion sound:', error);
        }
    }

    // Core tone generation function with enhanced sound
    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.audioContext) return;
        
        // Resume audio context if suspended (required by browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(err => {
                console.warn('Could not resume audio context:', err);
            });
            return; // Skip this call, will work on next call after resume
        }

        // Validate frequency - must be finite and positive
        if (!isFinite(frequency) || frequency <= 0 || frequency > 20000) {
            frequency = 440; // Default to A4 if invalid
        }
        
        // Validate other parameters
        if (!isFinite(duration) || duration <= 0) duration = 0.1;
        if (!isFinite(volume) || volume < 0) volume = 0.3;

        const now = this.audioContext.currentTime;
        
        // Create main oscillator
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // Add subtle harmonics for richer sound
        const harmonic2 = this.audioContext.createOscillator();
        const harmonic2Gain = this.audioContext.createGain();
        
        // Main tone
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        
        // Add second harmonic (octave up) for richness
        harmonic2.type = 'sine';
        const harmonicFreq = frequency * 2;
        harmonic2.frequency.value = (isFinite(harmonicFreq) && harmonicFreq > 0 && harmonicFreq <= 20000) ? harmonicFreq : frequency;
        harmonic2Gain.gain.value = 0.15 * volume * this.volume;
        
        // Connect harmonics
        oscillator.connect(gainNode);
        harmonic2.connect(harmonic2Gain);
        harmonic2Gain.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Smooth envelope with attack and release
        const attackTime = 0.005;
        const releaseTime = duration * 0.3;
        const sustainLevel = volume * this.volume;
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attackTime);
        gainNode.gain.setValueAtTime(sustainLevel, now + duration - releaseTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        oscillator.start(now);
        harmonic2.start(now);
        oscillator.stop(now + duration);
        harmonic2.stop(now + duration);
    }

    // Play frequency based on array value (height) - more musical
    playBarSound(height, maxHeight, type = 'comparison') {
        if (!this.isEnabled || !this.audioContext) return;
        
        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(err => {
                console.warn('Could not resume audio context:', err);
            });
        }
        
        // Validate inputs
        if (!isFinite(height) || !isFinite(maxHeight) || maxHeight <= 0) {
            height = 50;
            maxHeight = 100;
        }
        
        // Map height to frequency (C3 to C6 range for better musical range)
        const normalizedHeight = Math.max(0, Math.min(1, height / maxHeight));
        const minFreq = this.noteFrequencies.C4 || 261.63;
        const maxFreq = (this.noteFrequencies.C6 || (this.noteFrequencies.C5 * 2)) || 1046.50;
        
        // Use exponential mapping for more musical progression
        const expHeight = Math.pow(normalizedHeight, 0.7); // Slight curve for better distribution
        const frequency = minFreq + (expHeight * (maxFreq - minFreq));
        
        // Validate frequency before snapping
        if (!isFinite(frequency) || frequency <= 0) {
            return; // Skip invalid audio
        }
        
        // Snap to nearest musical note for more pleasant sound
        const musicalFrequency = this.snapToMusicalNote(frequency);
        
        // Final validation
        if (!isFinite(musicalFrequency) || musicalFrequency <= 0 || musicalFrequency > 20000) {
            return; // Skip invalid audio
        }
        
        switch (type) {
            case 'comparison':
                this.playComparison(musicalFrequency);
                break;
            case 'swap':
                this.playSwap(musicalFrequency);
                break;
            case 'pivot':
                this.playPivot(musicalFrequency);
                break;
            case 'merge':
                this.playMerge(musicalFrequency);
                break;
            case 'sorted':
                this.playSorted(musicalFrequency);
                break;
            default:
                this.playComparison(musicalFrequency);
        }
    }
    
    // Snap frequency to nearest musical note for more pleasant sound
    snapToMusicalNote(frequency) {
        const notes = [
            261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392.00, 415.30, 440.00, 466.16, 493.88,
            523.25, 554.37, 587.33, 622.25, 659.25, 698.46, 739.99, 783.99, 830.61, 880.00, 932.33, 987.77,
            1046.50
        ];
        
        let closest = notes[0];
        let minDiff = Math.abs(frequency - closest);
        
        for (const note of notes) {
            const diff = Math.abs(frequency - note);
            if (diff < minDiff) {
                minDiff = diff;
                closest = note;
            }
        }
        
        return closest;
    }

    toggle() {
        this.isEnabled = !this.isEnabled;
        return this.isEnabled;
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
}

// Create global audio engine instance
const audioEngine = new AudioEngine();
