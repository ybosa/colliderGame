export function startGame(canvas) {
    attemptLock(canvas)
}

export async function attemptLock(canvas) {
    // Check if already locked
    if (document.pointerLockElement === canvas) return;

    try {
        await canvas.requestPointerLock({ unadjustedMovement: true });
        // console.log("Pointer Locked");
    } catch (error) {
        // console.error("Lock failed, retrying...", error);
        // Retry after a short delay
        setTimeout(attemptLock, 1000);
    }
}

export function showLoseMenu(speed, coins) {
    const loseMenu = document.getElementById('loseMenu');
    loseMenu.querySelector('#speedValue').textContent = speed;
    loseMenu.querySelector('#coinsValue').textContent = coins;
    loseMenu.style.display = 'flex';
    document.exitPointerLock();
}