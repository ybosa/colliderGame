export default class Wall {
    constructor(distance, angle, rotSpeed, imgName,colour) {
        this.distance = distance;
        this.angle = angle;
        this.rotSpeed = rotSpeed;
        this.imgName = imgName;
        this.colour = colour;
    }

}
export  function comparatorForLinkedList (elementToAdd, existingElement) {
    return elementToAdd.distance < existingElement.distance;
}


