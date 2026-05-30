// animations.js

// 17. Thunder Startup Animation Sequence Engine
export function runStartupSequence(onComplete) {
    const overlay = document.getElementById('startupOverlay');
    const flash = overlay.querySelector('.lightning-flash');
    const reveal = overlay.querySelector('.logo-reveal');
    const mainApp = document.getElementById('mainApp');

    // Sequence Point 1: Black screen default state setup. Execute Step 2: Flash initialization
    setTimeout(() => {
        if (flash) flash.style.opacity = '1';

        // Kill Flash, trigger Step 3: Logo Reveal animation step execution
        setTimeout(() => {
            if (flash) flash.style.opacity = '0';
            if (overlay) overlay.style.background = '#050914';
            if (reveal) {
                reveal.style.opacity = '1';
                reveal.style.transform = 'scale(1)';
                reveal.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            }

            // Step 4 & 5: Clear presentation layers to expose application viewport dashboard grid system
            setTimeout(() => {
                if (overlay) {
                    overlay.style.opacity = '0';
                    overlay.style.transition = 'opacity 0.6s ease';
                }

                // IMPORTANT: Make sure this aligns with the CSS class grid display
                if (mainApp) mainApp.style.display = 'grid';

                setTimeout(() => {
                    if (overlay) overlay.remove();
                    if (onComplete) onComplete();
                }, 600);
            }, 2000);
        }, 150);
    }, 400);
}

// 16 & 18. Weather Environment Theme & Dynamic Component Background Generators
let animationIntervalId = null;

export function updateWeatherThemeAndParticles(conditionCode, isNight = false) {
    const body = document.body;
    const container = document.getElementById('animationContainer');
    if (!container) return;

    container.innerHTML = ''; // Purge active loop states
    if (animationIntervalId) clearInterval(animationIntervalId);

    // Default System State Mapper
    let themeClass = 'theme-night';
    let pType = 'star';

    if (!isNight) {
        if (conditionCode === 'clear') { themeClass = 'theme-sunny'; pType = 'sun'; }
        else if (conditionCode === 'cloudy') { themeClass = 'theme-cloudy'; pType = 'cloud'; }
        else if (conditionCode === 'rain') { themeClass = 'theme-rain'; pType = 'drop'; }
        else if (conditionCode === 'thunderstorm') { themeClass = 'theme-thunderstorm'; pType = 'bolt'; }
        else if (conditionCode === 'snow') { themeClass = 'theme-snow'; pType = 'flake'; }
        else { themeClass = 'theme-sunny'; pType = 'sun'; }
    } else {
        themeClass = 'theme-night';
        pType = (conditionCode === 'rain') ? 'drop' : (conditionCode === 'thunderstorm' ? 'bolt' : 'star');
    }

    body.className = themeClass;
    spawnParticles(pType, container);
}

function spawnParticles(type, targetContainer) {
    const maxParticles = 30; // Optimized for performance

    const creatorFunc = () => {
        if (targetContainer.children.length >= maxParticles) return;

        const el = document.createElement('div');
        el.className = 'particle';
        el.style.left = Math.random() * 100 + 'vw';

        if (type === 'drop') {
            el.style.width = '2px';
            el.style.height = '15px';
            el.style.top = '-20px';
            el.style.transform = 'rotate(15deg)';
            el.style.animation = `fall ${1 + Math.random() * 1}s linear infinite`;
        } else if (type === 'bolt') {
            el.style.width = '2px';
            el.style.height = '30px';
            el.style.top = Math.random() * 80 + 'vh';
            el.style.opacity = '0';
            el.style.animation = `flashBolt ${2 + Math.random() * 4}s ease-in-out infinite`;
        } else if (type === 'sun') {
            el.style.width = el.style.height = `${4 + Math.random() * 6}px`;
            el.style.top = '105vh';
            el.style.borderRadius = '50%';
            el.style.animation = `floatUp ${6 + Math.random() * 6}s ease-in infinite`;
        } else {
            // Stars or ambient particles
            el.style.width = el.style.height = `${2 + Math.random() * 3}px`;
            el.style.top = Math.random() * 70 + 'vh';
            el.style.borderRadius = '50%';
            el.style.animation = `twinkle ${1 + Math.random() * 3}s ease-in-out infinite`;
        }

        targetContainer.appendChild(el);
        setTimeout(() => el.remove(), 8000);
    };

    // Initialize seed pipeline
    for (let i = 0; i < 15; i++) creatorFunc();
    animationIntervalId = setInterval(creatorFunc, 300);
}