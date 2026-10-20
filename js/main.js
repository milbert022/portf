/**
 * ====================================================================
 * DEEP SEA ATLANTIC PORTFOLIO - MAIN CONTROLLER
 * Milbert A. Lomibao | Computer Engineering
 * ====================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load User Configuration
    const config = window.PORTFOLIO_CONFIG || {};

    // 2. DOM Elements
    const oceanCanvas = document.getElementById('ocean-canvas');
    const eyesCanvas = document.getElementById('eyes-canvas');
    const creaturesCanvas = document.getElementById('creatures-canvas');
    const particlesCanvas = document.getElementById('particles-canvas');
    const rippleCanvas = document.getElementById('ripple-canvas');

    const heroSection = document.getElementById('hero-section');
    const heroName = document.getElementById('hero-name');
    const heroTitle = document.getElementById('hero-title');
    const heroTagline = document.getElementById('hero-tagline');

    const audioToggle = document.getElementById('audio-toggle');
    const audioLabel = document.getElementById('audio-label');

    const contactModal = document.getElementById('contact-modal');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const returnBtn = document.getElementById('return-btn');

    const modalName = document.getElementById('modal-name');
    const modalDiscipline = document.getElementById('modal-discipline');
    const modalBio = document.getElementById('modal-bio');
    const modalSkills = document.getElementById('modal-skills');

    const btnFacebook = document.getElementById('btn-facebook');
    const btnGithub = document.getElementById('btn-github');
    const btnLinkedin = document.getElementById('btn-linkedin');
    const fbSubtitle = document.getElementById('fb-subtitle');
    const ghSubtitle = document.getElementById('gh-subtitle');
    const liSubtitle = document.getElementById('li-subtitle');
    const terminalBeaconText = document.getElementById('terminal-beacon-text');
    const eyesIndicatorVal = document.querySelector('#eyes-status .sensor-val');

    const valEmail = document.getElementById('val-email');
    const valPhone = document.getElementById('val-phone');
    const valLocation = document.getElementById('val-location');
    const copyToast = document.getElementById('copy-toast');

    // Telemetry values
    const depthMeter = document.getElementById('depth-meter');
    const valPressure = document.getElementById('val-pressure');
    const valTemp = document.getElementById('val-temp');

    // 3. Populate Config Details
    if (config.name) {
        modalName.textContent = config.name;
        if (heroName) {
            const parts = config.name.trim().split(' ');
            if (parts.length > 1) {
                const last = parts.pop();
                const first = parts.join(' ');
                heroName.innerHTML = `<span class="name-first">${first}</span> <span class="name-last">${last}</span>`;
            } else {
                heroName.innerHTML = `<span class="name-first">${config.name}</span>`;
            }
        }
    }
    if (config.academicField) {
        heroTitle.textContent = config.academicField;
        modalDiscipline.textContent = config.academicField;
    }
    if (config.specialization) {
        heroTagline.textContent = config.specialization;
    }
    if (config.bio) {
        modalBio.textContent = config.bio;
    }

    // Populate Contacts from Config
    if (config.contacts) {
        // Facebook
        if (config.contacts.facebook && btnFacebook) {
            btnFacebook.href = config.contacts.facebook.url || '#';
            if (config.contacts.facebook.description && fbSubtitle) {
                fbSubtitle.textContent = config.contacts.facebook.description;
            }
        }
        // GitHub
        if (config.contacts.github && btnGithub) {
            btnGithub.href = config.contacts.github.url || '#';
            if (config.contacts.github.description && ghSubtitle) {
                ghSubtitle.textContent = config.contacts.github.description;
            }
        }
        // LinkedIn
        if (config.contacts.linkedin && btnLinkedin) {
            btnLinkedin.href = config.contacts.linkedin.url || '#';
            if (config.contacts.linkedin.description && liSubtitle) {
                liSubtitle.textContent = config.contacts.linkedin.description;
            }
        }
        // Email
        if (config.contacts.email && valEmail) {
            valEmail.textContent = config.contacts.email.value;
            valEmail.href = config.contacts.email.url || `mailto:${config.contacts.email.value}`;
        }
        // Phone
        if (config.contacts.phone && valPhone) {
            valPhone.textContent = config.contacts.phone.value;
            valPhone.href = config.contacts.phone.url || `tel:${config.contacts.phone.value}`;
        }
        // Location
        if (config.contacts.location && valLocation) {
            valLocation.textContent = config.contacts.location.value;
        }
    }

    // Populate Academic Knowledge Skills Cloud
    if (config.academicSkills && modalSkills) {
        modalSkills.innerHTML = '';
        config.academicSkills.forEach(skill => {
            const tag = document.createElement('span');
            tag.className = 'skill-tag';
            tag.textContent = skill.name;
            modalSkills.appendChild(tag);
        });
    }

    // Ocean Settings Telemetry
    if (config.oceanSettings) {
        if (depthMeter && config.oceanSettings.depthMeters) {
            depthMeter.textContent = Number(config.oceanSettings.depthMeters).toLocaleString();
        }
        if (valPressure && config.oceanSettings.ambientPressure) {
            valPressure.textContent = config.oceanSettings.ambientPressure;
        }
        if (valTemp && config.oceanSettings.waterTemperature) {
            valTemp.textContent = config.oceanSettings.waterTemperature;
        }
    }

    // 4. Initialize Core Systems
    const audioEngine = new window.DeepSeaAudioEngine();
    const oceanRenderer = new window.AtlanticOceanRenderer(oceanCanvas);
    const eyesSystem = new window.LurkingEyesSystem(eyesCanvas);
    const particleSystem = new window.ParticleSystem(particlesCanvas);
    const rippleSim = new window.WaterRippleSimulation(rippleCanvas);

    let activeZoomCreature = null;

    // Sea Creatures with Tap Callback
    const creatureSystem = new window.SeaCreatureSystem(creaturesCanvas, {
        onCreatureTap: (creature) => {
            openCreatureContact(creature);
        }
    });

    // 5. Open Creature Contact & Cinematic Zoom
    function openCreatureContact(creature) {
        activeZoomCreature = creature;

        // Cinematic camera zoom focused onto the tapped creature
        oceanRenderer.zoomTo(creature.x, creature.y, 2.3);

        // Sound effects
        audioEngine.playCreatureTapSound();

        // Plankton spark explosion around the creature
        particleSystem.spawnSparks(creature.x, creature.y, 24, creature.primaryColor || '#00f0ff');

        // Dynamic terminal beacon indicator
        if (terminalBeaconText && creature.tag) {
            terminalBeaconText.textContent = `CREATURE BEACON: ${creature.tag.toUpperCase()}`;
        }

        // Dim background hero and open glassmorphic contact terminal
        heroSection.classList.add('dimmed');
        contactModal.classList.add('active');
        contactModal.setAttribute('aria-hidden', 'false');

        // Clear any previous target highlights
        document.querySelectorAll('.target-highlight').forEach(el => el.classList.remove('target-highlight'));

        // Highlight matching direct channel or knowledge section
        let targetEl = null;
        const target = creature.channelTarget || creature.id;
        if (target === 'github' || creature.id.includes('github')) {
            targetEl = btnGithub;
        } else if (target === 'facebook' || creature.id.includes('facebook')) {
            targetEl = btnFacebook;
        } else if (target === 'linkedin') {
            targetEl = btnLinkedin;
        } else if (target === 'email' || creature.id.includes('email')) {
            targetEl = document.getElementById('item-email');
        } else if (target === 'skills' || creature.id.includes('deep')) {
            targetEl = modalSkills;
        }

        if (targetEl) {
            targetEl.classList.add('target-highlight');
            setTimeout(() => {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 180);
        }
    }

    // Helper: Hex color to RGB
    function hexToRgb(hex) {
        if (!hex) return '0, 240, 255';
        let h = hex.replace('#', '');
        if (h.length === 3) h = h.split('').map(c => c + c).join('');
        const bigint = parseInt(h, 16) || 0;
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `${r}, ${g}, ${b}`;
    }

    // Close Contact Modal & Reset Zoom
    function closeContactModal() {
        contactModal.classList.remove('active');
        contactModal.setAttribute('aria-hidden', 'true');
        heroSection.classList.remove('dimmed');

        // Remove highlights
        document.querySelectorAll('.target-highlight').forEach(el => el.classList.remove('target-highlight'));

        oceanRenderer.resetZoom();
        audioEngine.playZoomOutSound();
        activeZoomCreature = null;
    }

    closeModalBtn.addEventListener('click', closeContactModal);
    modalBackdrop.addEventListener('click', closeContactModal);
    returnBtn.addEventListener('click', closeContactModal);

    // Escape key closes modals
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (contactModal.classList.contains('active')) {
                closeContactModal();
            }
        }
    });

    // 6. Audio Toggle Button
    audioToggle.addEventListener('click', () => {
        const isMuted = audioEngine.toggleMute();
        if (isMuted) {
            audioToggle.classList.remove('audio-active');
            audioLabel.textContent = 'SOUND: MUTED';
        } else {
            audioToggle.classList.add('audio-active');
            audioLabel.textContent = 'SOUND: ACTIVE';
        }
    });

    // 7. Copy to Clipboard Functionality with Fallback for file:// context
    let toastTimeout = null;

    function showToast(msg) {
        copyToast.querySelector('span').textContent = msg;
        copyToast.classList.add('show');
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            copyToast.classList.remove('show');
            toastTimeout = null;
        }, 2400);
    }

    function fallbackCopy(text) {
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            showToast(`Copied ${text} to clipboard!`);
        } catch (err) {
            showToast('Failed to copy');
        }
    }

    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetId = btn.getAttribute('data-copy');
            if (targetId) {
                const targetEl = document.getElementById(targetId);
                if (!targetEl) return;

                const textToCopy = targetEl.textContent.trim();
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        showToast(`Copied ${textToCopy} to clipboard!`);
                    }).catch(() => {
                        fallbackCopy(textToCopy);
                    });
                } else {
                    fallbackCopy(textToCopy);
                }
            }
        });
    });

    // 8. Mouse & Touch Water Dragging Interactions
    let isDragging = false;
    let lastX = null;
    let lastY = null;

    function handlePointerDown(e) {
        // Only trigger if contact modal is closed
        if (contactModal.classList.contains('active')) return;

        const x = e.clientX;
        const y = e.clientY;

        // Check if user tapped directly on a creature
        const clickedCreature = creatureSystem.checkClick(x, y);
        if (clickedCreature) {
            return; // Creature tap handled
        }

        // Resume suspended AudioContext on first interaction
        if (audioEngine.ctx && audioEngine.ctx.state === 'suspended') {
            audioEngine.ctx.resume();
        }

        // Auto-enable audio on initial interaction if configured
        if (config.oceanSettings && config.oceanSettings.enableAudioByDefault && audioEngine.isMuted) {
            audioEngine.toggleMute();
            audioToggle.classList.add('audio-active');
            audioLabel.textContent = 'SOUND: ACTIVE';
        }

        isDragging = true;
        lastX = x;
        lastY = y;
        rippleCanvas.classList.add('cursor-dragging');

        // Immediate wave burst on initial touch/click
        rippleSim.disturb(x, y, 9, 220);
        audioEngine.playWaterWaveSound(1.5);
    }

    function handlePointerMove(e) {
        const x = e.clientX;
        const y = e.clientY;

        // Update systems with mouse coordinate
        oceanRenderer.setMousePosition(x, y);
        eyesSystem.setMousePosition(x, y);

        // Check creature hover targeting
        if (!contactModal.classList.contains('active')) {
            const hovered = creatureSystem.checkHover(x, y);
            if (hovered) {
                rippleCanvas.classList.add('cursor-hover');
            } else {
                rippleCanvas.classList.remove('cursor-hover');
            }
        }

        // Dragging wave physics
        if (isDragging && lastX !== null && lastY !== null) {
            const dx = x - lastX;
            const dy = y - lastY;
            const speed = Math.hypot(dx, dy);

            if (speed > 2) {
                // Disturb water wave simulation along drag vector
                const waveRadius = Math.min(16, 7 + speed * 0.25);
                const waveStrength = Math.min(280, 140 + speed * 6);
                rippleSim.disturbLine(lastX, lastY, x, y, waveRadius, waveStrength);

                // Spawn drag cavitation bubbles
                particleSystem.spawnDragBubbles(x, y, dx, dy, Math.min(4, Math.floor(speed * 0.25)));

                // Procedural hydrodynamic sound
                audioEngine.playWaterWaveSound(speed);
            }

            lastX = x;
            lastY = y;
        }
    }

    function handlePointerUp() {
        isDragging = false;
        lastX = null;
        lastY = null;
        rippleCanvas.classList.remove('cursor-dragging');
    }

    // Attach pointer listeners to window and rippleCanvas
    rippleCanvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    // Subtle passive oceanic wave disturbance (gentle ocean swell)
    let ambientWaveTimer = 0;

    // 9. Resize Handling
    function handleResize() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        [oceanCanvas, eyesCanvas, creaturesCanvas, particlesCanvas, rippleCanvas].forEach(c => {
            c.width = w;
            c.height = h;
        });

        oceanRenderer.resize();
        eyesSystem.resize();
        particleSystem.resize();
        creatureSystem.resize();
        rippleSim.resize();
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    // 10. Main Animation Loop (60 FPS)
    let lastTime = performance.now();

    function animate(currentTime) {
        requestAnimationFrame(animate);

        const dt = Math.min(0.1, (currentTime - lastTime) / 1000);
        lastTime = currentTime;

        // Occasional natural deep ocean water swell
        ambientWaveTimer += dt;
        if (ambientWaveTimer > 3.5) {
            ambientWaveTimer = 0;
            const rx = Math.random() * window.innerWidth;
            const ry = Math.random() * window.innerHeight * 0.4; // Upper ocean swell
            rippleSim.disturb(rx, ry, 12, 70);
        }

        // 1. Update & Render Ocean Background & Sunlight Godrays
        oceanRenderer.update(dt);
        oceanRenderer.render();

        // Apply camera zoom transform to upper layers
        const cam = oceanRenderer.camera;

        // 2. Lurking Red Eyes in the Dark
        const eyesCtx = eyesCanvas.getContext('2d');
        eyesCtx.clearRect(0, 0, eyesCanvas.width, eyesCanvas.height);
        eyesSystem.update(dt);
        eyesSystem.render();

        // Update telemetry stalker entity indicator
        if (eyesIndicatorVal) {
            const currentStatus = eyesSystem.getStatus();
            if (eyesIndicatorVal.textContent !== currentStatus) {
                eyesIndicatorVal.textContent = currentStatus;
            }
        }

        // 3. Wandering Creatures Layer (with Camera Zoom interpolation)
        const creaturesCtx = creaturesCanvas.getContext('2d');
        creaturesCtx.clearRect(0, 0, creaturesCanvas.width, creaturesCanvas.height);
        creaturesCtx.save();
        if (Math.abs(cam.zoom - 1.0) > 0.001 || cam.isZoomed) {
            creaturesCtx.translate(cam.screenX, cam.screenY);
            creaturesCtx.scale(cam.zoom, cam.zoom);
            creaturesCtx.translate(-cam.worldX, -cam.worldY);
        }
        creatureSystem.update(dt, activeZoomCreature);
        creatureSystem.render(cam.zoom);
        creaturesCtx.restore();

        // 4. Marine Snow & Cavitation Bubbles
        const partCtx = particlesCanvas.getContext('2d');
        partCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
        particleSystem.update(dt);
        particleSystem.render();

        // 5. Water Wave Physics Simulation & Refractive Rendering
        rippleSim.render();
    }

    requestAnimationFrame(animate);
});
