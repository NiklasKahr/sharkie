class PufferFish extends MovableObject {
    height = 52;
    width = 62;
    speed = 3;
    transitioning;
    inflatedSwimming;
    isInflated;
    isHitFromLeft;
    offset = {
        top: 0,
        bottom: -5,
        left: -6,
        right: -3
    }


    constructor(color, x, y, characterX, isRandomized) {
        super().loadImage(PF_IMAGES_SWIMMING[color][0]);
        this.loadImages(PF_IMAGES_SWIMMING[color]);
        this.loadImages(PF_IMAGES_TRANSITIONING[color]);
        this.loadImages(PF_IMAGES_INFLATED_SWIMMING[color]);
        this.loadImages(PF_IMAGES_DYING[color]);
        this.color = color;
        this.x = x;
        this.y = y;
        this.isRandomized = isRandomized;
        this.animate();
        this.handleSpawn(characterX);
        this.checkLeavingMap();
    }


    animate() {
        this.swimming = setInterval(() => {
            this.playAnimation(PF_IMAGES_SWIMMING[this.color]);
        }, 1000 / 6);
    }


    move() { //executed in MovableObject
        this.moving = setInterval(() => {
            this.moveLeft();
        }, 1000 / 30);
    }


    startInflatedSwimming() { //executed in world.collidingPufferfish() if character collides with PufferFish object
        this.isInflated = true;
        this.initiateInflation();
        this.initiateInflatedSwimming();
    }


    initiateInflation() {
        clearInterval(this.swimming);
        this.i = 0;
        this.currentImage = 0;
        this.transitioning = setInterval(() => {
            this.playAnimation(PF_IMAGES_TRANSITIONING[this.color]);
            this.i++;
        }, 1000 / 6);
    }


    initiateInflatedSwimming() {
        this.inflatedSwimming = setInterval(() => {
            if (this.i > 4) {  //if PF_IMAGES_TRANSITIONING was played once
                clearInterval(this.transitioning);
                this.playAnimation(PF_IMAGES_INFLATED_SWIMMING[this.color]);
                this.i++;
                if (this.i > 9 && !this.isColliding(world.character)) {  //if PF_IMAGES_INFLATED_SWIMMING was played once
                    clearInterval(this.inflatedSwimming);
                    this.currentImage = 0;
                    this.resetAnimation();
                }
            }
        }, 1000 / 6);
    }


    resetAnimation() {
        const reverseTransitioning = setInterval(() => {
            this.playReverseAnimation(PF_IMAGES_TRANSITIONING[this.color]);
            this.i++
            if (this.i > 14) { //if PF_IMAGES_TRANSITIONING was played in reverse once
                clearInterval(reverseTransitioning);
                this.animate();
                this.isInflated = false;
            }
        }, 1000 / 6);
    }


    dies() { //object has been slapped by character
        let i = 0
        this.currentImage = 0;
        this.clearAllIntervals();
        const dying = setInterval(() => {
            this.playAnimation(PF_IMAGES_DYING[this.color]);
            i++;
            if (i > 2) { //if IMAGES_DYING was played once
                clearInterval(dying);
            }
        }, 1000 / 14);
        this.leaveMap();
    }


    leaveMap() { //moves object out of map and splices it
        const movingOutOfMap = setInterval(() => {
            if (this.isHitFromLeft) { this.x -= 21; }
            else { this.x += 21; }
            this.y += 12;
            if (this.isOutOfMap()) {
                clearInterval(movingOutOfMap);
            }
        }, 1000 / 30);
    }


    clearAllIntervals() {
        clearInterval(this.swimming);
        clearInterval(this.moving);
        clearInterval(this.transitioning);
        clearInterval(this.inflatedSwimming);
        clearInterval(this.reverseTransitioning);
    }
}