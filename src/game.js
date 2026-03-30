"use strict"

import controller from "./controller.js";
import {initCanvas, renderFrame,calculateMaxPlayerDist,isPixelTransparent} from "./view.js";
import {linkedList} from "./utils.js";
import Wall from "./wall.js";
import Obstacle from "./obstacle.js";
import {GAME_TICK_RATE} from "./config.js";

const playerPos = { x: 0, y: 0}
const canvas = initCanvas()
const MaxDist = calculateMaxPlayerDist( canvas)
const Controller = new controller(playerPos, canvas,MaxDist)

let walls = new linkedList()
let obstacles = new linkedList()

for(let i = 0; i <  100; i++){
    walls.put(new Wall(Math.random()*35, 0, 0, "glass.png", i % 3 === 0 ? "red" : i % 3 === 1 ? "green" : "blue")
        )
}

for(let i = 0; i <  100; i++){
    walls.put(new Wall(Math.random()*35, 0, 0, "wall.png", i % 3 === 0 ? "red" : i % 3 === 1 ? "green" : "blue")
        )
}
let speed = 1;


for(let i = 0; i <  20; i++){
    obstacles.put(new Obstacle(Math.random()*35, 0, 0, "bars.png", i % 3 === 0 ? "red" : i % 3 === 1 ? "green" : "blue")
        )
}


function gameLoop() {
    if(hasCrashedIntoObstacle(playerPos,obstacles)) {
        console.log("you lose")
        speed = 0;
        return
    }
    let largestdistance = 0
    walls.forEach(wall => {
        wall.distance -= speed/GAME_TICK_RATE;
        if(wall.distance > largestdistance) largestdistance = wall.distance;
    })
    while (walls.getNext() && walls.get().distance <= -10){
        walls = walls.getNext()
        largestdistance = largestdistance + Math.random()
        const i = Math.floor(Math.random()*4)
        walls.put(new Wall(largestdistance , 0, 0, null, i % 3 === 0 ? "red" : i % 3 === 1 ? "green" : "blue")
            )
    }

    obstacles.forEach(obstacle => {
        obstacle.distance -= speed/GAME_TICK_RATE;
    })

    while (obstacles.getNext() && obstacles.get().distance < 0){
        obstacles = obstacles.getNext()
        const i = Math.floor(Math.random()*4)
        obstacles.put(new Obstacle(Math.random()*35, 0, 0, "bars.png", i % 3 === 0 ? "red" : i % 3 === 1 ? "green" : "blue")
            )
    }

    // console.log(playerPos)

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