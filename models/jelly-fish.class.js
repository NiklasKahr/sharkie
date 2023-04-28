class JellyFish extends MovableObject {
    width = 65;
    height = 75;
    speed = 2;
    offset = {
        top: 0,
        bottom: -2.5,
        left: 2.5,
        right: 2.5
    }


    constructor(color, x, y, backAndForth, direction) {
        super().loadImage(JF_IMAGES_SWIMMING[color][0]);
        this.loadImages(JF_IMAGES_SWIMMING[color]);
        this.loadImages(JF_IMAGES_DYING[color]);
        this.color = color;
        this.direction = direction;
        this.x = x;
        this.y = y;
        this.animate();
        if (backAndForth) { //moves 400px into given direction and vice versa
            this.moveBackAndForth();
        }
        this.checkLeavingMap();
    }


    animate() {
        this.swimming = setInterval(() => {
            this.playAnimation(JF_IMAGES_SWIMMING[this.color]);
        }, 1000 / 6);
    }
}
