import {randomNamedColor} from "./utils.js";
import {SHAPES} from "./config.js";

export default class Wall {
    constructor(distance, angle, rotSpeed, imgName,colour,style,shape) {
        this.distance = distance;
        this.angle = angle;
        this.rotSpeed = rotSpeed;
        this.imgName = imgName;
        this.colour = colour;
        this.style = style;
        this.shape = shape;

        if(!this.style) this.style = pickRandomStyle()
        if(!this.shape) this.shape = SHAPES.CIRCLE;
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
    while (distance < maxDistance) {
        distance += Math.random() * (MaxSpacing - minSpacing) + minSpacing;
        angle += rotSpacing;
        switch (random) {
            case 0:
                walls.push(new Wall(distance, angle, rotSpeed, null, randomNamedColor(),pickRandomStyle(),  shape))
                break;
            default:
                walls.push(new Wall(distance, angle, rotSpeed, null, randomNamedColor(),pickRandomStyle(), shape))
                break;
        }

    }
    return walls
}

export const STYLES = {
    SOLID: "solid",
    EqualAlternating12: "EqualAlternating12",
    EqualAlternating6: "EqualAlternating6",
}

export const pickRandomStyle = () => STYLES[Object.keys(STYLES)[Math.floor(Math.random() * Object.keys(STYLES).length)]]