import {WALL_REL_SIZE, IMAGE_PATH, DEBUG_MODE, TRANSPARENCY_THRESHOLD} from "./config.js";

let imageSet = new Set();
let missingIMGSet = new Set();
let missingImgName = "missing.png"
initMissingIMG()

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

export function renderFrame(canvas,walls,obstacles,playerPos){
    const context = canvas.getContext("2d");
    loadImages()
    clearScreen(context)
    renderWalls(walls,context,playerPos )
    renderWalls(obstacles,context,playerPos )
    drawCursor(context)

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
    let size = 2;
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

        if(wall.imgName){
            const img = getImage(wall.imgName);
            ctx.drawImage(img, centerX - playerPos.x/wall.distance -size,centerY - playerPos.y/wall.distance -size, size*2, size*2);
        }
        else {
            ctx.fillStyle = wall.colour;
            ctx.fill();
        }
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

function calcImageSampleXYFromPlayerPos(playerPos, canvas) {
    const ctx = canvas.getContext("2d");
    const SCREEN_WIDTH = ctx.canvas.width;
    const SCREEN_HEIGHT = ctx.canvas.height;
    // const centerX = SCREEN_WIDTH / 2 // - playerPos.x; fake camera rotation
    // const centerY = SCREEN_HEIGHT / 2 // - playerPos.y;
    const wallSize = (() => SCREEN_WIDTH > SCREEN_HEIGHT
        ? SCREEN_HEIGHT * WALL_REL_SIZE
        : SCREEN_WIDTH * WALL_REL_SIZE)();

    const sx = (wallSize + playerPos.x ) / (wallSize*2 )
    const sy = (wallSize + playerPos.y ) / (wallSize*2 )

    return {sx:sx, sy:sy}
}

export function isPixelTransparent(imageName, playerPos,distance,mainCanvas) {
    const img = getImage(imageName);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 1;
    canvas.height = 1;
    const {sx,sy} = calcImageSampleXYFromPlayerPos(playerPos, mainCanvas)
    const x = Math.floor(sx * img.width);
    const y = Math.floor(sy * img.height);


    ctx.drawImage(img, x, y, 1, 1, 0, 0, 1, 1);

    const pixelData = ctx.getImageData(0, 0, 1, 1).data;

    const alpha = pixelData[3]; // RGBA → index 3 is alpha
    return alpha <= TRANSPARENCY_THRESHOLD; // true if fully transparent
}


//image caching and loading
function loadImages() {
    missingIMGSet.forEach(imageName => {
        if (imageSet[imageName] && imageSet[imageName] !== imageSet[missingImgName]) {
            return;
        }
        if (DEBUG_MODE) console.log("loading img: " + imageName)
        let loadIMG = new Image()
        loadIMG.src = IMAGE_PATH + imageName

        loadIMG.onload = () => {
            imageSet[imageName] = loadIMG
            missingIMGSet.delete(imageName)
            if (DEBUG_MODE) console.log("loaded img: " + imageName)
        }
        loadIMG.onerror = () => {
            if (DEBUG_MODE) {
                console.log("error loading image: " + imageName)
            }
            imageSet[imageName] = imageSet[missingImgName]
            missingIMGSet.delete(imageName)
        }

    })

}

function getImage(imageName) {
    if(!imageName) return imageSet[missingImgName]
    if (imageSet[imageName]) {
        return imageSet[imageName]
    } else {
        missingIMGSet.add(imageName)
        return imageSet[missingImgName]
    }
}

function initMissingIMG() {
    // Create a 8x8 canvas
    const size = 8;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    // Draw checkerboard pattern
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const isBlack = (x + y) % 2 === 0;
            ctx.fillStyle = isBlack ? "#000000" : "#FF00FF";
            ctx.fillRect(x, y, 1, 1);
        }
    }

    // Convert canvas to an Image object
    const loadIMG = new Image();
    loadIMG.src = canvas.toDataURL("image/png");
    imageSet[missingImgName] = loadIMG;
}