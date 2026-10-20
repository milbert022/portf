/**
 * ====================================================================
 * LURKING BLURRED RED EYES IN THE ABYSS
 * ====================================================================
 * Realistic deep-sea predator eyes lurking in dark shadows:
 * - Soft volumetric crimson glow with atmospheric depth blur
 * - Organic eye tracking (pupil gaze shifts toward cursor)
 * - Micro-saccades (subtle organic twitching)
 * - Eyelid blinking physics
 * - Fear/Retreat mechanic (fades deep into darkness when approached)
 * - Relocation & re-emergence in dark corners of the deep sea
 */

class LurkingEyesSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.entities = [];
        this.mousePos = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };
        this.lightRadius = 260; // Submersible flashlight / cursor influence radius

        this.initEntities();
    }

    initEntities() {
        this.entities = [];

        // Primary menacing deep-sea stalker (larger, sharper depth presence)
        this.entities.push(this.createLurker({
            baseX: window.innerWidth * 0.78,
            baseY: window.innerHeight * 0.72,
            eyeRadius: 16,
            eyeDistance: 64,
            pupilRadius: 6,
            slit: true,
            depth: 0.95, // Deepest layer
            glowColor: 'rgba(230, 20, 30, ',
            innerColor: 'rgba(255, 110, 60, '
        }));

        // Secondary distant abyssal watcher (further back, softer blur)
        this.entities.push(this.createLurker({
            baseX: window.innerWidth * 0.18,
            baseY: window.innerHeight * 0.82,
            eyeRadius: 11,
            eyeDistance: 44,
            pupilRadius: 4,
            slit: true,
            depth: 0.98,
            glowColor: 'rgba(210, 10, 25, ',
            innerColor: 'rgba(255, 70, 40, '
        }));

        // Tertiary deep shadow presence (occasional subtle faint glimmer)
        this.entities.push(this.createLurker({
            baseX: window.innerWidth * 0.45,
            baseY: window.innerHeight * 0.88,
            eyeRadius: 9,
            eyeDistance: 38,
            pupilRadius: 3,
            slit: false,
            depth: 0.99,
            glowColor: 'rgba(180, 5, 20, ',
            innerColor: 'rgba(240, 50, 30, '
        }));
    }

    createLurker(config) {
        return {
            x: config.baseX,
            y: config.baseY,
            targetX: config.baseX,
            targetY: config.baseY,
            eyeRadius: config.eyeRadius,
            eyeDistance: config.eyeDistance,
            pupilRadius: config.pupilRadius,
            slit: config.slit,
            depth: config.depth,
            glowColor: config.glowColor,
            innerColor: config.innerColor,

            // Pupil offset
            pupilOffsetX: 0,
            pupilOffsetY: 0,
            targetPupilX: 0,
            targetPupilY: 0,

            // Saccade timer
            saccadeTimer: 2.0,

            // Blinking state
            blinkProgress: 0, // 0 = open, 1 = fully closed
            isBlinking: false,
            timeToNextBlink: 3 + Math.random() * 5,

            // Fade / retreat states
            opacity: 0.85,
            targetOpacity: 0.85,
            state: 'lurking', // 'lurking', 'fleeing', 'hidden', 'returning'
            hiddenTimer: 0,

            // Organic pulse
            pulsePhase: Math.random() * Math.PI * 2
        };
    }

    setMousePosition(x, y) {
        this.mousePos.x = x;
        this.mousePos.y = y;
    }

    resize() {
        // Rebalance positions relative to new viewport
        this.entities.forEach((entity, idx) => {
            if (idx === 0) {
                entity.targetX = window.innerWidth * 0.78;
                entity.targetY = window.innerHeight * 0.72;
            } else if (idx === 1) {
                entity.targetX = window.innerWidth * 0.18;
                entity.targetY = window.innerHeight * 0.82;
            } else {
                entity.targetX = window.innerWidth * 0.45;
                entity.targetY = window.innerHeight * 0.88;
            }
            if (entity.state === 'lurking') {
                entity.x = entity.targetX;
                entity.y = entity.targetY;
            }
        });
    }

    update(dt) {
        this.entities.forEach(entity => {
            // Smooth position interpolation
            entity.x += (entity.targetX - entity.x) * dt * 1.5;
            entity.y += (entity.targetY - entity.y) * dt * 1.5;

            // Breathing / pulsating glow
            entity.pulsePhase += dt * 1.8;
            const pulse = 0.82 + Math.sin(entity.pulsePhase) * 0.18;

            // Distance to cursor/light
            const distToMouse = Math.hypot(this.mousePos.x - entity.x, this.mousePos.y - entity.y);

            // State Machine: Lurking vs Retreating
            if (entity.state === 'lurking') {
                if (distToMouse < this.lightRadius) {
                    // Light gets too close! Start fleeing deeper into darkness
                    entity.state = 'fleeing';
                    entity.targetOpacity = 0;
                } else {
                    entity.targetOpacity = 0.85 * pulse;
                }
            } else if (entity.state === 'fleeing') {
                entity.opacity += (0 - entity.opacity) * dt * 3.5;
                if (entity.opacity < 0.03) {
                    entity.opacity = 0;
                    entity.state = 'hidden';
                    entity.hiddenTimer = 3.5 + Math.random() * 5.0; // Hide for a few seconds
                }
            } else if (entity.state === 'hidden') {
                entity.hiddenTimer -= dt;
                if (entity.hiddenTimer <= 0) {
                    // Reposition in another dark corner of the deep ocean
                    const margin = 120;
                    const side = Math.random() > 0.5;
                    entity.x = side ? (margin + Math.random() * 220) : (window.innerWidth - margin - Math.random() * 220);
                    entity.y = window.innerHeight * (0.55 + Math.random() * 0.35); // Deep lower half
                    entity.targetX = entity.x;
                    entity.targetY = entity.y;

                    // Ensure not right under mouse
                    const newDist = Math.hypot(this.mousePos.x - entity.x, this.mousePos.y - entity.y);
                    if (newDist > this.lightRadius + 80) {
                        entity.state = 'returning';
                    } else {
                        entity.hiddenTimer = 1.5; // Wait before trying again
                    }
                }
            } else if (entity.state === 'returning') {
                entity.targetOpacity = 0.85;
                if (entity.opacity > 0.75) {
                    entity.state = 'lurking';
                }
            }

            // Smooth opacity transition
            entity.opacity += (entity.targetOpacity - entity.opacity) * dt * 2.2;

            // 1. Pupil Gaze Tracking
            const dx = this.mousePos.x - entity.x;
            const dy = this.mousePos.y - entity.y;
            const angle = Math.atan2(dy, dx);
            const maxPupilShift = entity.eyeRadius * 0.38;

            entity.saccadeTimer -= dt;
            if (entity.saccadeTimer <= 0) {
                entity.saccadeTimer = 1.2 + Math.random() * 3.0;
                // Micro-saccade jitter
                const jitterAngle = angle + (Math.random() - 0.5) * 0.35;
                const jitterDist = maxPupilShift * (0.6 + Math.random() * 0.4);
                entity.targetPupilX = Math.cos(jitterAngle) * jitterDist;
                entity.targetPupilY = Math.sin(jitterAngle) * jitterDist;
            }

            entity.pupilOffsetX += (entity.targetPupilX - entity.pupilOffsetX) * dt * 6.0;
            entity.pupilOffsetY += (entity.targetPupilY - entity.pupilOffsetY) * dt * 6.0;

            // 2. Blinking Animation
            entity.timeToNextBlink -= dt;
            if (entity.timeToNextBlink <= 0 && !entity.isBlinking) {
                entity.isBlinking = true;
                entity.blinkProgress = 0;
            }

            if (entity.isBlinking) {
                entity.blinkProgress += dt * 6.0; // Fast blink
                if (entity.blinkProgress >= 2.0) {
                    entity.isBlinking = false;
                    entity.blinkProgress = 0;
                    entity.timeToNextBlink = 4.0 + Math.random() * 8.0;
                }
            }
        });
    }

    render() {
        const ctx = this.ctx;

        this.entities.forEach(entity => {
            if (entity.opacity <= 0.01) return;

            // Calculate eyelid closure: 0 -> 1 -> 0
            let eyeOpenRatio = 1.0;
            if (entity.isBlinking) {
                const b = entity.blinkProgress <= 1.0 ? entity.blinkProgress : (2.0 - entity.blinkProgress);
                eyeOpenRatio = Math.max(0.05, 1.0 - b);
            }

            const currentEyeHeight = entity.eyeRadius * eyeOpenRatio;
            const halfDist = entity.eyeDistance * 0.5;

            // Left Eye & Right Eye positions
            const eyes = [
                { x: entity.x - halfDist, y: entity.y },
                { x: entity.x + halfDist, y: entity.y }
            ];

            eyes.forEach(eye => {
                ctx.save();
                ctx.translate(eye.x, eye.y);

                const currentOpacity = entity.opacity;

                // 1. Wide Abyssal Red Bloom (Atmospheric Depth Blur)
                const outerBloomRadius = entity.eyeRadius * 5.5;
                const bloomGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, outerBloomRadius);
                bloomGrad.addColorStop(0, entity.glowColor + (0.55 * currentOpacity) + ')');
                bloomGrad.addColorStop(0.3, entity.glowColor + (0.28 * currentOpacity) + ')');
                bloomGrad.addColorStop(0.7, entity.glowColor + (0.08 * currentOpacity) + ')');
                bloomGrad.addColorStop(1, 'rgba(180, 0, 10, 0)');

                ctx.fillStyle = bloomGrad;
                ctx.beginPath();
                ctx.arc(0, 0, outerBloomRadius, 0, Math.PI * 2);
                ctx.fill();

                // 2. Focused Glowing Sclera / Iris (Blurred Ellipse)
                ctx.beginPath();
                ctx.ellipse(0, 0, entity.eyeRadius * 1.3, currentEyeHeight * 1.3, 0, 0, Math.PI * 2);
                const irisGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, entity.eyeRadius * 1.3);
                irisGrad.addColorStop(0, entity.innerColor + (0.95 * currentOpacity) + ')');
                irisGrad.addColorStop(0.5, entity.glowColor + (0.75 * currentOpacity) + ')');
                irisGrad.addColorStop(1, 'rgba(100, 0, 5, 0)');
                ctx.fillStyle = irisGrad;
                ctx.fill();

                // 3. Eerie Pupil (Slit or Ellipse tracking cursor)
                if (eyeOpenRatio > 0.25) {
                    ctx.save();
                    // Clip inside eye socket
                    ctx.beginPath();
                    ctx.ellipse(0, 0, entity.eyeRadius, currentEyeHeight, 0, 0, Math.PI * 2);
                    ctx.clip();

                    const px = entity.pupilOffsetX;
                    const py = entity.pupilOffsetY * eyeOpenRatio;

                    // Slit predator pupil
                    ctx.beginPath();
                    if (entity.slit) {
                        ctx.ellipse(px, py, entity.pupilRadius * 0.45, entity.pupilRadius * 1.7 * eyeOpenRatio, 0, 0, Math.PI * 2);
                    } else {
                        ctx.ellipse(px, py, entity.pupilRadius * 0.8, entity.pupilRadius * 0.8 * eyeOpenRatio, 0, 0, Math.PI * 2);
                    }
                    ctx.fillStyle = `rgba(12, 1, 2, ${0.92 * currentOpacity})`;
                    ctx.fill();

                    // Hot specular gleam on the slit pupil edge
                    ctx.beginPath();
                    ctx.arc(px - 1, py - 2 * eyeOpenRatio, 1.4, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 230, 210, ${0.85 * currentOpacity})`;
                    ctx.fill();

                    ctx.restore();
                }

                ctx.restore();
            });
        });
    }

    getStatus() {
        let hasFleeing = false;
        let hasReturning = false;
        let allHidden = true;

        for (const e of this.entities) {
            if (e.state === 'fleeing') hasFleeing = true;
            if (e.state === 'returning') hasReturning = true;
            if (e.state !== 'hidden') allHidden = false;
        }

        if (hasFleeing) return 'EVADING SPOTLIGHT';
        if (allHidden) return 'HIDDEN IN TRENCH';
        if (hasReturning) return 'EMERGING FROM SHADOWS';
        return 'ACTIVE IN SHADOWS';
    }
}

window.LurkingEyesSystem = LurkingEyesSystem;
