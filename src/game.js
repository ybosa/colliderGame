"use strict"

import controller from "./controller.js";
import {initCanvas, renderFrame,calculateMaxPlayerDist,isPixelTransparent} from "./view.js";
import {linkedList, randomNamedColor} from "./utils.js";
import Wall, {buildWalls} from "./wall.js";
import Obstacle, {buildObstacles} from "./obstacle.js";
import {GAME_TICK_RATE, MAX_DIST} from "./config.js";

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
let nextColourChange = 10*speed;


function gameLoop() {
    if(lost) return;
    if(hasCrashedIntoObstacle(playerPos,obstacles)){
        loseGame();
        return;
    }
    else{
        collectCoins(obstacles)
        const furthestWall = clearPassedWalls(walls);
        const furthestObstacle = clearPassedWalls(obstacles);
        totalDistance += speed/GAME_TICK_RATE;
        speed += acceleration/GAME_TICK_RATE;

        spinWalls(walls)
        spinWalls(obstacles)
        //new walls
        if(totalDistance > nextColourChange){
            colour = randomNamedColor()
        }

        if(furthestWall === 0 || !furthestWall){
            buildWalls(0,1,speed*0.3,speed*1,colour,1)
                .forEach(wall => walls.put(wall))
            buildWalls(0,speed,speed*0.3,speed*1,colour,1)
                .forEach(wall => walls.put(wall))
            buildWalls(0,speed*4,10,15,colour,1)
                .forEach(wall => walls.put(wall))
        }
        else {
            buildWalls(furthestWall, MAX_DIST, 10,15, colour,Math.random() * 3/speed)
                .forEach(wall => walls.put(wall))
        }

        if(furthestObstacle === 0 || !furthestObstacle){
            buildObstacles(speed*3,speed*12,speed*3,speed*5,1,colour)
                .forEach(obstacle => obstacles.put(obstacle))
        }
        else {
            buildObstacles(furthestObstacle+speed*2,  MAX_DIST, 3 , 15, Math.random() * 3/speed,colour)
                .forEach(obstacle => obstacles.put(obstacle))
        }
    }
}

function collectCoins(obstacles){

}

function loseGame(){
    console.log("you lose")
    speed = 0;
    acceleration = 0;
    lost = true;
}

function clearPassedWalls(wallsList){
    let largestDistance = 0
    wallsList.forEach(wall => {
        wall.distance -= speed/GAME_TICK_RATE;
        if(wall.distance > largestDistance) largestDistance = wall.distance;
    })
    while (wallsList.getNext() && wallsList.get().distance <= -10*speed){
        wallsList = wallsList.getNext()
        walls = wallsList
    }
    return largestDistance;
}

function spinWalls(wallsList){
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