/**
 * ====================================================================
 * REALISTIC 2D WATER WAVE & FLUID RIPPLE SIMULATION
 * ====================================================================
 * Discrete 2D wave equation with damping, surface normal generation,
 * refractive light bending, and sunlight specular highlights.
 */

class WaterRippleSimulation {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { willReadFrequently: true });

        this.customSimScale = options.simScale || null;
        this.damping = options.damping || 0.982; // Wave persistence
        this.waveSpeed = options.waveSpeed || 1.0;

        this.buffer1 = null;
        this.buffer2 = null;
        this.currentBuffer = null;
        this.previousBuffer = null;
        this.imgData = null;
        this.data32 = null;

        this.resize();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Adaptive scale: keeps simulation resolution balanced across 1080p, 4K, and mobile
        if (this.customSimScale) {
            this.simScale = this.customSimScale;
        } else {
            this.simScale = Math.max(3, Math.min(6, Math.round(window.innerWidth / 380)));
        }

        this.width = Math.ceil(window.innerWidth / this.simScale);
        this.height = Math.ceil(window.innerHeight / this.simScale);
        this.size = this.width * this.height;

        this.buffer1 = new Float32Array(this.size);
        this.buffer2 = new Float32Array(this.size);
        this.currentBuffer = this.buffer1;
        this.previousBuffer = this.buffer2;

        this.imgData = this.ctx.createImageData(this.width, this.height);
        this.data32 = new Uint32Array(this.imgData.data.buffer);
    }

    /**
     * Disturb the water surface at a specific coordinate
     * @param {number} x - Screen X
     * @param {number} y - Screen Y
     * @param {number} radius - Disturbance radius (in grid cells)
     * @param {number} strength - Disturbance height/depth
     */
    disturb(x, y, radius = 6, strength = 180) {
        if (!this.currentBuffer) return;

        const simX = Math.floor(x / this.simScale);
        const simY = Math.floor(y / this.simScale);

        const r = Math.max(1, Math.floor(radius));
        const rSq = r * r;

        const minX = Math.max(1, simX - r);
        const maxX = Math.min(this.width - 2, simX + r);
        const minY = Math.max(1, simY - r);
        const maxY = Math.min(this.height - 2, simY + r);

        for (let py = minY; py <= maxY; py++) {
            const dy = py - simY;
            const rowOffset = py * this.width;
            for (let px = minX; px <= maxX; px++) {
                const dx = px - simX;
                const distSq = dx * dx + dy * dy;
                if (distSq <= rSq) {
                    const factor = Math.cos((Math.sqrt(distSq) / r) * (Math.PI / 2));
                    const currentVal = this.currentBuffer[rowOffset + px];
                    const nextVal = currentVal + strength * factor;
                    // Clamp to prevent runaway numerical explosion
                    this.currentBuffer[rowOffset + px] = Math.max(-320, Math.min(320, nextVal));
                }
            }
        }
    }

    /**
     * Interpolate disturbance along mouse drag vector for seamless continuous wake
     */
    disturbLine(x1, y1, x2, y2, radius, strength) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.hypot(dx, dy);
        if (dist < 1) {
            this.disturb(x2, y2, radius, strength);
            return;
        }

        // Space steps proportionally to avoid thousands of overlapping cell writes
        const stepSpacing = Math.max(6, (radius * 0.75) * this.simScale);
        const steps = Math.max(1, Math.min(30, Math.floor(dist / stepSpacing)));

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = x1 + dx * t;
            const y = y1 + dy * t;
            this.disturb(x, y, radius, strength);
        }
    }

    /**
     * Step the 2D wave equation physics
     */
    updatePhysics() {
        const w = this.width;
        const h = this.height;
        const curr = this.currentBuffer;
        const prev = this.previousBuffer;
        const damp = this.damping;

        // Wave propagation kernel
        for (let y = 1; y < h - 1; y++) {
            const row = y * w;
            const rowAbove = (y - 1) * w;
            const rowBelow = (y + 1) * w;

            for (let x = 1; x < w - 1; x++) {
                const idx = row + x;

                // Discrete Laplacian approximation
                const wave = (
                    curr[idx - 1] +
                    curr[idx + 1] +
                    curr[rowAbove + x] +
                    curr[rowBelow + x]
                ) * 0.5 - prev[idx];

                prev[idx] = wave * damp;
            }
        }

        // Swap buffers
        this.currentBuffer = prev;
        this.previousBuffer = curr;
    }

    /**
     * Render the water ripple surface with refractive caustics and sunlight reflection
     */
    render() {
        this.updatePhysics();

        const w = this.width;
        const h = this.height;
        const buffer = this.currentBuffer;
        const data32 = this.data32;

        for (let y = 1; y < h - 1; y++) {
            const row = y * w;
            const rowAbove = (y - 1) * w;
            const rowBelow = (y + 1) * w;

            for (let x = 1; x < w - 1; x++) {
                const idx = row + x;

                // Calculate surface normal gradients (dx, dy)
                const nx = (buffer[idx + 1] - buffer[idx - 1]) * 0.04;
                const ny = (buffer[rowBelow + x] - buffer[rowAbove + x]) * 0.04;
                const slope = Math.hypot(nx, ny);

                // Wave height & crest/trough
                const waveHeight = buffer[idx];

                if (slope > 0.03 || Math.abs(waveHeight) > 1.2) {
                    // Sunlight angle from ocean surface top (angling downward at ~30 deg)
                    // Upward-facing wave facets reflect the sunlight towards the viewer
                    const sunReflection = Math.min(2.5, Math.max(0, -ny * 0.95 + nx * 0.25));
                    const specular = Math.pow(sunReflection, 3.2) * 235;

                    // Caustic refraction & crest shimmer
                    const crest = Math.max(0, waveHeight);
                    const trough = Math.max(0, -waveHeight);

                    if (crest > trough) {
                        // Wave Crest: bright bioluminescent cyan & sunlight glint
                        const shimmer = Math.min(255, slope * 55 + crest * 1.1);
                        const r = Math.min(255, Math.floor(specular * 0.85 + shimmer * 0.25 + 30));
                        const g = Math.min(255, Math.floor(specular * 0.95 + shimmer * 0.75 + 120));
                        const b = Math.min(255, Math.floor(specular * 1.0 + shimmer * 0.95 + 190));
                        const alpha = Math.min(230, Math.floor(specular * 0.85 + shimmer * 0.85 + 25));

                        data32[idx] = (((alpha & 0xff) << 24) >>> 0) | ((b & 0xff) << 16) | ((g & 0xff) << 8) | (r & 0xff);
                    } else {
                        // Wave Trough: deep oceanic refraction shadow
                        const deepShade = Math.min(180, slope * 40 + trough * 0.8);
                        const r = 2;
                        const g = Math.min(255, Math.floor(deepShade * 0.35 + 8));
                        const b = Math.min(255, Math.floor(deepShade * 0.75 + 24));
                        const alpha = Math.min(160, Math.floor(deepShade * 0.75 + 15));

                        data32[idx] = (((alpha & 0xff) << 24) >>> 0) | ((b & 0xff) << 16) | ((g & 0xff) << 8) | (r & 0xff);
                    }
                } else {
                    data32[idx] = 0; // Completely transparent ocean water
                }
            }
        }

        // Draw the simulation buffer scaled smoothly to full viewport
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Use offscreen image rendering with high quality bicubic/bilinear smoothing
        this.ctx.save();
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';

        // Draw temporary scaled canvas
        if (!this.tempCanvas) {
            this.tempCanvas = document.createElement('canvas');
        }
        if (this.tempCanvas.width !== w || this.tempCanvas.height !== h) {
            this.tempCanvas.width = w;
            this.tempCanvas.height = h;
            this.tempCtx = this.tempCanvas.getContext('2d');
        }

        this.tempCtx.putImageData(this.imgData, 0, 0);
        this.ctx.drawImage(this.tempCanvas, 0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }
}

window.WaterRippleSimulation = WaterRippleSimulation;
