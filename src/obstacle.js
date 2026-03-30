import {SHAPES} from "./utils.js";

export default class Obstacle{
    constructor(distance, angle, rotSpeed, imgName,shape,coins) {
        this.distance = distance;
        this.angle = angle;
        this.rotSpeed = rotSpeed;
        this.imgName = imgName;
        this.coins = coins;
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
    do {
        distance += Math.random() * (MaxSpacing - minSpacing) + minSpacing;
        angle += rotSpacing;
        switch (random) {
            case 0:
                obstacles.push(new Obstacle(distance, angle, rotSpeed, "bars.png", shape))
                break;
            default:
                obstacles.push(new Obstacle(distance, angle, rotSpeed, "glass.png", shape))
                break;
        }

    } while (distance < maxDistance)
    return obstacles
}
