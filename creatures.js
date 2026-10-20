/**
 * ====================================================================
 * PROCEDURAL BIOLUMINESCENT DEEP-SEA CREATURES
 * ====================================================================
 * Diverse abyssal fauna with procedural swimming kinematics:
 * 1. Deep-sea Anglerfish with glowing esca & bioluminescent photophores
 * 2. Translucent Abyssal Jellyfish with pulsating bell & drifting tentacles
 * 3. Bioluminescent Lanternfish with sleek flocking & shimmering dorsal fins
 *
 * Includes hover targeting, click detection, and hitboxes for contact zoom.
 */

class SeaCreatureSystem {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.onCreatureTap = options.onCreatureTap || null;

        this.creatures = [];
        this.hoveredCreature = null;
        this.activeFocusCreature = null;

        this.initCreatures();
    }

    initCreatures() {
        this.creatures = [];
        const w = window.innerWidth;
        const h = window.innerHeight;

        // 1. Signature Bioluminescent Anglerfish (Carries primary contact beacon)
        this.creatures.push(new AnglerFish({
            id: 'angler-github',
            x: w * 0.25,
            y: h * 0.45,
            scale: 1.15,
            speed: 1.2,
            primaryColor: '#0ae4ff',
            accentColor: '#38bdf8',
            tag: 'GitHub & Contact Portal',
            channelTarget: 'github'
        }));

        // 2. Abyssal Jellyfish (Translucent, serene pulse)
        this.creatures.push(new AbyssalJellyfish({
            id: 'jelly-facebook',
            x: w * 0.68,
            y: h * 0.35,
            scale: 1.1,
            speed: 0.9,
            primaryColor: '#a855f7',
            accentColor: '#ec4899',
            tag: 'Facebook & Socials',
            channelTarget: 'facebook'
        }));

        // 3. Bioluminescent Lanternfish (Fast, sleek)
        this.creatures.push(new LanternFish({
            id: 'lantern-email',
            x: w * 0.52,
            y: h * 0.65,
            scale: 1.0,
            speed: 1.6,
            primaryColor: '#22d3ee',
            accentColor: '#34d399',
            tag: 'Email & Inquiries',
            channelTarget: 'email'
        }));

        // 4. Second Deep Oceanic Swimmer
        this.creatures.push(new LanternFish({
            id: 'swimmer-deep',
            x: w * 0.15,
            y: h * 0.75,
            scale: 0.85,
            speed: 1.3,
            primaryColor: '#38bdf8',
            accentColor: '#818cf8',
            tag: 'Computer Engineering Specs',
            channelTarget: 'skills'
        }));
    }

    resize() {
        // Keep creatures strictly within screen boundaries on resize
        const w = window.innerWidth;
        const h = window.innerHeight;
        const margin = 80;
        this.creatures.forEach(c => {
            c.x = Math.max(margin, Math.min(w - margin, c.x));
            c.y = Math.max(margin + 50, Math.min(h - margin, c.y));
        });
    }

    checkHover(mouseX, mouseY) {
        let found = null;
        for (const c of this.creatures) {
            const dist = Math.hypot(mouseX - c.x, mouseY - c.y);
            if (dist < c.hitRadius) {
                found = c;
                break;
            }
        }
        this.hoveredCreature = found;
        return found;
    }

    checkClick(mouseX, mouseY) {
        for (const c of this.creatures) {
            const dist = Math.hypot(mouseX - c.x, mouseY - c.y);
            if (dist < c.hitRadius * 1.3) {
                if (this.onCreatureTap) {
                    this.onCreatureTap(c);
                }
                return c;
            }
        }
        return null;
    }

    update(dt, zoomFocusCreature = null) {
        this.creatures.forEach(c => {
            const isTarget = zoomFocusCreature && zoomFocusCreature.id === c.id;
            c.update(dt, isTarget);
        });
    }

    render(zoomRatio = 1.0) {
        const ctx = this.ctx;

        this.creatures.forEach(c => {
            const isHovered = this.hoveredCreature && this.hoveredCreature.id === c.id;
            c.render(ctx, isHovered, zoomRatio);
        });
    }
}

/**
 * --------------------------------------------------------------------
 * BASE CREATURE CLASS (Kinematics & Boid Wandering)
 * --------------------------------------------------------------------
 */
class BaseCreature {
    constructor(config) {
        this.id = config.id;
        this.x = config.x;
        this.y = config.y;
        this.scale = config.scale || 1.0;
        this.speed = config.speed || 1.0;
        this.primaryColor = config.primaryColor || '#00e5ff';
        this.accentColor = config.accentColor || '#3b82f6';
        this.tag = config.tag || 'Contact';
        this.channelTarget = config.channelTarget || null;

        this.angle = Math.random() * Math.PI * 2;
        this.targetAngle = this.angle;
        this.wanderTimer = 0;
        this.swimCycle = Math.random() * 10;
        this.glowIntensity = 1.0;
        this.hitRadius = 45 * this.scale;
    }

    updateWander(dt, isTarget) {
        if (isTarget) {
            // Calm down when camera zooms in for inspection
            this.glowIntensity = 1.4;
            return;
        }

        const w = window.innerWidth;
        const h = window.innerHeight;
        const margin = 80;

        // Turn away from screen borders
        let turn = false;
        if (this.x < margin) { this.targetAngle = 0; turn = true; }
        else if (this.x > w - margin) { this.targetAngle = Math.PI; turn = true; }
        if (this.y < margin + 60) { this.targetAngle = Math.PI * 0.5; turn = true; }
        else if (this.y > h - margin) { this.targetAngle = -Math.PI * 0.5; turn = true; }

        if (!turn) {
            this.wanderTimer -= dt;
            if (this.wanderTimer <= 0) {
                this.wanderTimer = 2.5 + Math.random() * 3.5;
                this.targetAngle += (Math.random() - 0.5) * 1.5;
            }
        }

        // Smooth angle interpolation
        let diff = this.targetAngle - this.angle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        this.angle += diff * dt * 1.8;

        // Velocity
        const currentSpeed = (35 * this.speed) * (1 + Math.sin(this.swimCycle) * 0.2);
        this.x += Math.cos(this.angle) * currentSpeed * dt;
        this.y += Math.sin(this.angle) * currentSpeed * dt;

        // Hard boundary clamp so creatures never drift off screen
        this.x = Math.max(margin * 0.4, Math.min(w - margin * 0.4, this.x));
        this.y = Math.max(margin * 0.8, Math.min(h - margin * 0.4, this.y));

        this.swimCycle += dt * 3.5 * this.speed;
    }

    renderHoverBadge(ctx, facingLeft = false) {
        ctx.save();
        if (facingLeft) ctx.scale(1, -1);

        // Reticle ring
        ctx.beginPath();
        ctx.arc(0, 0, this.hitRadius + 10, 0, Math.PI * 2);
        ctx.lineWidth = 1.2;
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = this.accentColor || '#38bdf8';
        ctx.stroke();

        // Holographic label
        ctx.font = '600 11px system-ui, sans-serif';
        const label = `✦ ${this.tag.toUpperCase()}`;
        const textWidth = ctx.measureText(label).width;

        ctx.fillStyle = 'rgba(7, 26, 45, 0.92)';
        if (ctx.roundRect) {
            ctx.roundRect(-textWidth / 2 - 10, -this.hitRadius - 28, textWidth + 20, 22, 5);
        } else {
            ctx.rect(-textWidth / 2 - 10, -this.hitRadius - 28, textWidth + 20, 22);
        }
        ctx.fill();
        ctx.strokeStyle = this.primaryColor || '#38bdf8';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(label, 0, -this.hitRadius - 13);

        ctx.restore();
    }
}

/**
 * --------------------------------------------------------------------
 * 1. BIOLUMINESCENT ANGLERFISH
 * --------------------------------------------------------------------
 */
class AnglerFish extends BaseCreature {
    constructor(config) {
        super(config);
        this.hitRadius = 55 * this.scale;
    }

    update(dt, isTarget) {
        this.updateWander(dt, isTarget);
    }

    render(ctx, isHovered, zoomRatio) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.scale(this.scale, this.scale);

        // Flip vertically if swimming to the left so creature doesn't swim upside down
        const facingLeft = Math.cos(this.angle) < 0;
        if (facingLeft) {
            ctx.scale(1, -1);
        }

        const flex = Math.sin(this.swimCycle) * 7;
        const finFlex = Math.cos(this.swimCycle * 1.2) * 0.25;

        // 1. Esca / Lure Glow (Volumetric Bioluminescent Lamp)
        const lureX = 42;
        const lureY = -28 + Math.sin(this.swimCycle * 0.8) * 3;

        // Stalk arching forward from forehead
        ctx.beginPath();
        ctx.moveTo(15, -12);
        ctx.quadraticCurveTo(28, -35, lureX, lureY);
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = '#1e3a5f';
        ctx.stroke();

        // Glowing bulb halo
        const lureBloom = ctx.createRadialGradient(lureX, lureY, 1, lureX, lureY, isHovered ? 45 : 32);
        lureBloom.addColorStop(0, 'rgba(80, 245, 255, 0.95)');
        lureBloom.addColorStop(0.3, 'rgba(14, 165, 233, 0.6)');
        lureBloom.addColorStop(0.7, 'rgba(3, 105, 161, 0.18)');
        lureBloom.addColorStop(1, 'rgba(2, 20, 40, 0)');
        ctx.fillStyle = lureBloom;
        ctx.beginPath();
        ctx.arc(lureX, lureY, isHovered ? 45 : 32, 0, Math.PI * 2);
        ctx.fill();

        // Bulb center
        ctx.beginPath();
        ctx.arc(lureX, lureY, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#f0fdf4';
        ctx.fill();

        // 2. Caudal / Tail Fin with sinusoidal wave
        ctx.save();
        ctx.translate(-38, 0);
        ctx.rotate((flex * Math.PI) / 180);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-24, -18);
        ctx.quadraticCurveTo(-16, 0, -28, 0);
        ctx.quadraticCurveTo(-16, 0, -24, 18);
        ctx.closePath();
        ctx.fillStyle = 'rgba(14, 165, 233, 0.75)';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#38bdf8';
        ctx.stroke();
        ctx.restore();

        // 3. Deep-Sea Body Shell
        ctx.beginPath();
        ctx.moveTo(32, 0); // Snout
        ctx.quadraticCurveTo(24, -22, -8, -18); // Head dome
        ctx.quadraticCurveTo(-26, -14, -38, flex * 0.4); // Back to tail
        ctx.quadraticCurveTo(-24, 14, -6, 18); // Belly
        ctx.quadraticCurveTo(22, 18, 32, 4); // Jaw
        ctx.closePath();

        const bodyGrad = ctx.createLinearGradient(30, 0, -35, 0);
        bodyGrad.addColorStop(0, '#0c2238');
        bodyGrad.addColorStop(0.5, '#071626');
        bodyGrad.addColorStop(1, '#020b14');
        ctx.fillStyle = bodyGrad;
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = isHovered ? '#38bdf8' : '#0369a1';
        ctx.stroke();

        // 4. Bioluminescent Ventral Photophores (Glowing Dots along lateral line)
        for (let i = 0; i < 6; i++) {
            const px = 18 - i * 9;
            const py = 6 + Math.sin(i * 0.8 + this.swimCycle) * 2;
            ctx.beginPath();
            ctx.arc(px, py, 1.8, 0, Math.PI * 2);
            ctx.fillStyle = isHovered ? '#a5f3fc' : '#38bdf8';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // 5. Pectoral Fin
        ctx.save();
        ctx.translate(-2, 4);
        ctx.rotate(finFlex);
        ctx.beginPath();
        ctx.ellipse(0, 0, 14, 6, -0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(14, 165, 233, 0.45)';
        ctx.fill();
        ctx.restore();

        // 6. Glowing Eye
        ctx.beginPath();
        ctx.arc(16, -7, 4.2, 0, Math.PI * 2);
        ctx.fillStyle = '#0284c7';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(17, -7, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = '#e0f2fe';
        ctx.fill();

        // 7. Hover Reticle & Holographic Badge
        if (isHovered) {
            this.renderHoverBadge(ctx, facingLeft);
        }

        ctx.restore();
    }
}

/**
 * --------------------------------------------------------------------
 * 2. ABYSSAL JELLYFISH
 * --------------------------------------------------------------------
 */
class AbyssalJellyfish extends BaseCreature {
    constructor(config) {
        super(config);
        this.hitRadius = 48 * this.scale;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.tentacleSegments = 7;
    }

    update(dt, isTarget) {
        this.updateWander(dt, isTarget);
        this.pulsePhase += dt * 2.2;
    }

    render(ctx, isHovered, zoomRatio) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle + Math.PI * 0.5); // Bell points forward along trajectory
        ctx.scale(this.scale, this.scale);

        const pulse = 1.0 + Math.sin(this.pulsePhase) * 0.18;
        const squeeze = 1.0 - Math.sin(this.pulsePhase) * 0.12;

        // 1. Bioluminescent Core Halo (Translucent Internal Glow)
        const halo = ctx.createRadialGradient(0, 0, 2, 0, 0, 38 * pulse);
        halo.addColorStop(0, 'rgba(216, 70, 239, 0.9)');
        halo.addColorStop(0.4, 'rgba(168, 85, 247, 0.45)');
        halo.addColorStop(0.8, 'rgba(99, 102, 241, 0.15)');
        halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(0, 0, 38 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // 2. Translucent Bell Dome
        ctx.beginPath();
        ctx.moveTo(-28 * squeeze, 10);
        ctx.bezierCurveTo(-34 * squeeze, -28 * pulse, 34 * squeeze, -28 * pulse, 28 * squeeze, 10);
        ctx.bezierCurveTo(18 * squeeze, 6, 0, 12, -28 * squeeze, 10);
        ctx.closePath();

        const bellGrad = ctx.createLinearGradient(0, -28 * pulse, 0, 10);
        bellGrad.addColorStop(0, 'rgba(192, 132, 252, 0.65)');
        bellGrad.addColorStop(0.6, 'rgba(147, 51, 234, 0.4)');
        bellGrad.addColorStop(1, 'rgba(126, 34, 206, 0.2)');
        ctx.fillStyle = bellGrad;
        ctx.fill();
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = isHovered ? '#f0abfc' : 'rgba(232, 121, 249, 0.8)';
        ctx.stroke();

        // 3. Trailing Bioluminescent Tentacles
        const tentacleCount = 5;
        for (let t = 0; t < tentacleCount; t++) {
            const tx = -20 + t * 10;
            ctx.beginPath();
            ctx.moveTo(tx, 10);

            for (let s = 1; s <= 5; s++) {
                const segY = 10 + s * 14;
                const waveOffset = Math.sin(this.pulsePhase + s * 0.8 + t) * 6;
                ctx.lineTo(tx + waveOffset, segY);
            }

            ctx.lineWidth = 1.2;
            ctx.strokeStyle = `rgba(244, 114, 182, ${0.7 - t * 0.08})`;
            ctx.stroke();
        }

        // Hover Reticle & Holographic Tag
        if (isHovered) {
            this.renderHoverBadge(ctx, false);
        }

        ctx.restore();
    }
}

/**
 * --------------------------------------------------------------------
 * 3. BIOLUMINESCENT LANTERNFISH
 * --------------------------------------------------------------------
 */
class LanternFish extends BaseCreature {
    constructor(config) {
        super(config);
        this.hitRadius = 42 * this.scale;
    }

    update(dt, isTarget) {
        this.updateWander(dt, isTarget);
    }

    render(ctx, isHovered, zoomRatio) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.scale(this.scale, this.scale);

        const facingLeft = Math.cos(this.angle) < 0;
        if (facingLeft) {
            ctx.scale(1, -1);
        }

        const flex = Math.sin(this.swimCycle * 1.3) * 6;

        // Tail fin
        ctx.beginPath();
        ctx.moveTo(-32, 0);
        ctx.lineTo(-46, -14 + flex);
        ctx.lineTo(-40, 0);
        ctx.lineTo(-46, 14 + flex);
        ctx.closePath();
        ctx.fillStyle = 'rgba(34, 211, 238, 0.7)';
        ctx.fill();

        // Sleek Torpedo Body
        ctx.beginPath();
        ctx.moveTo(28, 0);
        ctx.quadraticCurveTo(12, -14, -15, -10);
        ctx.quadraticCurveTo(-26, -5, -32, flex * 0.3);
        ctx.quadraticCurveTo(-22, 6, -12, 10);
        ctx.quadraticCurveTo(12, 12, 28, 0);
        ctx.closePath();

        const grad = ctx.createLinearGradient(25, 0, -30, 0);
        grad.addColorStop(0, '#0284c7');
        grad.addColorStop(0.5, '#075985');
        grad.addColorStop(1, '#082f49');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = isHovered ? '#67e8f9' : '#0284c7';
        ctx.stroke();

        // Ventral Glowing Photophore Row
        for (let i = 0; i < 7; i++) {
            const px = 14 - i * 6;
            const py = 5 + Math.sin(i * 0.6 + this.swimCycle) * 1.5;
            ctx.beginPath();
            ctx.arc(px, py, 1.4, 0, Math.PI * 2);
            ctx.fillStyle = isHovered ? '#a7f3d0' : '#22d3ee';
            ctx.shadowColor = '#22d3ee';
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // Eye
        ctx.beginPath();
        ctx.arc(18, -3, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#06b6d4';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(19, -3, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        if (isHovered) {
            this.renderHoverBadge(ctx, facingLeft);
        }

        ctx.restore();
    }
}

window.SeaCreatureSystem = SeaCreatureSystem;
