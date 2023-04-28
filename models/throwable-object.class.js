class ThrowableObject extends MovableObject { //bubbles that can be thrown by the character
    type;
    speedX = 12;
    acceleration = 2;
    offset = {
        top: 12,
        bottom: 12,
        left: 12,
        right: 12
    }


    constructor(TYPE, x, y) {
        super().type = TYPE;
        if (this.type === 'bubble') {
            this.loadImage('img/1.Sharkie/4.Attack/Bubble trap/Bubble.png');
        } else if (this.type === 'poisonBubble') {
            this.loadImage('img/1.Sharkie/4.Attack/Bubble trap/Poisoned Bubble (for whale).png');
        }
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.throw();
    }


    throw() { //throws bubble depending on the direction faced by the character
        if (world.character.headsLeft) {
            this.throwToTheLeft();
        } else {
            this.throwToTheRight();
        }
    }


    throwToTheLeft() {
        this.x -= 125;
        setInterval(() => {
            this.x -= this.speedX;
            if (this.speedX > 6) { //decrease speed until it reaches 6
                this.speedX -= this.acceleration;
            }
        }, 1000 / 60);
    }


    throwToTheRight() {
        setInterval(() => {
            this.x += this.speedX;
            if (this.speedX > 6) { //decrease speed until it reaches 6
                this.speedX -= this.acceleration;
            }
        }, 1000 / 60);
    }
}