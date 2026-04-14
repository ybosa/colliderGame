import {SHAPES} from "./config.js";

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

    const SWITCHTABLESIZE = 2;
    let random = Math.floor(Math.random() * SWITCHTABLESIZE)
    if (seed) {
        random = seed;
    }
    while (distance < maxDistance) {
        distance += Math.random() * (MaxSpacing - minSpacing) + minSpacing;
        angle += rotSpacing;
        random = Math.floor(Math.random() * SWITCHTABLESIZE)
        switch (random) {
            case 0:
                obstacles.push(new Obstacle(distance, angle, rotSpeed, "walltest3.png", shape))
                break;
            default:
                obstacles.push(new Obstacle(distance, angle, rotSpeed, "glass.png", shape))
                break;
        }

    }
    return obstacles
}
