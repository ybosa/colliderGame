export class linkedList{
    constructor(element) {
        this.element = element;
        this.next = null;

    }

    put(element,comparator){
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