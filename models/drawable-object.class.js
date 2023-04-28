class DrawableObject { //super class for all objects that can be drawn on the canvas
    x;
    y;
    imageCache = {};
    currentImage = 0;
    img;


    loadImage(path) { //sets new image
        this.img = new Image(); //this.img = document.createElement('img');
        this.img.src = path;
    }


    loadImages(arr) { //loads images from array
        arr.forEach(path => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img; //key value pair
        });
    }


    draw(ctx) {
        try {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        } catch (e) { //if image cannot be found
            console.warn("draw(ctx): " + e);
            console.warn(this.img);
            debugger;
        }
    }

    //conditionals
    isInstanceOfThrowableObject() { //coin or poison
        return this instanceof ThrowableObject;
    }


    isInstanceOfPufferFish() {
        return this instanceof PufferFish;
    }


    isInstanceOfEntity() {
        return this instanceof Character || this instanceof PufferFish ||
            this instanceof JellyFish || this instanceof SuperJellyFish ||
            this instanceof Endboss;
    }


    returnConstructorName(enemy) {
        if (enemy) {
            return enemy.constructor.name;
        }
        return this.constructor.name;
    }
}


/*drawFrame(ctx) { //draw hit boxes
    if (this.isInstanceOfEntity()) {
        ctx.beginPath();
        ctx.lineWidth = '0.5';
        ctx.strokeStyle = 'red';
        ctx.rect(this.x, this.y, this.width, this.height);
    }
    ctx.stroke();
}*/