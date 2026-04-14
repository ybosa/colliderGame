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

export function buildObstacles(currentDistance, maxDistance, minSpacing, MaxSpacing,rotSpacing,colour) {
    let angle = 0, rotSpeed = 0, shape = SHAPES.CIRCLE;
    let distance = currentDistance;
    distance += Math.random() * (MaxSpacing - minSpacing) + minSpacing;

    let obstacles = []

    while (distance < maxDistance) {
        angle += rotSpacing;
        const random = Math.floor(Math.random() * OBSTACLE_TYPES.length)
        obstacles.push(new Obstacle(distance, angle, rotSpeed, OBSTACLE_TYPES[random]+"-"+colour+fileType, shape))
        distance += Math.random() * (MaxSpacing - minSpacing) + minSpacing;
        console.log("test")
    }
    return obstacles
}

const OBSTACLE_TYPES = ["1corner","1hole","2corner","2hole","4corners","4hole","cross"]
const fileType = ".png"