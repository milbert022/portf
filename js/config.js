/**
 * ====================================================================
 * PORTFOLIO CONFIGURATION - MILBERT A. LOMIBAO
 * ====================================================================
 * Edit your personal information, links, and portfolio details below.
 * Everything here updates the portfolio display and interactive creature popups automatically!
 */

const PORTFOLIO_CONFIG = {
    // Personal Details
    name: "Milbert A. Lomibao",
    title: "Computer Engineering",
    academicField: "Computer Engineering",
    specialization: "Embedded Systems • Computer Architecture • Software & Hardware Systems",
    bio: "Passionate Computer Engineering student & builder fascinated by low-level systems, high-performance computing, hardware-software integration, and creative web technologies. Exploring the digital depths where physics meets code.",
    depthTagline: "Exploring the Abyssal Depths of Technology",

    // Contact & Social Information
    contacts: {
        // Direct Links that open in a new tab when clicked
        facebook: {
            label: "Facebook",
            url: "https://www.facebook.com/facebookdatcomdatph/",
            icon: "facebook",
            display: "Milbert Lomibao",
            description: "Connect on Social Media"
        },
        github: {
            label: "GitHub",
            url: "https://github.com/milbert022?tab=repositories",
            icon: "github",
            display: "github.com/milbert022",
            description: "View Code Repositories & Projects"
        },
        linkedin: {
            label: "LinkedIn",
            url: "https://www.linkedin.com/in/lomibao-milbert-a-475594444/?isSelfProfile=true",
            icon: "linkedin",
            display: "Milbert A. Lomibao",
            description: "Professional Network"
        },

        // Placeholder items with copy-to-clipboard functionality
        email: {
            label: "Email",
            value: "bert0022.lol@gmail.com",
            url: "mailto:bert0022.lol@gmail.com",
            icon: "envelope",
            copyable: true
        },
        phone: {
            label: "Phone",
            value: "+63 951 021 2678",
            url: "tel:+639510212678",
            icon: "phone",
            copyable: true
        },
        location: {
            label: "Location",
            value: "Baras, Rizal",
            icon: "location",
            copyable: false
        }
    },

    // Academic Knowledge & Technical Focus
    academicSkills: [
        { name: "Digital Logic Design & Verilog", category: "Hardware" },
        { name: "Microprocessors & Embedded C/C++", category: "Firmware" },
        { name: "Computer Architecture & Organization", category: "Systems" },
        { name: "Data Structures & Algorithms", category: "Software" },
        { name: "Operating Systems & Concurrency", category: "Systems" },
        { name: "Computer Networks & Protocols", category: "Networking" },
        { name: "IoT & Hardware Interfacing", category: "Embedded" },
        { name: "Full-Stack Web & Graphics (GLSL/WebGL)", category: "Graphics" }
    ],

    // Ocean Environment Settings
    oceanSettings: {
        depthMeters: 4280, // Abyssal zone
        waterTemperature: "2.4°C",
        ambientPressure: "428 atm",
        salinity: "34.8 PSU",
        enableAudioByDefault: false, // Browser policies require user interaction
        enableLurkingEyes: true,
        enableVolumetricLights: true,
        enableFluidWaves: true
    }
};

// Export to window object for global accessibility
window.PORTFOLIO_CONFIG = PORTFOLIO_CONFIG;
