/**
 * ====================================================================
 * MARINE PARTICLES & BUBBLE SIMULATION
 * ====================================================================
 * - Marine snow (organic abyssal flakes drifting with currents)
 * - Dynamic cavitation bubbles created during mouse water drags
 * - Bioluminescent plankton micro-sparks reacting to turbulence
 */

class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.marineSnow = [];
        this.bubbles = [];
        this.sparks = [];

        this.snowCount = 140;
        this.initMarineSnow();
    }

    initMarineSnow() {
        this.marineSnow = [];
        const w = window.innerWidth;
        const h = window.innerHeight;

        for (let i = 0; i < this.snowCount; i++) {
            this.marineSnow.push({
                x: Math.random() * w,
                y: Math.random() * h,
                z: Math.random() * 0.8 + 0.2, // Depth factor (size, speed, alpha)
                radius: Math.random() * 2.2 + 0.8,
                vx: (Math.random() - 0.5) * 0.4,
                vy: Math.random() * 0.5 + 0.2,
                wobblePhase: Math.random() * Math.PI * 2,
                wobbleSpeed: Math.random() * 0.8 + 0.4,
                alpha: Math.random() * 0.4 + 0.2
            });
        }
    }

    /**
     * Spawn bubbles along mouse drag vector
     */
    spawnDragBubbles(x, y, vx, vy, count = 3) {
        if (this.bubbles.length >= 65) return; // Prevent performance drop during heavy interaction
        const allowed = Math.min(count, 65 - this.bubbles.length);

        for (let i = 0; i < allowed; i++) {
            const spread = 18;
            const r = Math.random() * 4.5 + 1.8;
            this.bubbles.push({
                x: x + (Math.random() - 0.5) * spread,
                y: y + (Math.random() - 0.5) * spread,
                vx: (Math.random() - 0.5) * 1.5 + vx * 0.12,
                vy: -Math.random() * 3.5 - 1.5, // Buoyant upward acceleration
                radius: r,
                initialRadius: r,
                life: 1.0,
                decay: Math.random() * 0.015 + 0.008,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: Math.random() * 4 + 2
            });
        }
    }

    /**
     * Spawn bioluminescent sparks on turbulence or creature tap
     */
    spawnSparks(x, y, count = 16, rawColor = 'rgba(70, 230, 255, ') {
        if (this.sparks.length >= 80) return;
        const allowed = Math.min(count, 80 - this.sparks.length);

        // Normalize color to "rgba(r, g, b, " format
        let colorPrefix = 'rgba(70, 230, 255, ';
        if (typeof rawColor === 'string') {
            if (rawColor.startsWith('#')) {
                let h = rawColor.replace('#', '');
                if (h.length === 3) h = h.split('').map(c => c + c).join('');
                const intVal = parseInt(h, 16) || 0;
                const r = (intVal >> 16) & 255;
                const g = (intVal >> 8) & 255;
                const b = intVal & 255;
                colorPrefix = `rgba(${r}, ${g}, ${b}, `;
            } else if (rawColor.startsWith('rgba(') && rawColor.endsWith(', ')) {
                colorPrefix = rawColor;
            } else if (rawColor.startsWith('rgb(')) {
                colorPrefix = rawColor.replace('rgb(', 'rgba(').replace(')', ', ');
            }
        }

        for (let i = 0; i < allowed; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3.5 + 1.0;
            this.sparks.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: colorPrefix,
                radius: Math.random() * 2.0 + 1.2,
                life: 1.0,
                decay: Math.random() * 0.02 + 0.015
            });
        }
    }

    resize() {
        this.initMarineSnow();
    }

    update(dt) {
        const w = window.innerWidth;
        const h = window.innerHeight;

        // 1. Update Marine Snow
        for (let i = 0; i < this.marineSnow.length; i++) {
            const p = this.marineSnow[i];
            p.wobblePhase += dt * p.wobbleSpeed;
            p.x += (p.vx + Math.sin(p.wobblePhase) * 0.3) * p.z;
            p.y += p.vy * p.z;

            // Wrap edges
            if (p.y > h + 10) {
                p.y = -10;
                p.x = Math.random() * w;
            }
            if (p.x < -10) p.x = w + 10;
            if (p.x > w + 10) p.x = -10;
        }

        // 2. Update Bubbles
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const b = this.bubbles[i];
            b.wobble += dt * b.wobbleSpeed;
            b.x += b.vx + Math.sin(b.wobble) * 0.7;
            b.y += b.vy;
            b.vy -= dt * 4.2; // Buoyancy acceleration
            b.life -= b.decay;

            if (b.y < -20 || b.life <= 0) {
                this.bubbles.splice(i, 1);
            }
        }

        // 3. Update Sparks
        for (let i = this.sparks.length - 1; i >= 0; i--) {
            const s = this.sparks[i];
            s.x += s.vx;
            s.y += s.vy;
            s.vx *= 0.94;
            s.vy *= 0.94;
            s.life -= s.decay;

            if (s.life <= 0) {
                this.sparks.splice(i, 1);
            }
        }
    }

    render() {
        const ctx = this.ctx;

        // 1. Render Marine Snow
        for (let i = 0; i < this.marineSnow.length; i++) {
            const p = this.marineSnow[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * p.z, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(180, 225, 245, ${p.alpha * p.z * 0.7})`;
            ctx.fill();
        }

        // 2. Render Bubbles with glassy aquatic sheen
        for (let i = 0; i < this.bubbles.length; i++) {
            const b = this.bubbles[i];
            ctx.save();
            ctx.translate(b.x, b.y);

            // Bubble body
            ctx.beginPath();
            ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(140, 210, 245, ${0.18 * b.life})`;
            ctx.fill();

            // Bubble rim
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = `rgba(200, 240, 255, ${0.65 * b.life})`;
            ctx.stroke();

            // Specular sunlight highlight on top-left of bubble
            ctx.beginPath();
            ctx.arc(-b.radius * 0.35, -b.radius * 0.35, b.radius * 0.28, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.85 * b.life})`;
            ctx.fill();

            ctx.restore();
        }

        // 3. Render Sparks
        for (let i = 0; i < this.sparks.length; i++) {
            const s = this.sparks[i];
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius * s.life, 0, Math.PI * 2);
            ctx.fillStyle = s.color + (s.life * 0.9) + ')';
            ctx.fill();
        }
    }
}

window.ParticleSystem = ParticleSystem;
