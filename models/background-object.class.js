class BackgroundObject extends MovableObject { //background objects like sand, rocks, etc.
    width = 720;
    height = 480;

    
    constructor(path, x) {
        super().loadImage(path);
        this.x = x;
        this.y = 480 - this.height;
    }
}