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


export const COLOURS =["red", "green", "blue", "yellow", "purple", "orange"];
export const COLOUR_PALETTE = {
    "red":{
        lineColour: "white",
        lineColour2: "black",
        fillColour: "Crimson",
        fillColour2: "FireBrick",
    },
    "green":{
        lineColour: "white",
        lineColour2: "black",
        fillColour: "ForestGreen",
        fillColour2: "DarkGreen",
    },
    "blue":{
        lineColour: "white",
        lineColour2: "black",
        fillColour: "SteelBlue",
        fillColour2: "RoyalBlue",
    },
    "yellow":{
        lineColour: "white",
        lineColour2: "black",
        fillColour: "Yellow",
        fillColour2: "GoldenRod",
    },
    "purple":{
        lineColour: "white",
        lineColour2: "black",
        fillColour: "Purple",
        fillColour2: "DarkViolet",
    },
    "orange":{
        lineColour: "white",
        lineColour2: "black",
        fillColour: "OrangeRed",
        fillColour2: "DarkOrange",
    }
}