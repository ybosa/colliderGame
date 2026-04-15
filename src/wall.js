import {randomNamedColor} from "./utils.js";

export default class Wall {
    constructor(distance, angle, rotSpeed,colour,style) {
        this.distance = distance;
        this.angle = angle;
        this.rotSpeed = rotSpeed;
        this.colour = colour;
        this.style = style;

        if(!this.style) this.style = pickRandomStyle()
    }

    comparator(elementToAdd, existingElement) {
        return elementToAdd.distance < existingElement.distance; //front to back rendering
    }

}


export const STYLES = {
    SOLID: "solid",
    EqualAlternating12: "EqualAlternating12",
    EqualAlternating6: "EqualAlternating6",
}

export const pickRandomStyle = () => STYLES[Object.keys(STYLES)[Math.floor(Math.random() * Object.keys(STYLES).length)]]