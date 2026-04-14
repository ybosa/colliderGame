import {SHAPES} from "./config.js";
import {randomNamedColor} from "./utils.js";

export default class Obstacle{
    constructor(distance, angle, rotSpeed, imgName,shape,coins) {
        this.distance = distance;
        this.angle = angle;
        this.rotSpeed = rotSpeed;
        this.imgName = imgName;
        this.coins = coins;
        this.shape = shape;
    }

    comparator(elementToAdd, existingElement) {
        return elementToAdd.distance > existingElement.distance; //back to front rendering
    }

}

export function buildObstacles(currentDistance, maxDistance, minSpacing, MaxSpacing,rotSpacing, seed) {
    let angle = 0, rotSpeed = 0, shape = SHAPES.CIRCLE;
    let distance = currentDistance;
    let obstacles = []

    let random = Math.floor(Math.random() * OBSTACLE_TYPES.length)
    if (seed) {
        random = seed;
    }
    while (distance < maxDistance) {
        distance += Math.random() * (MaxSpacing - minSpacing) + minSpacing;
        angle += rotSpacing;
        random = Math.floor(Math.random() * OBSTACLE_TYPES.length)
        const colour = "-"+randomNamedColor()

        obstacles.push(new Obstacle(distance, angle, rotSpeed, OBSTACLE_TYPES[random]+colour+fileType, shape))

    }
    return obstacles
}

const OBSTACLE_TYPES = ["1corner","1hole","2corner","2hole","4corners","4hole","cross"]
const fileType = ".png"