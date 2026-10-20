# Milbert A. Lomibao - Computer Engineering Portfolio

An immersive, interactive deep-sea Atlantic oceanic portfolio featuring realistic 2D fluid wave dynamics, procedural bioluminescent creatures, volumetric lighting, lurking abyss stalkers, and Web Audio API hydrophone acoustics.

## Project Structure

```
portf/
│
├── index.html                   # Main portfolio landing page
├── portfolio-standalone.html    # Standalone single-file bundle (runs locally without CORS)
├── .nojekyll                    # Disables Jekyll processing on GitHub Pages
├── Open-Portfolio.bat           # 1-Click launcher for local preview
├── push-to-github.bat           # 1-Click push script to GitHub
│
├── css/                         # Stylesheet directory
│   └── style.css                # Deep-sea Atlantic theme, animations, and typography
│
└── js/                          # JavaScript module directory
    ├── config.js                # Profile info, contacts, bio, skills configuration
    ├── audio.js                 # Web Audio API hydrophone & water acoustics
    ├── ripples.js               # Interactive 2D fluid wave physics simulation
    ├── eyes.js                  # Lurking abyssal stalker entity rendering
    ├── creatures.js             # Bioluminescent marine creature simulation (Jellyfish, Anglerfish, etc.)
    ├── particles.js             # Marine snow & cavitation bubble particle system
    ├── ocean.js                 # Deep ocean background, godrays & caustics rendering
    └── main.js                  # Main controller, HUD telemetry & interaction manager
```

## How to Run

- **GitHub Pages**: View live at `https://milbert022.github.io/portf/`
- **Locally**: Open `Open-Portfolio.bat` or double-click `index.html` (or `portfolio-standalone.html`).
