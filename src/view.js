import {WALL_REL_SIZE} from "./config.js";

export function initCanvas(){
    const canvas = document.createElement("canvas");
    const SCREEN_WIDTH = Math.floor(window.innerWidth / 2) * 2;
    const SCREEN_HEIGHT = Math.floor(window.innerHeight / 2) * 2;
    canvas.setAttribute("width", SCREEN_WIDTH);
    canvas.setAttribute("height", SCREEN_HEIGHT);
    document.body.appendChild(canvas);
    const context = canvas.getContext("2d");
    context.imageSmoothingEnabled = false;

    return canvas
}

export function renderFrame(canvas,walls,playerPos){
    const context = canvas.getContext("2d");
    clearScreen(context)
    renderWalls(walls,context,playerPos )
    // drawCursor(context)

}

function clearScreen(context){
    context.fillStyle = "black";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)
}

function drawCursor(ctx){
    const SCREEN_WIDTH = ctx.canvas.width;
    const SCREEN_HEIGHT = ctx.canvas.height;
    const centerX = SCREEN_WIDTH / 2
    const centerY = SCREEN_HEIGHT / 2

    ctx.strokeStyle = "black";
    let size = 5;
    ctx.beginPath();
    ctx.arc(centerX,centerY,size,0,2*Math.PI)
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.stroke();
}

function renderWalls(walls,ctx,playerPos){
    ctx.save();
    const SCREEN_WIDTH = ctx.canvas.width;
    const SCREEN_HEIGHT = ctx.canvas.height;
    const centerX = SCREEN_WIDTH / 2 // - playerPos.x; fake camera rotation
    const centerY = SCREEN_HEIGHT / 2 // - playerPos.y;
    const wallSize = (() => SCREEN_WIDTH > SCREEN_HEIGHT
        ? SCREEN_HEIGHT * WALL_REL_SIZE
        : SCREEN_WIDTH * WALL_REL_SIZE)();

    walls.forEach(wall => {
        // if(wall.distance <= 0) return;
        ctx.strokeStyle = "white";
        let size = wallSize / wall.distance;
        if(size < 0) size = SCREEN_WIDTH * SCREEN_HEIGHT;
        ctx.beginPath();
        ctx.arc(centerX - playerPos.x/wall.distance,centerY - playerPos.y/wall.distance,size,0,2*Math.PI)
        ctx.fillStyle = wall.colour;
        ctx.fill();
        // ctx.lineWidth = 1;
        // ctx.stroke();
    })

    ctx.restore();
}

export function calculateMaxPlayerDist(canvas){
    const ctx = canvas.getContext("2d");
    const SCREEN_WIDTH = ctx.canvas.width;
    const SCREEN_HEIGHT = ctx.canvas.height;
    const wallSize = (() => SCREEN_WIDTH > SCREEN_HEIGHT
        ? SCREEN_HEIGHT * WALL_REL_SIZE
        : SCREEN_WIDTH * WALL_REL_SIZE)();
    return wallSize
}
