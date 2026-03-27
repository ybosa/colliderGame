"use strict"

import controller from "./controller.js";
import {initCanvas, renderFrame,calculateMaxPlayerDist} from "./view.js";
import {linkedList} from "./utils.js";
import Wall from "./wall.js";
import {comparatorForLinkedList} from "./wall.js";
import {GAME_TICK_RATE} from "./config.js";

const playerPos = { x: 0, y: 0}
const canvas = initCanvas()
const MaxDist = calculateMaxPlayerDist( canvas)
const Controller = new controller(playerPos, canvas,MaxDist)

let walls = new linkedList()

for(let i = 0; i <  1000; i++){
    walls.put(new Wall(Math.random()*305, 0, 0, "wall", i % 3 === 0 ? "red" : i % 3 === 1 ? "green" : "blue")
        , comparatorForLinkedList)
}
let speed = 0.5;


function gameLoop() {
    let largestdistance = 0
    walls.forEach(wall => {
        wall.distance -= speed/GAME_TICK_RATE;
        if(wall.distance > largestdistance) largestdistance = wall.distance;
    })
    while (walls.getNext() && walls.get().distance <= -10){
        walls = walls.getNext()
        largestdistance = largestdistance + Math.random()*100
        const i = Math.floor(Math.random()*4)
        walls.put(new Wall(largestdistance , 0, 0, "wall", i % 3 === 0 ? "red" : i % 3 === 1 ? "green" : "blue")
            , comparatorForLinkedList)
    }

    // console.log(playerPos)

}


function displayLoop(){
        renderFrame(canvas, walls,playerPos)
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