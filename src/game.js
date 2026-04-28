"use strict"

import controller from "./controller.js";
import {initCanvas, renderFrame, calculateMaxPlayerDist, isPixelTransparent, hasCollectedCoin,initImages} from "./view.js";
import {linkedList, randomNamedcolour,COLOURS} from "./utils.js";
import Wall, { STYLES} from "./wall.js";
import Obstacle, {coinName, fileType, OBSTACLE_TYPES, randomObstacleType} from "./obstacle.js";
import {fileType as obstacleFiletype} from "./obstacle.js";
import {GAME_TICK_RATE, MAX_RENDER_DIST} from "./config.js";

const playerPos = { x: 0, y: 0}
const canvas = initCanvas()
const MaxDist = calculateMaxPlayerDist( canvas)
const Controller = new controller(playerPos, canvas,MaxDist)

let walls = new linkedList()
let obstacles = new linkedList()
let speed = 1; //[m/s]
let acceleration =1; //[m/s^2]
let totalDistance = 0;
let coins = 0;
let lost = false;

let colour = randomNamedcolour()
let oldColour = randomNamedcolour();
let lastColourBlockEnd = 0;
initImages(OBSTACLE_TYPES ,COLOURS,coinName,obstacleFiletype)


function gameLoop() {
    if(lost) return;
    if(hasCrashedIntoObstacle(playerPos,obstacles)){
        loseGame();
        return;
    }
    else{
        //process logic around movement, animation and coins
        collectCoins(obstacles)
        let previousObstacleDist = findFurthest(obstacles) -speed/GAME_TICK_RATE;
        walls = filterPassed(walls);
        obstacles = filterPassed(obstacles);

        lastColourBlockEnd -= speed/GAME_TICK_RATE;
        totalDistance += speed/GAME_TICK_RATE;
        speed += acceleration/GAME_TICK_RATE;

        spin(walls)
        spin(obstacles)

        //check if it can add a new colour block
        if(lastColourBlockEnd <= MAX_RENDER_DIST){
            //new color
            oldColour = colour;
            colour = randomNamedcolour();

            //new walls and obstacles
            //create walls and obstacles up to colour change distance or max render dist. only do one block of walls per tick
            let newWalls = []
            let newObstacles = []
            let startDist =lastColourBlockEnd
            let stopDist = startDist + 20 * speed + 200 * acceleration;

            newWalls.push(...createWallsForAColourBlock(startDist,stopDist,colour))
            newObstacles.push(...createObstaclesForAColourBlock(startDist,stopDist,colour,previousObstacleDist))



            //append obstacles and walls to a game list
            newWalls.forEach(wall => walls.put(wall))
            newObstacles.forEach(obstacle => obstacles.put(obstacle))

            //setup vars for next time
            lastColourBlockEnd = stopDist
        }
    }
}

function createWallsForAColourBlock(startDist,StopDist,colour){
    if(startDist >= StopDist) return [];
    let newWalls = []

    let angle = Math.random()*2*Math.PI;
    let rotSpeed = 0;
    //make it spin
    if(Math.random() < 0.15) rotSpeed = Math.random()*0.25;
    else if(Math.random() < 0.3) rotSpeed = Math.random()* -0.25;

    //pick wall style
    const random = Math.random()
    if(random <10.5){
        const nWalls = Math.floor((StopDist - startDist)/5) +1
        for(let i = 0; i < nWalls; i++){
            const wallStyle = (Math.random() < 0.75) ? STYLES.EqualAlternating12 : STYLES.EqualAlternating6
            newWalls.push(new Wall(startDist + i * (StopDist - startDist)/nWalls,angle,rotSpeed,colour,wallStyle))
        }
    }
    // else if(random < 0.85){
    //     const stylerand = Math.random()
    //     const halfPoint = (startDist + StopDist)/2
    //     newWalls.push(new Wall(halfPoint,angle,rotSpeed,colour,(stylerand < 0.5) ? STYLES.EqualAlternating12 : STYLES.EqualAlternating6))
    //     newWalls.push(new Wall(StopDist,angle,rotSpeed,colour,(stylerand > 0.5) ? STYLES.EqualAlternating12 : STYLES.EqualAlternating6))
    // }
    else{
        const wallStyle = (Math.random() < 0.5) ? STYLES.EqualAlternating12 : STYLES.EqualAlternating6
        const nWalls = Math.floor((StopDist - startDist)/10) +10
        for(let i = 0; i < nWalls; i++){
            if(i%3 === 1 && i < nWalls-1){
                newWalls.push(new Wall(startDist + i * (StopDist - startDist)/nWalls,angle,rotSpeed,colour,STYLES.SOLID))
            }
            else
                newWalls.push(new Wall(startDist + i * (StopDist - startDist)/nWalls,angle,rotSpeed,colour,wallStyle))
        }
    }
    return newWalls;
}

function createObstaclesForAColourBlock(startDist,StopDist,colour,previousObstacleDist){
    if(startDist >= StopDist) return [];

    const minSpacing = speed + 10
    let firstPlaceDist = Math.max(startDist,previousObstacleDist+minSpacing)
    if(firstPlaceDist > StopDist) {
        return [];
    }

    let newObstacles = []

    const switchTableSize = 10;
    const pick = Math.floor(Math.random()*switchTableSize)
    let nObstacles = Math.floor ((StopDist - startDist)/minSpacing);
    if(nObstacles < 1) nObstacles = 1;

    switch (pick) {
        default:
            for (let i = 0; i < nObstacles; i++) {
                const obstacleType = randomObstacleType();
                newObstacles.push(new Obstacle(startDist + i * minSpacing,0,0,colour,obstacleType))
            }
            break;
    }
    return newObstacles;
}

function collectCoins(obstacles){
    obstacles.forEach(obstacle => {
        if(obstacle.distance <= 0 || obstacle.distance >= speed/GAME_TICK_RATE) {
            return;
        }
        if(!obstacle.coins){
            return;
        }
        else if(hasCollectedCoin(playerPos,canvas,obstacle.angle,obstacle.coins)){
            coins++;
            console.log("coins: "+coins)
        }
    })
}

function loseGame(){
    console.log("you lose")
    speed = 0;
    acceleration = 0;
    lost = true;
}

function filterPassed(objectList){
    objectList.forEach(wall => {
        wall.distance -= speed/GAME_TICK_RATE;
    })
    while (objectList.getNext() && objectList.get().distance <=- 10 -speed){
        objectList = objectList.getNext()
    }
    return objectList;
}

function findFurthest(objectList){
    let largestDistance = 0
    objectList.forEach(wall => {
        if(wall.distance > largestDistance) largestDistance = wall.distance;
    })
    return largestDistance;
}

function spin(wallsList){
    wallsList.forEach(wall => {
        wall.angle += wall.rotSpeed/GAME_TICK_RATE;
        }
    )
}

function countList(list){
    let count = 0;
    while (list.getNext() ){
        count++;
        list = list.getNext()
    }
    return count;
}

function displayLoop(){
        renderFrame(canvas, walls,obstacles,playerPos)
        displayFPS()
        window.requestAnimationFrame(displayLoop)
}
setInterval(gameLoop,1000/GAME_TICK_RATE);
window.requestAnimationFrame(displayLoop)

//fps counter-stuff
let time = Date.now()
let count = 0

function displayFPS(){
    count++
    if(Date.now() - time > 1000){
        console.log("fps: "+count)
        console.log("walls: " + countList(walls))
        console.log("obstacles: " + countList(obstacles))

        count = 0
        time = Date.now()
    }
}

function hasCrashedIntoObstacle(playerPos,obstacles){
    let hasCrashed = false;
    obstacles.forEach(obstacle => {
        if(obstacle.distance <= 0 || obstacle.distance >= speed/GAME_TICK_RATE) {
            return;
        }
        else if(!isPixelTransparent(obstacle.imgName,playerPos,canvas,obstacle.angle)){
            hasCrashed = true;
        }
    })
    return hasCrashed;
}