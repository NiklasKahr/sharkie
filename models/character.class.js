class Character extends MovableObject {
    x = 0;
    y = 130;
    height = 180;
    width = 210;
    speed = 4;
    offset = {
        top: 107,
        bottom: 60,
        left: 58,
        right: 56
    }
    world; //reference to the world object
    swimming_sound = new Audio('audio/swim.mp3');
    slapping_sound = new Audio('audio/slap.mp3');
    throwing_bubble_sound = new Audio('audio/throw_bubble.mp3');
    throwing_poison_sound = new Audio('audio/throw_poison.mp3');
    hurting_sound = new Audio('audio/hurt.mp3');
    shocking_sound = new Audio('audio/shock.mp3');
    isIdlingLong;
    isShocked;
    isPreparingAttack;
    hasShockDeath;


    constructor() {
        super().loadAllImages();
        this.applyGravity();
        this.animate();
        this.move()
        this.lastAction = 0;
    }


    loadAllImages() {
        this.loadStatusImages();
        this.loadAttackImages();
    }


    animate() {
        setInterval(() => this.animateCharacter(), 1000 / 6);
        setInterval(() => {
            if (!this.isDead()) {
                this.handleAttacks();
            }
        }, 60);
    }


    move() {
        setInterval(() => {
            if (!this.isDead()) {
                this.handleHorizontalMovements();
                this.handleVerticalMovements();
                this.world.camera_x = 200 - this.x;
            }
        }, 1000 / 60);
    }


    handleHorizontalMovements() { //handles arrowLeft, arrowRight, a and d
        if (this.meetsConditionsForMoving('right')) {
            this.moveRight();
            this.swimming_sound.play();
            this.isIdlingLong = false;
            this.headsLeft = false;
        } else if (this.meetsConditionsForMoving('left')) {
            this.moveLeft();
            this.swimming_sound.play();
            this.isIdlingLong = false;
            this.headsLeft = true;
        }
    }


    handleVerticalMovements() { //handles arrowUp, arrowDown, w, s, shift and space
        if (this.meetsConditionsForMoving('up')) {
            this.moveUp();
            this.swimming_sound.play();
            this.isIdlingLong = false;
        } else if (this.meetsConditionsForMoving('down')) {
            this.moveDown();
            this.swimming_sound.play();
            this.isIdlingLong = false;
        }
    }


    handleAttacks() { //handles slapping and throwing (poison) bubbles
        if (this.isPressing('F')) {
            this.handleSlap();
        } else if (this.isPressing('G')) {
            this.handleThrowBubble();
        } else if (this.isPressing('H')) {
            this.handleThrowPoisonBubble();
        }
    }


    handleSlap() {
        this.world.isCharakterSlapping = true; //see MovabeObject.hit(enemy)
        this.executeAttackAnimation('F', CHAR_IMAGES['SLAPPING']);
        this.slapping_sound.play();
        this.isIdlingLong = false;
    }


    handleThrowBubble() {
        this.executeAttackAnimation('G', CHAR_IMAGES['THROWING_BUBBLE']);
        this.throwing_bubble_sound.play();
        this.isIdlingLong = false;
    }


    handleThrowPoisonBubble() {
        if (this.world.collectedPoison > 0) { //poison needs to be collected first
            this.executeAttackAnimation('H', CHAR_IMAGES['THROWING_POISON_BUBBLE']);
            this.throwing_poison_sound.play();
            this.isIdlingLong = false;
        } else { //if no poison is collected, do not throw bubble
            this.executeAttackAnimation('H', CHAR_IMAGES['THROWING_NO_BUBBLE']);
            this.isIdlingLong = false;
        }
    }


    animateCharacter() { //responsible for most character animations
        if (this.isDead() && !this.hasStartedDeathAnimation) {
            this.animateDeath();
            this.isIdlingLong = false;
        } else if (this.isHurt() && !this.isDead() && !this.isPreparingAttack) {
            this.animateDamage();
            this.isIdlingLong = false;
        } else if (this.isMoving() && !this.isPreparingAttack) {
            this.playAnimation(CHAR_IMAGES['SWIMMING']); //moving animation
            this.lastAction = 0;
        } else if (!this.hasStartedDeathAnimation) {
            this.animateIdling();
        }
    }


    animateDeath() { //different animation depending on whether the character is shocked or not
        this.hasStartedDeathAnimation = true;
        if (this.hasShockDeath) {
            this.playAnimationOnce(CHAR_IMAGES['DYING_SHOCKED'], CHAR_IMAGES['DYING_SHOCKED'].length - 1);
        } else {
            this.playAnimationOnce(CHAR_IMAGES['DYING'], CHAR_IMAGES['DYING'].length - 1);
        }
    }


    animateDamage() { //different animation depending on whether the character is shocked or not
        if (this.isShocked) {
            this.shocking_sound.play();
            this.playAnimation(CHAR_IMAGES['SHOCKED']);
        } else {
            this.hurting_sound.play();
            this.playAnimation(CHAR_IMAGES['HURTING']);
        }
        this.lastAction = 0;
    }


    executeAttackAnimation(key, images) { //handles attack duration
        this.holdKey(key);
        this.playAnimation(images);
        this.isPreparingAttack = true;
        this.lastAction = 0;
    }


    holdKey(key) { //presses key for 500ms
        if (!this.isPreparingAttack) {
            this.currentImage = 0; //necessary to start animation from the beginning
            let pressKey = setInterval(() => {
                this.world.keyboard[key] = true;
            }, 100);
            setTimeout(() => {
                this.releaseKey(pressKey, key);
            }, 500);
        }
    }


    releaseKey(pressKey, key) { //releases key after 500ms
        clearInterval(pressKey);
        this.world.keyboard[key] = false;
        this.isPreparingAttack = false;
        if (key == 'F') {
            this.world.isCharakterSlapping = false;
        }
    }


    animateIdling() { //handles idling/sleeping animations
        if (this.isLastActionEqualZero()) {
            this.lastAction = new Date().getTime();
        } else if (this.hasBeenIdlingLong()) {
            this.isIdlingLong = true
            //begins long idling/sleep animation
            this.playAnimationOnce(CHAR_IMAGES['LONG_IDLING'], CHAR_IMAGES['LONG_IDLING'].length - 1, CHAR_IMAGES['SLEEPING']);
        } else if (!this.isIdlingLong) {
            this.playAnimation(CHAR_IMAGES['IDLING']);
        }
    }


    loadStatusImages() {
        this.loadImage(CHAR_IMAGES['IDLING'][0]);
        this.loadImages(CHAR_IMAGES['IDLING']);
        this.loadImages(CHAR_IMAGES['LONG_IDLING']);
        this.loadImages(CHAR_IMAGES['SWIMMING']);
        this.loadImages(CHAR_IMAGES['HURTING']);
        this.loadImages(CHAR_IMAGES['SHOCKED']);
        this.loadImages(CHAR_IMAGES['DYING']);
        this.loadImages(CHAR_IMAGES['DYING_SHOCKED']);
    }


    loadAttackImages() {
        this.loadImages(CHAR_IMAGES['SLAPPING']);
        this.loadImages(CHAR_IMAGES['THROWING_BUBBLE']);
        this.loadImages(CHAR_IMAGES['THROWING_POISON_BUBBLE']);
        this.loadImages(CHAR_IMAGES['THROWING_NO_BUBBLE']);
    }

    //conditionals
    isPressing(key) { //user is pressing key
        return this.world.keyboard[key];
    }


    isMoving() { //character is currently moving and not dead
        return (this.world.keyboard.RIGHT || this.world.keyboard.LEFT ||
            this.world.keyboard.UP || this.world.keyboard.DOWN) && !this.isDead();
    }


    isLastActionEqualZero() { //character is currently moving, attacking or being damaged
        return this.lastAction == 0;
    }


    hasBeenIdlingLong() { //character has been idling for 8 seconds
        return new Date().getTime() - this.lastAction > 8000 && !this.isIdlingLong;
    }


    meetsConditionsForMoving(direction) { //returns true if character is allowed to move in specified direction
        switch (direction) {
            case 'up':
                return this.world.keyboard.UP && this.y > -50
            case 'right':
                return this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x;
            case 'down':
                return this.world.keyboard.DOWN && this.isAboveGround()
            case 'left':
                return this.world.keyboard.LEFT && this.x > -1
            default:
                console.log("character.meetsConditionsForMoving(direction): specified direction unrecognized");
                break;
        }
    }
}