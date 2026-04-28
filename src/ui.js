export function startGame(canvas) {
    canvas.requestPointerLock();
}

export function showLoseMenu(speed, coins) {
    const loseMenu = document.getElementById('loseMenu');
    loseMenu.querySelector('#speedValue').textContent = speed;
    loseMenu.querySelector('#coinsValue').textContent = coins;
    loseMenu.style.display = 'flex';
    document.exitPointerLock();
}