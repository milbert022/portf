/**
 * ====================================================================
 * ATLANTIC DEEP-SEA ENVIRONMENT & VOLUMETRIC LIGHTING
 * ====================================================================
 * - Deep dark blue Atlantic base gradient with abyssal light absorption
 * - Procedural volumetric sunlight shafts (godrays) angling from top
 * - Dynamic surface caustics shimmer
 * - Submersible exploration spotlight tracking the cursor
 * - Cinematic camera zoom interpolation
 */

class AtlanticOceanRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.time = 0;
        this.mousePos = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };
        this.smoothedMouse = { x: this.mousePos.x, y: this.mousePos.y };

        // Camera transform for smooth cinematic zooming
        const centerX = window.innerWidth * 0.5;
        const centerY = window.innerHeight * 0.5;
        this.camera = {
            worldX: centerX,
            worldY: centerY,
            targetWorldX: centerX,
            targetWorldY: centerY,
            screenX: centerX,
            screenY: centerY,
            targetScreenX: centerX,
            targetScreenY: centerY,
            zoom: 1.0,
            targetZoom: 1.0,
            isZoomed: false
        };

        // Procedural light ray parameters
        this.lightRays = [
            { baseAngle: 0.28, width: 90, speed: 0.18, phase: 0.0, alpha: 0.22 },
            { baseAngle: 0.32, width: 140, speed: 0.14, phase: 1.8, alpha: 0.32 },
            { baseAngle: 0.24, width: 110, speed: 0.22, phase: 3.5, alpha: 0.26 },
            { baseAngle: 0.38, width: 180, speed: 0.12, phase: 5.1, alpha: 0.38 },
            { baseAngle: 0.22, width: 80, speed: 0.25, phase: 2.2, alpha: 0.20 }
        ];

        this.resize();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (!this.camera.isZoomed) {
            const cx = window.innerWidth * 0.5;
            const cy = window.innerHeight * 0.5;
            this.camera.worldX = cx;
            this.camera.worldY = cy;
            this.camera.targetWorldX = cx;
            this.camera.targetWorldY = cy;
            this.camera.screenX = cx;
            this.camera.screenY = cy;
            this.camera.targetScreenX = cx;
            this.camera.targetScreenY = cy;
        }
    }

    setMousePosition(x, y) {
        this.mousePos.x = x;
        this.mousePos.y = y;
    }

    /**
     * Trigger smooth camera zoom into a coordinate (e.g. creature)
     */
    zoomTo(x, y, zoomLevel = 2.2) {
        const isWide = window.innerWidth > 1024;
        const focusCenterX = isWide ? (window.innerWidth * 0.28) : (window.innerWidth * 0.5);
        const focusCenterY = isWide ? (window.innerHeight * 0.5) : (window.innerHeight * 0.32);

        this.camera.targetWorldX = x;
        this.camera.targetWorldY = y;
        this.camera.targetScreenX = focusCenterX;
        this.camera.targetScreenY = focusCenterY;
        this.camera.targetZoom = zoomLevel;
        this.camera.isZoomed = true;
    }

    /**
     * Reset camera back to default ocean view
     */
    resetZoom() {
        const cx = window.innerWidth * 0.5;
        const cy = window.innerHeight * 0.5;
        this.camera.targetWorldX = cx;
        this.camera.targetWorldY = cy;
        this.camera.targetScreenX = cx;
        this.camera.targetScreenY = cy;
        this.camera.targetZoom = 1.0;
        this.camera.isZoomed = false;
    }

    update(dt) {
        this.time += dt;

        // Smooth cursor tracking
        this.smoothedMouse.x += (this.mousePos.x - this.smoothedMouse.x) * dt * 4.0;
        this.smoothedMouse.y += (this.mousePos.y - this.smoothedMouse.y) * dt * 4.0;

        // Camera lerp
        const lerpSpeed = dt * 3.8;
        this.camera.worldX += (this.camera.targetWorldX - this.camera.worldX) * lerpSpeed;
        this.camera.worldY += (this.camera.targetWorldY - this.camera.worldY) * lerpSpeed;
        this.camera.screenX += (this.camera.targetScreenX - this.camera.screenX) * lerpSpeed;
        this.camera.screenY += (this.camera.targetScreenY - this.camera.screenY) * lerpSpeed;
        this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * lerpSpeed;
    }

    /**
     * Render the deep sea Atlantic gradient, caustics, and volumetric sunlight
     */
    render() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // 1. Base Atlantic Deep-Sea Gradient (Dark Navy to Abyssal Trench)
        const baseGrad = ctx.createLinearGradient(0, 0, 0, h);
        baseGrad.addColorStop(0, '#03172e'); // Top illuminated water column
        baseGrad.addColorStop(0.2, '#021226');
        baseGrad.addColorStop(0.5, '#010c1c'); // Mid pelagic dark ocean
        baseGrad.addColorStop(0.8, '#010712');
        baseGrad.addColorStop(1, '#000308'); // Abyssal benthic darkness
        ctx.fillStyle = baseGrad;
        ctx.fillRect(0, 0, w, h);

        // 2. Sunlight Reflections & Volumetric Godrays Penetrating from the Top
        this.renderSunlightShafts(ctx, w, h);

        // 3. Dynamic Caustics Shimmer Layer
        this.renderCausticWaves(ctx, w, h);

        // 4. Submersible Exploration Flashlight / Ambient Cursor Cone
        this.renderSubmersibleLight(ctx);
    }

    renderSunlightShafts(ctx, w, h) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        const originX = w * 0.35;
        const originY = -50;

        this.lightRays.forEach(ray => {
            const sway = Math.sin(this.time * ray.speed + ray.phase) * 0.04;
            const angle = ray.baseAngle + sway;
            const length = h * 1.35;

            const endX = originX + Math.sin(angle) * length;
            const endY = originY + Math.cos(angle) * length;

            const rayGrad = ctx.createLinearGradient(originX, originY, endX, endY);
            rayGrad.addColorStop(0, `rgba(180, 240, 255, ${ray.alpha * 0.95})`);
            rayGrad.addColorStop(0.15, `rgba(56, 189, 248, ${ray.alpha * 0.7})`);
            rayGrad.addColorStop(0.45, `rgba(14, 165, 233, ${ray.alpha * 0.35})`);
            rayGrad.addColorStop(0.8, `rgba(2, 132, 199, ${ray.alpha * 0.08})`);
            rayGrad.addColorStop(1, 'rgba(0, 30, 60, 0)');

            ctx.fillStyle = rayGrad;
            ctx.beginPath();
            ctx.moveTo(originX - 15, originY);
            ctx.lineTo(originX + 15, originY);
            ctx.lineTo(endX + ray.width * 0.8, endY);
            ctx.lineTo(endX - ray.width * 0.8, endY);
            ctx.closePath();
            ctx.fill();
        });

        // Surface water glint along very top edge
        const topGlint = ctx.createLinearGradient(0, 0, 0, 90);
        topGlint.addColorStop(0, 'rgba(140, 220, 255, 0.45)');
        topGlint.addColorStop(0.4, 'rgba(56, 189, 248, 0.18)');
        topGlint.addColorStop(1, 'rgba(3, 105, 161, 0)');
        ctx.fillStyle = topGlint;
        ctx.fillRect(0, 0, w, 90);

        ctx.restore();
    }

    renderCausticWaves(ctx, w, h) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        const t = this.time * 0.6;
        const causticCount = 12;

        ctx.strokeStyle = 'rgba(70, 210, 255, 0.045)';
        ctx.lineWidth = 1.6;

        for (let i = 0; i < causticCount; i++) {
            const baseY = 30 + i * 28;
            ctx.beginPath();
            ctx.moveTo(0, baseY);

            for (let x = 0; x <= w; x += 40) {
                const cy = baseY + Math.sin(x * 0.015 + t + i * 0.8) * 12 + Math.cos(x * 0.028 - t * 0.7) * 8;
                ctx.lineTo(x, cy);
            }
            ctx.stroke();
        }

        ctx.restore();
    }

    renderSubmersibleLight(ctx) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        const mx = this.smoothedMouse.x;
        const my = this.smoothedMouse.y;
        const radius = 280;

        // Submersible lantern glow around cursor
        const lanternGrad = ctx.createRadialGradient(mx, my, 4, mx, my, radius);
        lanternGrad.addColorStop(0, 'rgba(140, 225, 255, 0.22)');
        lanternGrad.addColorStop(0.35, 'rgba(56, 189, 248, 0.10)');
        lanternGrad.addColorStop(0.7, 'rgba(2, 132, 199, 0.03)');
        lanternGrad.addColorStop(1, 'rgba(0, 20, 40, 0)');

        ctx.fillStyle = lanternGrad;
        ctx.beginPath();
        ctx.arc(mx, my, radius, 0, Math.PI * 2);
        ctx.fill();

        // Spotlight on focused creature if zoomed
        if (this.camera.zoom > 1.05) {
            const zAlpha = Math.min(0.35, (this.camera.zoom - 1.0) * 0.28);
            const cx = this.camera.screenX;
            const cy = this.camera.screenY;
            const creatureLight = ctx.createRadialGradient(cx, cy, 10, cx, cy, 260);
            creatureLight.addColorStop(0, `rgba(56, 189, 248, ${zAlpha})`);
            creatureLight.addColorStop(0.5, `rgba(14, 165, 233, ${zAlpha * 0.4})`);
            creatureLight.addColorStop(1, 'rgba(0, 20, 40, 0)');
            ctx.fillStyle = creatureLight;
            ctx.beginPath();
            ctx.arc(cx, cy, 260, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

window.AtlanticOceanRenderer = AtlanticOceanRenderer;
