import Wall from "./wall.js";

export default class Obstacle extends Wall{
    constructor(distance, angle, rotSpeed, imgName,colour,shape,coins) {
        super(distance, angle, rotSpeed, imgName, colour,shape);
        this.coins = coins;
        this.comparator = comparatorForLinkedList
    }

}
function comparatorForLinkedList (elementToAdd, existingElement) {
    return elementToAdd.distance > existingElement.distance;
}


