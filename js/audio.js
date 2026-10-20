/**
 * ====================================================================
 * DEEP SEA SYNTHETIC AUDIO ENGINE (Web Audio API)
 * ====================================================================
 * Fully procedural underwater soundscape with zero external dependencies:
 * - Abyssal ambient drone (sub-bass hum + filtered noise resonance)
 * - Hydrodynamic water wave swoosh & bubble sounds on mouse drag
 * - Ethereal bioluminescent sonar ping on creature tap
 * - Camera zoom whoosh sound
 */

class DeepSeaAudioEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = true;
        this.masterGain = null;
        this.ambientGain = null;
        this.isInitialized = false;

        // Ambient nodes
        this.droneOsc1 = null;
        this.droneOsc2 = null;
        this.noiseNode = null;
        this.ambientFilter = null;
        this.lfo = null;
        this.lfoGain = null;

        // Wave drag throttle
        this.lastDragSoundTime = 0;
    }

    init() {
        if (this.isInitialized) return;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;

            this.ctx = new AudioContext();

            // Master Gain
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.6, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);

            // Ambient Sub-graph
            this.ambientGain = this.ctx.createGain();
            this.ambientGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
            this.ambientGain.connect(this.masterGain);

            // Preallocate 1-second shared noise buffer for drag sounds (avoids GC allocations)
            const sharedBufferSize = this.ctx.sampleRate;
            this.sharedNoiseBuffer = this.ctx.createBuffer(1, sharedBufferSize, this.ctx.sampleRate);
            const noiseData = this.sharedNoiseBuffer.getChannelData(0);
            for (let i = 0; i < sharedBufferSize; i++) {
                noiseData[i] = (Math.random() * 2 - 1) * 0.5;
            }

            this.setupAmbientDrone();
            this.isInitialized = true;
        } catch (e) {
            console.warn("AudioContext initialization error:", e);
        }
    }

    setupAmbientDrone() {
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // 1. Deep Sub-Bass Drones (Atlantic trench pressure resonance)
        this.droneOsc1 = this.ctx.createOscillator();
        this.droneOsc1.type = 'sine';
        this.droneOsc1.frequency.setValueAtTime(42, now); // 42 Hz deep hum

        this.droneOsc2 = this.ctx.createOscillator();
        this.droneOsc2.type = 'triangle';
        this.droneOsc2.frequency.setValueAtTime(56.5, now); // Harmonics

        const droneFilter = this.ctx.createBiquadFilter();
        droneFilter.type = 'lowpass';
        droneFilter.frequency.setValueAtTime(110, now);
        droneFilter.Q.setValueAtTime(3.0, now);

        const oscGain = this.ctx.createGain();
        oscGain.gain.setValueAtTime(0.25, now);

        this.droneOsc1.connect(droneFilter);
        this.droneOsc2.connect(droneFilter);
        droneFilter.connect(oscGain);
        oscGain.connect(this.ambientGain);

        this.droneOsc1.start();
        this.droneOsc2.start();

        // 2. Underwater Filtered Ocean Noise (Hydrophone water mass)
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            // Brown / pink noise approximation for deep water current rumble
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
            b6 = white * 0.115926;
        }

        const whiteNoiseSource = this.ctx.createBufferSource();
        whiteNoiseSource.buffer = noiseBuffer;
        whiteNoiseSource.loop = true;

        this.ambientFilter = this.ctx.createBiquadFilter();
        this.ambientFilter.type = 'bandpass';
        this.ambientFilter.frequency.setValueAtTime(95, now);
        this.ambientFilter.Q.setValueAtTime(1.8, now);

        // LFO for slow tidal water swell modulation
        this.lfo = this.ctx.createOscillator();
        this.lfo.type = 'sine';
        this.lfo.frequency.setValueAtTime(0.12, now); // 8-second slow breathing wave

        this.lfoGain = this.ctx.createGain();
        this.lfoGain.gain.setValueAtTime(35, now);

        this.lfo.connect(this.lfoGain);
        this.lfoGain.connect(this.ambientFilter.frequency);
        this.lfo.start();

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.35, now);

        whiteNoiseSource.connect(this.ambientFilter);
        this.ambientFilter.connect(noiseGain);
        noiseGain.connect(this.ambientGain);

        whiteNoiseSource.start();
    }

    toggleMute() {
        if (!this.isInitialized) {
            this.init();
        }

        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        this.isMuted = !this.isMuted;

        if (this.masterGain && this.ctx) {
            const now = this.ctx.currentTime;
            this.masterGain.gain.cancelScheduledValues(now);
            if (this.isMuted) {
                this.masterGain.gain.setTargetAtTime(0, now, 0.1);
            } else {
                this.masterGain.gain.setTargetAtTime(0.65, now, 0.2);
            }
        }

        return this.isMuted;
    }

    /**
     * Play hydrodynamic water ripple / wave drag audio
     * @param {number} speed - Drag velocity magnitude
     */
    playWaterWaveSound(speed = 1.0) {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;

        // Throttle to avoid audio stuttering
        if (now - this.lastDragSoundTime < 0.12) return;
        this.lastDragSoundTime = now;

        try {
            const intensity = Math.min(Math.max(speed / 8, 0.2), 1.2);
            const duration = 0.25 + intensity * 0.15;

            // Reuse preallocated shared noise buffer to prevent GC spikes
            const noise = this.ctx.createBufferSource();
            noise.buffer = this.sharedNoiseBuffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(240 + Math.random() * 120, now);
            filter.frequency.exponentialRampToValueAtTime(140, now + duration);
            filter.Q.setValueAtTime(4.0, now);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.22 * intensity, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            noise.onended = () => {
                try {
                    noise.disconnect();
                    filter.disconnect();
                    gain.disconnect();
                } catch (e) {}
            };

            noise.start(now);
            noise.stop(now + duration);

            // Also play an occasional subtle bubble chirp
            if (Math.random() > 0.4) {
                this.playBubbleChirp(now + 0.03);
            }
        } catch (e) {}
    }

    playBubbleChirp(time) {
        if (!this.ctx || this.isMuted) return;
        const now = time || this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const startFreq = 400 + Math.random() * 350;
        const endFreq = startFreq + 250 + Math.random() * 200;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.09);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.onended = () => {
            try {
                osc.disconnect();
                gain.disconnect();
            } catch (e) {}
        };

        osc.start(now);
        osc.stop(now + 0.1);
    }

    /**
     * Play celestial bioluminescent chime when creature is tapped
     */
    playCreatureTapSound() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;

        try {
            // Harmonic chime frequencies
            const freqs = [440, 659.25, 880, 1318.5]; // Ethereal chord
            freqs.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * 0.04);

                const dur = 1.4 + idx * 0.2;
                gain.gain.setValueAtTime(0.001, now + idx * 0.04);
                gain.gain.linearRampToValueAtTime(0.12 / (idx + 1), now + idx * 0.04 + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

                osc.connect(gain);
                gain.connect(this.masterGain);

                osc.start(now + idx * 0.04);
                osc.stop(now + dur);
            });

            // Sub-boom resonance for camera zoom
            const subOsc = this.ctx.createOscillator();
            const subGain = this.ctx.createGain();
            subOsc.type = 'sine';
            subOsc.frequency.setValueAtTime(95, now);
            subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.8);

            subGain.gain.setValueAtTime(0.28, now);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

            subOsc.connect(subGain);
            subGain.connect(this.masterGain);

            subOsc.start(now);
            subOsc.stop(now + 0.85);
        } catch (e) {}
    }

    /**
     * Play reverse whoosh when closing zoom
     */
    playZoomOutSound() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(45, now);
            osc.frequency.exponentialRampToValueAtTime(120, now + 0.4);

            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + 0.5);
        } catch (e) {}
    }
}

window.DeepSeaAudioEngine = DeepSeaAudioEngine;
