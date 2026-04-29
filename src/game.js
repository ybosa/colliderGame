"use strict"

import controller from "./controller.js";
import {
    initCanvas,
    renderFrame,
    calculateMaxPlayerDist,
    isPixelTransparent,
    hasCollectedCoin,
    initImages,
    cacheImageTransparency
} from "./view.js";
import {linkedList, randomNamedcolour, COLOURS} from "./utils.js";
import Wall, {STYLES} from "./wall.js";
import Obstacle, {coinName, fileType, OBSTACLE_TYPES, randomObstacleType} from "./obstacle.js";
import {fileType as obstacleFiletype} from "./obstacle.js";
import {DEBUG_MODE, GAME_TICK_RATE, MAX_RENDER_DIST, setGraphicsConfig, setSensitivityConfig} from "./config.js";
import * as UI from "./ui.js";

const playerPos = {x: 0, y: 0}
const canvas = initCanvas()
const MaxDist = calculateMaxPlayerDist(canvas)

class GameState {
    constructor(colour, startGame = false) {
        this.walls = new linkedList()
        this.obstacles = new linkedList()
        this.speed = 1; //[m/s]
        this.acceleration = 0.25; //[m/s^2]
        this.totalDistance = 0;
        this.coins = 0;
        this.lost = false;
        this.gameStarted = startGame;
        this.paused = false;

        if (colour) this.colour = colour;
        else this.colour = randomNamedcolour();
        this.oldColour = randomNamedcolour();
        this.lastColourBlockEnd = 0;
    }
}

let gameState = new GameState()
const Controller = new controller(playerPos, canvas, MaxDist, cacheImageTransparency)


initImages(OBSTACLE_TYPES, COLOURS, coinName, obstacleFiletype)


export function setPaused(paused) {
    gameState.paused = paused
}

export function startGame() {
    if (gameState.paused && !gameState.lost) {
        gameState.paused = false;
    } else {
        gameState = new GameState(gameState.colour, true)
    }
    UI.attemptLockSync(canvas)
}


function gameLoop() {
    if (gameState.lost) return;
    if (gameState.paused) return;
    if (hasCrashedIntoObstacle(playerPos, gameState.obstacles)) {
        loseGame();
        return;
    } else {
        //process logic around movement, animation and coins
        collectCoins()
        let previousObstacleDist = findFurthest(gameState.obstacles) - gameState.speed / GAME_TICK_RATE;
        gameState.walls = filterPassed(gameState.walls, gameState.speed);
        gameState.obstacles = filterPassed(gameState.obstacles, gameState.speed);

        gameState.lastColourBlockEnd -= gameState.speed / GAME_TICK_RATE;
        gameState.totalDistance += gameState.speed / GAME_TICK_RATE;
        gameState.speed += gameState.acceleration / GAME_TICK_RATE;

        spin(gameState.walls)
        spin(gameState.obstacles)

        //check if it can add a new colour block
        if (gameState.lastColourBlockEnd <= MAX_RENDER_DIST) {
            //new color
            gameState.oldColour = gameState.colour;
            gameState.colour = randomNamedcolour();

            //new walls and obstacles
            //create walls and obstacles up to colour change distance or max render dist. only do one block of walls per tick
            let newWalls = []
            let newObstacles = []
            let startDist = gameState.lastColourBlockEnd
            let stopDist = startDist + 20 * gameState.speed + 200 * gameState.acceleration;

            let obstaclePadding = gameState.speed * 3 + 2;
            if (startDist < 10) obstaclePadding = gameState.speed * 5 + 10;

            newWalls.push(...createWallsForAColourBlock(startDist, stopDist, gameState.colour))
            newObstacles.push(...createObstaclesForAColourBlock(startDist + obstaclePadding, stopDist, gameState.colour, previousObstacleDist, gameState.speed))


            //append obstacles and walls to a game list
            newWalls.forEach(wall => gameState.walls.put(wall))
            if (gameState.gameStarted)
                newObstacles.forEach(obstacle => gameState.obstacles.put(obstacle))

            //setup vars for next time
            gameState.lastColourBlockEnd = stopDist
        }
    }
}

function createWallsForAColourBlock(startDist, StopDist, colour) {
    if (startDist >= StopDist) return [];
    let newWalls = []

    let angle = Math.random() * 2 * Math.PI;
    let rotSpeed = 0;
    //make it spin
    if (Math.random() < 0.15) rotSpeed = Math.random() * 0.25;
    else if (Math.random() < 0.3) rotSpeed = Math.random() * -0.25;

    //pick wall style
    const random = Math.random()
    if (random < 10.5) {
        const nWalls = Math.floor((StopDist - startDist) / 5) + 1
        for (let i = 0; i < nWalls; i++) {
            const wallStyle = (Math.random() < 0.75) ? STYLES.EqualAlternating12 : STYLES.EqualAlternating6
            newWalls.push(new Wall(startDist + i * (StopDist - startDist) / nWalls, angle, rotSpeed, colour, wallStyle))
        }
    }
        // else if(random < 0.85){
        //     const stylerand = Math.random()
        //     const halfPoint = (startDist + StopDist)/2
        //     newWalls.push(new Wall(halfPoint,angle,rotSpeed,colour,(stylerand < 0.5) ? STYLES.EqualAlternating12 : STYLES.EqualAlternating6))
        //     newWalls.push(new Wall(StopDist,angle,rotSpeed,colour,(stylerand > 0.5) ? STYLES.EqualAlternating12 : STYLES.EqualAlternating6))
    // }
    else {
        const wallStyle = (Math.random() < 0.5) ? STYLES.EqualAlternating12 : STYLES.EqualAlternating6
        const nWalls = Math.floor((StopDist - startDist) / 10) + 10
        for (let i = 0; i < nWalls; i++) {
            if (i % 3 === 1 && i < nWalls - 1) {
                newWalls.push(new Wall(startDist + i * (StopDist - startDist) / nWalls, angle, rotSpeed, colour, STYLES.SOLID))
            } else
                newWalls.push(new Wall(startDist + i * (StopDist - startDist) / nWalls, angle, rotSpeed, colour, wallStyle))
        }
    }
    return newWalls;
}

function createObstaclesForAColourBlock(startDist, StopDist, colour, previousObstacleDist, speed) {
    if (startDist >= StopDist) return [];

    const minSpacing = 2 * speed + 10
    let firstPlaceDist = Math.max(startDist, previousObstacleDist + minSpacing)
    if (firstPlaceDist > StopDist) {
        return [];
    }

    let newObstacles = []

    const defaultBonusProb = 5
    const switchTableSize = 6 + defaultBonusProb;
    const pick = Math.floor(Math.random() * switchTableSize)
    let nObstacles = Math.floor((StopDist - startDist) / minSpacing);
    if (nObstacles < 1) nObstacles = 1;

    while (nObstacles > 0 && startDist < StopDist && StopDist - startDist > minSpacing) {
        const pick = Math.floor(Math.random() * switchTableSize)
        let angle = Math.random() * 2 * Math.PI;
        let obstacleType = null; //used for falling through without breaks
        switch (pick) {
            case 0:
                obstacleType = OBSTACLE_TYPES.twoHole
            case 1:
                obstacleType = (obstacleType) ? obstacleType : OBSTACLE_TYPES.oneCorner;
            case 2:
                obstacleType = (obstacleType) ? obstacleType : OBSTACLE_TYPES.twoCorner;
            case 3:
                obstacleType = (obstacleType) ? obstacleType : OBSTACLE_TYPES.oneHole;
                const SDist = startDist
                const spacing = 2 + speed
                const rotDir = (Math.random() < 0.5) ? 1 : -1
                for (let i = 0; i < 3 && startDist < StopDist; i++) {
                    newObstacles.push(new Obstacle(SDist + i * spacing, angle + rotDir * i * Math.PI / 16 / speed, 0, colour, obstacleType))
                    startDist = SDist + i * spacing + minSpacing;
                }
                nObstacles--;
                break
            case 4:
                obstacleType = OBSTACLE_TYPES.oneCorner;
            case 5:
                obstacleType = (obstacleType) ? obstacleType : OBSTACLE_TYPES.twoHole;
            case 6:
                obstacleType = (obstacleType) ? obstacleType : OBSTACLE_TYPES.oneHole;
                const rotAmount = (Math.random() < 0.5) ? 0.25 : 0.5;
                let rotatingAngle = angle;
                for (let i = 0; i < 5 && startDist < StopDist && nObstacles > 0; i++) {
                    newObstacles.push(new Obstacle(startDist + minSpacing, rotatingAngle + rotAmount * Math.PI, 0, colour, obstacleType))
                    rotatingAngle += rotAmount * Math.PI;
                    startDist += minSpacing;
                    nObstacles--;
                }
                break
            default:
                for (let i = 0; i < nObstacles; i++) {
                    obstacleType = randomObstacleType();
                    newObstacles.push(new Obstacle(startDist + i * minSpacing, angle, 0, colour, obstacleType))
                }
                nObstacles = 0;
                break;
        }
    }

    return newObstacles;
}

function collectCoins() {
    gameState.obstacles.forEach(obstacle => {
        if (obstacle.distance <= 0 || obstacle.distance >= gameState.speed / GAME_TICK_RATE) {
            return;
        }
        if (!obstacle.coins) {
            return;
        } else if (hasCollectedCoin(playerPos, canvas, obstacle.angle, obstacle.coins)) {
            gameState.coins++;
        }
    })
}

function loseGame() {
    UI.showLoseMenu(Number((gameState.speed * 10).toFixed(1)), gameState.coins)
    gameState.speed = 0;
    gameState.acceleration = 0;
    gameState.lost = true;
}

function filterPassed(objectList, speed) {
    objectList.forEach(wall => {
        wall.distance -= speed / GAME_TICK_RATE;
    })
    while (objectList.getNext() && objectList.get().distance <= -10 - speed) {
        objectList = objectList.getNext()
    }
    return objectList;
}

function findFurthest(objectList) {
    let largestDistance = 0
    objectList.forEach(wall => {
        if (wall.distance > largestDistance) largestDistance = wall.distance;
    })
    return largestDistance;
}

function spin(wallsList) {
    wallsList.forEach(wall => {
            wall.angle += wall.rotSpeed / GAME_TICK_RATE;
        }
    )
}

function countList(list) {
    let count = 0;
    while (list.getNext()) {
        count++;
        list = list.getNext()
    }
    return count;
}

function displayLoop() {
    renderFrame(canvas, gameState.walls, gameState.obstacles, playerPos)
    displayFPS()
    window.requestAnimationFrame(displayLoop)
}

setInterval(gameLoop, 1000 / GAME_TICK_RATE);
window.requestAnimationFrame(displayLoop)

//fps counter-stuff
let time = Date.now()
let count = 0

function displayFPS() {
    count++
    if (Date.now() - time > 1000) {
        if (DEBUG_MODE) {
            console.log("fps: " + count)
            console.log("walls: " + countList(gameState.walls))
            console.log("obstacles: " + countList(gameState.obstacles))
        }
        count = 0
        time = Date.now()
    }
}

function hasCrashedIntoObstacle(playerPos, obstacles) {
    let hasCrashed = false;
    obstacles.forEach(obstacle => {
        if (obstacle.distance <= 0 || obstacle.distance >= gameState.speed / GAME_TICK_RATE) {
            return;
        } else if (!isPixelTransparent(obstacle.imgName, playerPos, canvas, obstacle.angle)) {
            hasCrashed = true;
        }
    })
    return hasCrashed;
}

export function setGraphics(level) {
    setGraphicsConfig(level)
}

export function setSensitivity(sensitivity) {
    setSensitivityConfig(sensitivity)
}

export function isGameOver(){ return gameState.lost}