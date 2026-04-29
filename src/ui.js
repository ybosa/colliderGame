import {isGameOver} from "./game.js";

export function attemptLockSync(canvas) {
    attemptLock(canvas)
}

export function openMenu(menu) {
    document.getElementById('gameMenu').style.display = 'none';
    document.getElementById('settingsMenu').style.display = 'none';
    document.getElementById('loseMenu').style.display = 'none';

    if(!menu){

    }
    else if(menu === "settingsMenu"){
        document.getElementById('settingsMenu').style.display = 'flex';
        document.exitPointerLock();
    }
    else if((menu === "loseMenu" ) || (isGameOver() && menu === "gameMenu")){
        document.getElementById('loseMenu').style.display = 'flex';
        document.exitPointerLock();
    }
    else if(menu === "gameMenu"){
        document.getElementById('gameMenu').style.display = 'flex';
        document.exitPointerLock();
    }
}

export async function attemptLock(canvas) {
    // Check if already locked
    if (document.pointerLockElement === canvas) return;

    try {
        await canvas.requestPointerLock({unadjustedMovement: true});
        // console.log("Pointer Locked");
    } catch (error) {
        // console.error("Lock failed, retrying...", error);
        // Retry after a short delay
        setTimeout(attemptLock(canvas), 1550);
    }
}

export function showLoseMenu(speed, coins) {
    const loseMenu = document.getElementById('loseMenu');
    loseMenu.querySelector('#speedValue').textContent = speed;
    loseMenu.querySelector('#coinsValue').textContent = coins;
    openMenu("loseMenu");
}


import {startGame, setGraphics, setSensitivity, setPaused} from './game.js';

function highlightGraphicsButton(level) {
    const buttons = {
        low: document.getElementById('graphicsLowButton'),
        medium: document.getElementById('graphicsMediumButton'),
        high: document.getElementById('graphicsHighButton')
    };

    Object.keys(buttons).forEach(key => {
        if (key === level) {
            buttons[key].style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--button-selected-color');
        } else {
            buttons[key].style.backgroundColor = getComputedStyle(document.querySelector('.gameMenu button')).backgroundColor;
        }
    });
}

function loadCookies() {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.split('=').map(c => c.trim());
        acc[key] = value;
        return acc;
    }, {});

    if (cookies.graphics) {
        setGraphics(cookies.graphics);
        highlightGraphicsButton(cookies.graphics)
    }
    if (cookies.sensitivity) {
        const sensitivity = parseFloat(cookies.sensitivity);
        setSensitivity(sensitivity);
        sensitivitySlider.value = sensitivity;
        sensitivityValue.textContent = sensitivity;
    }
}


function applyDefaultSettings() {
    if (!document.cookie.includes('graphics')) {
        setCookie('graphics', 'medium');
    }

    if (!document.cookie.includes('sensitivity')) {
        setCookie('sensitivity', 1);
    }
}

function setCookie(fieldName, value) {
    document.cookie = `${fieldName}=${value}; path=/`;
}

export function initUIScript() {

    window.addEventListener('load', () => {
        applyDefaultSettings();
        loadCookies();
    });

    //fix stupid firefox bug.
    const userAgent = navigator.userAgent;
    const isMobileFirefox = /Mobile|Tablet|Android/i.test(userAgent) && /Firefox/i.test(userAgent);

    document.addEventListener('pointerlockchange', () => {

        if (document.pointerLockElement === null && !isMobileFirefox) {
            setPaused(true);
            openMenu("gameMenu");
        }
    })


    document.getElementById('playButton').addEventListener('click', () => {
        startGame();
        openMenu(false)
    });

    document.getElementById('restartButton').addEventListener('click', () => {
        startGame();
        openMenu(false)
    });

    document.getElementById('gameMenuButton').addEventListener('click', () => {
        openMenu('gameMenu');
    });

    document.getElementById('settingsButton').addEventListener('click', () => {
        openMenu('settingsMenu');
    });

    document.getElementById('settingsButton2').addEventListener('click', () => {
        openMenu('settingsMenu');
    });

    document.getElementById('graphicsLowButton').addEventListener('click', () => {
        setGraphics('low');
        setCookie('graphics', 'low');
        highlightGraphicsButton('low');
    });

    document.getElementById('graphicsMediumButton').addEventListener('click', () => {
        setGraphics('medium');
        setCookie('graphics', 'medium');
        highlightGraphicsButton('medium');
    });

    document.getElementById('graphicsHighButton').addEventListener('click', () => {
        setGraphics('high');
        setCookie('graphics', 'high');
        highlightGraphicsButton('high');
    });

    const sensitivitySlider = document.getElementById('sensitivitySlider');
    const sensitivityValue = document.getElementById('sensitivityValue');

    sensitivitySlider.addEventListener('input', () => {
        sensitivityValue.textContent = sensitivitySlider.value;
    });

    sensitivitySlider.addEventListener('change', () => {
        setSensitivity(parseFloat(sensitivitySlider.value));
        setCookie('sensitivity', sensitivitySlider.value);
    });
}
