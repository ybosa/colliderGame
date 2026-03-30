"use strict"

import controller from "./controller.js";
import {initCanvas, renderFrame,calculateMaxPlayerDist,isPixelTransparent} from "./view.js";
import {linkedList} from "./utils.js";
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
let coins = 0;


function gameLoop() {
    if(hasCrashedIntoObstacle(playerPos,obstacles)){
        loseGame();
        return;
    }
    else{
        collectCoins(obstacles)
        const furthestWall = clearPassedWalls(walls);
        const furthestObstacle = clearPassedWalls(obstacles);
        speed += acceleration/GAME_TICK_RATE;


        if(furthestWall === 0 || !furthestWall){
            buildWalls(0,1,speed*0.3,speed*1,speed*0.01)
                .forEach(wall => walls.put(wall))
            buildWalls(0,speed,speed*0.3,speed*1,speed*0.01)
                .forEach(wall => walls.put(wall))
            buildWalls(0,speed*4,speed*0.3,speed*1,speed*0.01)
                .forEach(wall => walls.put(wall))
        }
        else {
            buildWalls(furthestWall, speed * MAX_DIST, speed * 0.3, 1, 0)
                .forEach(wall => walls.put(wall))
        }

        if(furthestObstacle === 0 || !furthestObstacle){
            buildObstacles(speed*3,speed*6,speed*3,speed*5,speed*0.01)
                .forEach(obstacle => obstacles.put(obstacle))
        }
        else {
            buildObstacles(furthestObstacle+speed*2, speed * MAX_DIST, 3 , 15, 0)
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
}

function clearPassedWalls(walls){
    let largestDistance = 0
    walls.forEach(wall => {
        wall.distance -= speed/GAME_TICK_RATE;
        if(wall.distance > largestDistance) largestDistance = wall.distance;
    })
    while (walls.getNext() && walls.get().distance <= -10){
        walls = walls.getNext()
    }
    return largestDistance;
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
        else if(!isPixelTransparent(obstacle.imgName,playerPos,obstacle.distance,canvas)){
            hasCrashed = true;
        }
    })
    return hasCrashed;
}