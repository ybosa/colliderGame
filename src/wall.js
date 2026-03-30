export default class Wall {
    constructor(distance, angle, rotSpeed, imgName,colour,shape) {
        this.distance = distance;
        this.angle = angle;
        this.rotSpeed = rotSpeed;
        this.imgName = imgName;
        this.colour = colour;
        this.comparator = comparatorForLinkedList
    }

}
function comparatorForLinkedList (elementToAdd, existingElement) {
    return elementToAdd.distance < existingElement.distance;
}


const SHAPES = {
    SQUARE: "square",
    CIRCLE: "circle",
}


