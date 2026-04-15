"use strict"

import controller from "./controller.js";
import {initCanvas, renderFrame, calculateMaxPlayerDist, isPixelTransparent, hasCollectedCoin,initImages} from "./view.js";
import {linkedList, randomNamedColor,COLOURS} from "./utils.js";
import Wall, { STYLES} from "./wall.js";
import Obstacle, {coinName, fileType, OBSTACLE_TYPES} from "./obstacle.js";
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

let colour = randomNamedColor()
let oldColour = randomNamedColor();
let nextColourChangeDistance = 10;
let lastWallObstacleBlockStopDist = 0;
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
        clearPassed(walls);
        clearPassed(obstacles);
        totalDistance += speed/GAME_TICK_RATE;
        speed += acceleration/GAME_TICK_RATE;

        spin(walls)
        spin(obstacles)

        //new walls and obstacles
        //create walls and obstacles up to colour change distance or max render dist. only do one block of walls per tick
        let newWalls = []
        let newObstacles = []
        let startDist =lastWallObstacleBlockStopDist
        let stopDist = Math.min(nextColourChangeDistance,MAX_RENDER_DIST)

        newWalls.push(...createWallsForAColourBlock(startDist,stopDist,colour))
        newObstacles.push(...createObstaclesForAColourBlock(startDist,stopDist,colour))


        //change colour, set new colour, change distance
        if(nextColourChangeDistance <= MAX_RENDER_DIST){
            oldColour = colour;
            colour = randomNamedColor();
            nextColourChangeDistance += 20;
        }

        //set up next times vars
        lastWallObstacleBlockStopDist = stopDist;
        nextColourChangeDistance -= speed/GAME_TICK_RATE;


        //append obstacles and walls to a game list
        newWalls.forEach(wall => walls.put(wall))
        newObstacles.forEach(obstacle => obstacles.put(obstacle))
    }
}

function createWallsForAColourBlock(startDist,StopDist,colour){
    if(StopDist > MAX_RENDER_DIST) StopDist = MAX_RENDER_DIST;
    if(startDist >= StopDist) return [];
    const random = Math.random()
    let newWalls = []

    if(random < 10.5){
        const wallStyle = (Math.random() < 0.5) ? STYLES.EqualAlternating12 : STYLES.EqualAlternating6
        newWalls.push(new Wall(StopDist,Math.random()*2*Math.PI,0,colour,wallStyle))
    }
    return newWalls;
}

function createObstaclesForAColourBlock(startDist,StopDist,colour){
    if(StopDist > MAX_RENDER_DIST) StopDist = MAX_RENDER_DIST;
    if(startDist >= StopDist) return [];
    const random = Math.random()
    let newObjects = []


    if(random < 10.5){
        const obstacleType = OBSTACLE_TYPES.cross
        newObjects.push(new Obstacle(StopDist, 0, 0, obstacleType.fileName+"-"+colour+fileType, obstacleType,9))
    }

    return newObjects;
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

function clearPassed(wallsList){
    let largestDistance = 0
    wallsList.forEach(wall => {
        wall.distance -= speed/GAME_TICK_RATE;
        if(wall.distance > largestDistance) largestDistance = wall.distance;
    })
    while (wallsList.getNext() && wallsList.get().distance <=- 10 -speed){
        wallsList = wallsList.getNext()
        walls = wallsList
    }
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