import {randomNamedColor,randomColourSimilarToNamedColor, SHAPES} from "./utils.js";

export default class Wall {
    constructor(distance, angle, rotSpeed, imgName,colour,shape) {
        this.distance = distance;
        this.angle = angle;
        this.rotSpeed = rotSpeed;
        this.imgName = imgName;
        this.colour = colour;
    }

    comparator(elementToAdd, existingElement) {
        return elementToAdd.distance < existingElement.distance; //front to back rendering
    }

}

export function buildWalls(currentDistance, maxDistance, minSpacing, MaxSpacing,rotSpacing, seed) {
    let angle = 0, rotSpeed = 0, shape = SHAPES.CIRCLE;
    let distance = currentDistance;
    let walls = []

    const SWITCHTABLESIZE = 2;
    let random = Math.floor(Math.random() * SWITCHTABLESIZE)
    let savedRandomNamedColour = randomNamedColor();
    if (seed) {
        random = seed;
    }
    do {
        distance += Math.random() * (MaxSpacing - minSpacing) + minSpacing;
        angle += rotSpacing;
        switch (random) {
            case 0:
                walls.push(new Wall(distance, angle, rotSpeed, null, randomNamedColor(), shape))
                break;
            default:
                walls.push(new Wall(distance, angle, rotSpeed, null, randomColourSimilarToNamedColor(savedRandomNamedColour,25,25,25), shape))
                break;
        }

    } while (distance < maxDistance)
    return walls
}
