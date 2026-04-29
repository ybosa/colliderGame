import {
    WALL_REL_SIZE,
    IMAGE_PATH,
    DEBUG_MODE,
    TRANSPARENCY_THRESHOLD,
    DETAIL_THRESHOLD,
    WALL_LINE_WIDTH,
    WALL_ARC_LINE_SCALING_WIDTH,
    COIN_REL_SIZE,
    MAX_RENDER_DIST,
    MAX_OBSTACLES_TO_RENDER
} from "./config.js";
import {COLOUR_PALETTE} from "./utils.js"
import {STYLES} from "./wall.js";
import {OBSTACLE_TYPES} from "./obstacle.js";

import transparencyCache from "../images/imageTransparencyCache.json" with {type: 'json'};

let imageSet = new Set();
let missingIMGSet = new Set();
let missingImgName = "missing.png"
initMissingIMG()

export function initCanvas() {
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

export function renderFrame(canvas, walls, obstacles, playerPos) {
    const context = canvas.getContext("2d");
    loadImages()
    clearScreen(context)
    renderWalls(walls, context, playerPos)
    renderObstacles(obstacles, context, playerPos)
    drawCursor(context)

}

function clearScreen(context) {
    context.fillStyle = "black";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)
}

function calcScreenValues(ctx) {
    const SCREEN_WIDTH = ctx.canvas.width;
    const SCREEN_HEIGHT = ctx.canvas.height;
    const centerX = SCREEN_WIDTH / 2
    const centerY = SCREEN_HEIGHT / 2
    const wallSize = (() => SCREEN_WIDTH > SCREEN_HEIGHT
        ? SCREEN_HEIGHT * WALL_REL_SIZE
        : SCREEN_WIDTH * WALL_REL_SIZE)();

    return {SCREEN_WIDTH, SCREEN_HEIGHT, centerX, centerY, wallSize}
}

function drawCursor(ctx) {
    const {SCREEN_WIDTH, SCREEN_HEIGHT, centerX, centerY} = calcScreenValues(ctx)

    ctx.strokeStyle = "black";
    let size = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, size, 0, 2 * Math.PI)
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.stroke();
}

function renderWalls(walls, ctx, playerPos) {
    ctx.save();
    const {SCREEN_WIDTH, SCREEN_HEIGHT, centerX, centerY, wallSize} = calcScreenValues(ctx)

    walls.forEach(wall => {
        let distance = wall.distance;
        if (distance <= 0) distance = 0.001
        if (distance > MAX_RENDER_DIST) return;
        let size = wallSize / distance;
        if (size < 0) return
        const colourPallet = COLOUR_PALETTE[wall.colour]
        const horizonAdj = adjustForPlayerMovement(playerPos, 10000);

        function drawEqualySpacedAlterning(numSlices, detailSpacing) {
            //fill colours in alternating slices
            let angle = wall.angle;
            const adj = adjustForPlayerMovement(playerPos, distance);
            for (let i = 0; i < numSlices; i++) {
                fillWallArcRadial(ctx, angle, angle + 2 * Math.PI / numSlices, size, (i % 2) ? colourPallet.fillColour : colourPallet.fillColour2, adj)
                angle += 2 * Math.PI / numSlices
            }

            //draw lines bounding the colours
            angle = wall.angle;
            for (let i = 0; i < numSlices; i++) {
                drawWallLineRadial(ctx, angle, size, 1, (i % 2) ? colourPallet.lineColour : colourPallet.lineColour2, WALL_LINE_WIDTH, adj, horizonAdj)
                angle += 2 * Math.PI / numSlices
            }
            //draw detailing lines
            const startDist = wall.distance;
            const endDist = wallSize / (DETAIL_THRESHOLD)
            let detailDist = startDist;
            let count = 0
            while (detailDist < endDist) {
                if (detailDist > 0) {
                    let pick = (Math.floor(numSlices * detailSpacing) + count) % 5;
                    let detailAngle = wall.angle;
                    const detailSize = wallSize / detailDist
                    const detailADJ = adjustForPlayerMovement(playerPos, detailDist)

                    switch (pick) {
                        case 0:
                            for (let i = 1; i < numSlices; i = i + 2) {
                                drawWallLineArc(ctx, detailAngle, detailAngle + 2 * Math.PI / numSlices, detailSize, ((count + 1) % 2) ? colourPallet.lineColour : colourPallet.lineColour2, WALL_ARC_LINE_SCALING_WIDTH / detailDist, detailADJ)
                                detailAngle += 2 * Math.PI / numSlices * 2
                            }
                            break;
                        case 1:
                            for (let i = 0; i < numSlices; i = i + 2) {
                                drawWallLineArc(ctx, detailAngle, detailAngle + 2 * Math.PI / numSlices, detailSize, (count % 2) ? colourPallet.lineColour : colourPallet.lineColour2, WALL_ARC_LINE_SCALING_WIDTH / detailDist, detailADJ)
                                detailAngle += 2 * Math.PI / numSlices * 2
                            }
                            break;
                        case 3:
                            for (let i = 0; i < numSlices; i = i + 3) {
                                drawWallLineArc(ctx, detailAngle, detailAngle + 2 * Math.PI / numSlices, detailSize, ((count + i) % 2) ? colourPallet.lineColour : colourPallet.lineColour2, WALL_ARC_LINE_SCALING_WIDTH / detailDist, detailADJ)
                                detailAngle += 2 * Math.PI / numSlices * 3
                            }
                            break;
                        default:
                            break
                    }

                }
                count++;
                detailDist += detailSpacing;
            }


        }

        if (size <= DETAIL_THRESHOLD) {
            fillWallCircle(ctx, size, colourPallet.fillColour, adjustForPlayerMovement(playerPos, distance))
        } else {
            drawWallLineCircle(ctx, size, colourPallet.lineColour, WALL_ARC_LINE_SCALING_WIDTH / distance, adjustForPlayerMovement(playerPos, distance))
            switch (wall.style) {
                case STYLES.EqualAlternating12:
                    drawEqualySpacedAlterning(12, 1);
                    break;
                case STYLES.EqualAlternating6:
                    drawEqualySpacedAlterning(6, 2);
                    break
                case STYLES.SOLID:
                    fillWallCircle(ctx, size, colourPallet.fillColour, adjustForPlayerMovement(playerPos, distance))
                    break;
                default:
                    fillWallCircle(ctx, size, colourPallet.fillColour, adjustForPlayerMovement(playerPos, distance))
                    break;
            }
        }
    })
    ctx.restore();
}

function adjustForPlayerMovement(playerPos, distance) {
    const deltaX = -playerPos.x / distance;
    const deltaY = -playerPos.y / distance;
    return {deltaX, deltaY}
}

function drawWallLineRadial(ctx, angle, sizeClose, sizeFar, colour, width, playerMovementADJClose, playerMovementADJFar) {
    const {SCREEN_WIDTH, SCREEN_HEIGHT, centerX, centerY, wallSize} = calcScreenValues(ctx)
    const startX = centerX + sizeClose * Math.cos(angle) + playerMovementADJClose.deltaX;
    const startY = centerY + sizeClose * Math.sin(angle) + playerMovementADJClose.deltaY;
    const endX = centerX + sizeFar * Math.cos(angle) + playerMovementADJFar.deltaX;
    const endY = centerY + sizeFar * Math.sin(angle) + playerMovementADJFar.deltaY;

    ctx.strokeStyle = colour;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
}

function drawWallLineArc(ctx, angleStart, angleEnd, size, colour, width, playerMovementADJ) {
    const {SCREEN_WIDTH, SCREEN_HEIGHT, centerX, centerY, wallSize} = calcScreenValues(ctx);
    ctx.beginPath();
    ctx.arc(centerX + playerMovementADJ.deltaX, centerY + playerMovementADJ.deltaY, size, angleStart, angleEnd);
    ctx.strokeStyle = colour;
    ctx.lineWidth = width;
    ctx.stroke();
}

function drawWallLineCircle(ctx, size, colour, width, playerMovementADJ) {
    drawWallLineArc(ctx, 0, 2 * Math.PI, size, colour, width, playerMovementADJ)
}

function fillWallArcRadial(ctx, angleStart, angleEnd, sizeClose, colour, playerMovementADJClose) {
    const {SCREEN_WIDTH, SCREEN_HEIGHT, centerX, centerY, wallSize} = calcScreenValues(ctx);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX + playerMovementADJClose.deltaX, centerY + playerMovementADJClose.deltaY, sizeClose, angleStart, angleEnd);
    ctx.closePath();
    ctx.fillStyle = colour;
    ctx.fill();
}

function fillWallCircle(ctx, sizeClose, colour, playerMovementADJClose) {
    fillWallArcRadial(ctx, 0, 2 * Math.PI, sizeClose, colour, playerMovementADJClose);
}

function renderObstacles(obstacles, ctx, playerPos) {
    ctx.save();
    const {SCREEN_WIDTH, SCREEN_HEIGHT, centerX, centerY, wallSize} = calcScreenValues(ctx)
    const obstacleSize = wallSize;

    let obstacleCount = 0;
    obstacles.forEach(obstacle => {
        //skip count if behind player or too far away these aren't valid to render
        if (obstacle.distance <= 0) return;
        if (obstacle.distance > MAX_RENDER_DIST) return;
        obstacleCount++;
    })

    let count = 0;
    obstacles.forEach(obstacle => {
        //skip if behind player or too far away
        if (obstacle.distance <= 0) return;
        if (obstacle.distance > MAX_RENDER_DIST) return;
        //back to front rendering so only render the front ones up to MAX_OBSTACLES_TO_RENDER
        //starting from obstacleCount - MAX_OBSTACLES_TO_RENDER to obstacleCount
        count++;
        if (count <= obstacleCount - MAX_OBSTACLES_TO_RENDER) {
            return;
        }

        ctx.strokeStyle = "white";
        let size = obstacleSize / obstacle.distance;
        if (size < 0) size = SCREEN_WIDTH * SCREEN_HEIGHT;

        const img = getImage(obstacle.imgName);
        ctx.save();
        ctx.translate(centerX - playerPos.x / obstacle.distance, centerY - playerPos.y / obstacle.distance);
        ctx.rotate(obstacle.angle);
        ctx.drawImage(img, -size, -size, size * 2, size * 2);

        obstacle.coins.forEach(coin => {
            ctx.drawImage(getImage(obstacle.coinImgName),
                coin.x * size * 2 - size * COIN_REL_SIZE - size, coin.y * size * 2 - size * COIN_REL_SIZE - size
                , size * 2 * COIN_REL_SIZE, size * 2 * COIN_REL_SIZE)
        })

        ctx.restore();
    })
    ctx.restore();
}

export function calculateMaxPlayerDist(canvas) {
    const ctx = canvas.getContext("2d");
    const {SCREEN_WIDTH, SCREEN_HEIGHT, centerX, centerY, wallSize} = calcScreenValues(ctx)
    return wallSize
}

function calcImageSampleXYFromPlayerPos(playerPos, canvas, obstacleAngle) {
    const ctx = canvas.getContext("2d");
    const {SCREEN_WIDTH, SCREEN_HEIGHT, centerX, centerY, wallSize} = calcScreenValues(ctx)

    const sxNoRot = (wallSize + playerPos.x) / (wallSize * 2) - 0.5//normalised to -0.5 to 0.5
    const syNoRot = (wallSize + playerPos.y) / (wallSize * 2) - 0.5
    const sDist = Math.sqrt(sxNoRot * sxNoRot + syNoRot * syNoRot)

    const sampleAngle = Math.atan2(playerPos.y, playerPos.x) - obstacleAngle
    const sx = Math.cos(sampleAngle) * sDist + 0.5
    const sy = Math.sin(sampleAngle) * sDist + 0.5

    return {sx: sx, sy: sy}
}

export function isPixelTransparent(imageName, playerPos, mainCanvas, angle) {
    const img = getImage(imageName);
    const transparencyData = transparencyCache[imageName]

    const {sx, sy} = calcImageSampleXYFromPlayerPos(playerPos, mainCanvas, angle)
    const x = Math.floor(sx * img.width);
    const y = Math.floor(sy * img.height).toString()

    if (transparencyData[y]) {
        const row = transparencyData[y]
        for (let pair of row) {
            const start = pair[0]
            const end = pair[1]
            if (x >= start && x <= end) return true
        }
    }
    return false
}

export function hasCollectedCoin(playerPos, mainCanvas, angle, coins) {
    const {sx, sy} = calcImageSampleXYFromPlayerPos(playerPos, mainCanvas, angle)
    for (let coin of coins) {
        if (Math.hypot(sx - coin.x, sy - coin.y) <= COIN_REL_SIZE) {
            return true
        }
    }
    return false
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
    if (!imageName) return imageSet[missingImgName]
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

export function initImages(Obstacle_Types, Colours, CoinName, filetype) {
    const obsTypes = Object.keys(OBSTACLE_TYPES).map((key) => OBSTACLE_TYPES[key])
    for (let type of obsTypes) {
        for (let colour of Colours) {
            const typeName = type.fileName
            getImage(typeName + "-" + colour + filetype)
        }
    }
    getImage(CoinName + filetype)
}

export function cacheImageTransparency() {
    if (!DEBUG_MODE) return;
    const ret = {}
    console.log("Caching transparency for " + imageSet.size + " images")
    let count = 0
    Object.keys(imageSet).forEach(imageName => {
        // if(count>1) return;
        console.log("Caching transparency for " + imageName)
        const image = getImage(imageName)
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);

        const centerX = Math.floor(image.width / 2);
        const centerY = Math.floor(image.height / 2);

        let data = {}
        // Image transparency caching logic goes here
        const imageData = ctx.getImageData(0, 0, image.width, image.height).data;
        for (let y = 0; y < image.height; y++) {
            let rowHasTransparent = false;
            let lastPxWasTransparent = false;
            const row = [];
            let transparentPairStart = -1;
            let lastTransparentFound = -1;
            for (let x = 0; x < image.width; x++) {
                let alpha = imageData[(y * image.width + x) * 4 + 3];

                //assuming images are square and we can ignore pixels outside the circular area
                //then you can remove transparent cache data outside the circle by pretending alpha isnt transparent
                const dist = Math.hypot(x - centerX, y - centerY);
                if (dist > Math.floor(image.width / 2) && image.width === image.height) {
                    alpha = 255
                }

                //if not currently in a transparent block
                if (!lastPxWasTransparent) {
                    //current pixel is transparent
                    if (alpha <= TRANSPARENCY_THRESHOLD) {
                        lastPxWasTransparent = true;
                        rowHasTransparent = true;
                        transparentPairStart = x;
                        lastTransparentFound = x;
                    } else {
                        continue
                    }
                }
                //currently in a transparent block
                else {
                    //if still transparent
                    if (alpha <= TRANSPARENCY_THRESHOLD) {
                        lastTransparentFound = x;
                    }
                    //if no longer transparent
                    else {
                        const pair = [transparentPairStart, lastTransparentFound]
                        row.push(pair)
                        lastPxWasTransparent = false;
                    }

                }
            }

            if (rowHasTransparent) {
                data[y] = row
            }
        }
        ret[imageName] = data
        count++
    });

    console.log(ret)

    // Create JSON file and trigger download
    const jsonBlob = new Blob([JSON.stringify(ret, null, 2)], {type: "application/json"});
    const downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);
    downloadLink.style.display = "none";
    downloadLink.href = URL.createObjectURL(jsonBlob);
    downloadLink.download = "imageTransparencyCache.json";
    downloadLink.click();
    document.body.removeChild(downloadLink);

}