import {COLOUR_MAP, COLOURS} from "./config.js";

export class linkedList{
    constructor(element) {
        this.element = element;
        this.next = null;

    }

    put(element){
        const comparator = element.comparator;
        if(!this.element){
            this.element = element;
        }
        //comparator returns true if the new element should replace the current element
        else if(comparator != null && comparator(element,this.element)){
            //replace the current element, put the existing element to the next one
            if(comparator(element,this.element)){
                if(!this.next){
                    this.next = new linkedList(this.element)
                    this.element = element;
                }
                else {
                    this.next.put(this.element,comparator);
                    this.element = element;
                }
            }
            //put the new element to the next one
            else {
                if(!this.next){
                    this.next = new linkedList(element)
                }
                else {
                    this.next.put(element,comparator);
                }
            }

        }
        //no comparator, just add to the end
        else {
            if(!this.next){
                this.next = new linkedList(element)
            }
            else {
                this.next.put(element,comparator);
            }
        }
    }
    get(){
        return this.element
    }
    getNext(){
        return this.next
    }

    forEach(func){
        if(!this.element) return;
        func(this.element);
        if(this.next){
            this.next.forEach(func);
        }
    }

}

export function randomNamedColor() {
    const colors = COLOURS;
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}

// /**
//  * Converts named colors to their RGB values.
//  * Adjusts RGB values slightly based on input randomization ranges (rRand, gRand, bRand).
//  * Returns the new color in "rgb(r, g, b)" format.
//  */
// export function randomColourSimilarToNamedColor(namedColor, rRand, gRand, bRand) {
//     // Helper function to map named colors to RGB values
//     function namedColorToRGB(color) {
//         return COLOUR_MAP[color.toLowerCase()] || [0, 0, 0]; // Defaults to black if color not recognized
//     }
//
//     const [r, g, b] = namedColorToRGB(namedColor);
//     // Add randomness to each RGB component
//     const randomize = (value, maxRand) => Math.max(0, Math.min(255, value + Math.floor(Math.random() * maxRand * 2) - maxRand));
//     const newR = randomize(r, rRand);
//     const newG = randomize(g, gRand);
//     const newB = randomize(b, bRand);
//     return `rgb(${newR}, ${newG}, ${newB})`;
// }
