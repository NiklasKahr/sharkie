class MovableObject extends DrawableObject { //super class for character, enemies and throwable objects
    speed = 2;
    speedY = 0.75;
    health = 100;
    lastHit = 0;
    width = 45;
    height = 45;
    i = 0;
    count = 0;
    originalSpeed;
    lastAction;
    headsLeft;
    color;
    direction;
    directionY = 1;
    leftEnd;
    rightEnd;
    // ------ intervals ------
    moving;
    swimming;
    sleeping;
    animatingOnce;
    // ------ booleans ------
    isCorrectingUpwards;
    isCorrectingDownwards;
    isPlayingSleepAnimation;
    isPlayingAttackAnimation;
    isRandomized;
    isDefeated;
    isEndbossDefeated;
    hasDecreasedSpeed;
    hasIncreasedSpeed;
    hasStartedDeathAnimation;
    hasDecreasedSpeed;
    hasChangedDirection;
    pufferFishLimit = { value: null };
    offset = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    }


    applyGravity() { //lets character sink
        setInterval(() => {
            if (this.meetsConditionsForGravity()) {
                this.y += this.speedY;
            }
        }, 1000 / 60);
    }


    playAnimation(images) { //main ainimation function
        let i = this.currentImage % images.length; //prevents index out of bounds
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }


    playReverseAnimation(images) { //used by PufferFish object
        let i;
        if (this.currentImage > 0) {
            i = (this.currentImage - 1) % images.length;
        } else {
            i = images.length - 1;
        }
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImage = i;
    }


    playAnimationOnce(images, numberOfImages, characterSleepAnimation) { //optional third parameter
        this.i = 0;
        this.currentImage = 0;
        this.animatingOnce = setInterval(() => {
            this.playAnimation(images);
            this.i++;
            if (this.i > numberOfImages) { //stop if all images have been played
                clearInterval(this.animatingOnce);
                this.handleSleepAnimation(characterSleepAnimation); //relevant if third parameter was passed
                if (this.isEndbossAttackAnimation(images)) { //relevant if executed by Endboss.randomizeAttacks()
                    this.isPlayingAttackAnimation = false;
                }
            }
        }, 1000 / 6);
    }


    handleSleepAnimation(characterSleepAnimation) {
        if (characterSleepAnimation && !this.isPlayingSleepAnimation) {
            this.isPlayingSleepAnimation = true;
            this.playSleepAnimation(characterSleepAnimation);
            this.monitorSleepAnimation();
        }
    }


    playSleepAnimation(characterSleepAnimation) { //repeat sleep animation
        this.currentImage = 0;
        this.sleeping = setInterval(() => {
            this.playAnimation(characterSleepAnimation);
        }, 1000 / 4);
    }


    monitorSleepAnimation() { //enable cancellation of sleep animation
        setInterval(() => {
            if (this.isSleepInterrupted()) {
                clearInterval(this.animatingOnce);
                clearInterval(this.sleeping);
                this.isPlayingSleepAnimation = false;
            }
        }, 1000 / 30);
    }


    isHurt() { //responsible for hurting animation duration
        let timePassed = new Date().getTime() - this.lastHit; //milliseconds passed since last hit
        timePassed = timePassed / 1000; //seconds
        return timePassed < 0.48;
    }


    hit(enemy) { //decide damage dealt to character
        this.isShocked = false;
        if (this.isEnemyEndboss(enemy) && !world.isCharakterSlapping && !enemy.isDefeated) {
            this.deductDamage(1);
        } else if (this.isEnemySuperJellyFish(enemy) && !enemy.isDefeated) {
            this.isShocked = true; //causes shock animation to be played
            this.deductDamage(0.75);
            if (this.isDead()) { this.hasShockDeath = true; } //causes shock death animation to be played
        } else if (this.isEnemyPufferFish(enemy) && !world.isCharakterSlapping && !enemy.isDefeated) {
            this.deductDamage(0.125);
        } else if (this.isEnemyJellyFish(enemy) && !enemy.isDefeated) {
            this.deductDamage(0.25);
        }
    }


    moveZigZag() { //causes enemy to move up and down in a zig-zag pattern
        const intervalDuration = this.getIntervallDuration();
        this.moving = setInterval(() => {
            this.x -= this.speed;
            this.count++;
            this.handleDecreasedSpeed();
            this.handleLimitOfCount();
            this.y += this.directionY * this.speed * 0.5;
            this.handleEndOfCanvas();
        }, intervalDuration);
    }


    moveRight() {
        this.x += this.speed;
    }


    moveLeft() {
        this.x -= this.speed;
    }


    moveUp() {
        this.y -= this.speed; //mirrored y-axis
    }


    moveDown() {
        this.y += this.speed; //mirrored y-axis
    }


    handleDecreasedSpeed() { //decrease speed before changing direction (more realistic movement)
        if (this.hasCountAlmostReachedLimit(this.count) || this.isNearingEndOfCanvas()) {
            if (!this.hasDecreasedSpeed) {
                this.hasDecreasedSpeed = true;
                this.originalSpeed = this.speed;
                this.speed *= 0.75;
            }
        }
    }


    handleLimitOfCount() {
        //reverse direction if 500ms (Endboss) have passed or by chance (PufferFish)
        if (this.hasCountReachedLimit(this.count) && !this.isNearingEndOfCanvas()) {
            this.count = 0;
            this.directionY = -this.directionY;
            setTimeout(() => { //restore original speed
                this.speed = this.originalSpeed;
                this.hasDecreasedSpeed = false;
            }, 200);
        }
    }


    handleEndOfCanvas() { //reverse direction if hitting top or bottom
        if (this.isNearingEndOfCanvas() && !this.hasChangedDirection) {
            this.hasChangedDirection = true;
            this.directionY = -this.directionY;
            setTimeout(() => { //restore original speed
                this.speed = this.originalSpeed;
                this.hasDecreasedSpeed = false;
                this.hasChangedDirection = false;
            }, 200);
        }
    }


    randomizePlacement(minX, minY) {
        this.x = minX + minX * 0.1 * Math.random(); //minX (inclusive) to minX * 1.1 (exclusive)
        this.y = minY + minY * 0.08 * Math.random(); //minY (inclusive) to minY * 1.08 (exclusive)
    }


    randomizeMovements() {
        if (this.color.includes("RED")) {
            this.moveZigZag();
        } else {
            this.move();
        }
        this.speed = 2.75 + 1.75 * Math.random(); //sets initial speed between 2.75 (inclusive) and 4.5 (exclusive)
        this.startInteracting();
        this.startRandomizing();
    }


    startInteracting() {
        const interacting = setInterval(() => {
            if (this.isDefeated) {
                clearInterval(interacting);
                clearInterval(this.moving);
            }
            this.interactWithOther();
        }, 300);
    }


    startRandomizing() {
        const randomizing = setInterval(() => {
            if (!this.isInteractingOnXAxis()) {
                this.speed = 2.75 + 1.75 * Math.random(); //sets initial speed between 2.75 (inclusive) and 4.5 (exclusive)
            } else if (this.isDefeated) {
                clearInterval(randomizing);
            }
        }, 2000 + Math.random() * 1500); //change speed every 2 (inclusive) to 3.5 seconds (exclusive)
    }


    interactWithOther() { //adjust movement based on the other enemy's position
        world.level.enemies.forEach(enemy => {
            if (this.isComingNearAnother(enemy)) { //if two enemies within a certain distance
                this.interactOnXAxis(enemy);
                this.interactOnYAxis(enemy);
            }
        });
    }


    interactOnXAxis(enemy) { //causes object to go faster or slower
        if (this.meetsConditionsAcceleration(enemy)) {
            this.increaseSpeed(enemy);
        } else if (this.meetsConditionsDeceleration(enemy)) {
            this.decreaseSpeed(enemy);
        }
    }


    interactOnYAxis(enemy) { //causes object to go up or down
        if (this.meetsConditionsUp(enemy)) { //+=: this.isAboveGround(), -=: this.y > 40
            this.correctUpwards(enemy);
        } else if (this.meetsConditionsDown(enemy)) { //-=:this.y > 40, +=:this.isAboveGround()
            this.correctDownwards(enemy);
        }
    }


    increaseSpeed(enemy) {
        this.hasIncreasedSpeed = true;
        const monitoring = setInterval(() => {
            if (this.hasDrawnAwayFrom(enemy, 65)) {
                clearInterval(monitoring);
                this.hasIncreasedSpeed = false;
            }
        }, 1000 / 30);
        this.speed *= 1.2;
    }


    decreaseSpeed(enemy) {
        this.hasDecreasedSpeed = true;
        const monitoring = setInterval(() => {
            if (this.hasDrawnAwayFrom(enemy, 65)) {
                clearInterval(monitoring);
                this.hasDecreasedSpeed = false;
            }
        }, 1000 / 30);
        this.speed *= 0.7;
    }


    correctUpwards(enemy) {
        this.isCorrectingUpwards = true;
        const correctingUpwards = setInterval(() => {
            if (this.hasDrawnAwayFrom(enemy, 65)) {
                clearInterval(correctingUpwards);
                this.isCorrectingUpwards = false; //y- equals upwards (mirrored y-axis)
            }
            if (this.isEnemyPufferFish(enemy)) {
                this.y -= this.speed * 0.5; //+= for more movement, but less realistic
            } else {
                this.y -= this.speed * 0.75;
            }
        }, 1000 / 30);
    }


    correctDownwards(enemy) {
        this.isCorrectingDownwards = true;
        const movingAway = setInterval(() => {
            if (this.hasDrawnAwayFrom(enemy, 65)) {
                clearInterval(movingAway);
                this.isCorrectingDownwards = false; //y+ equals downwards (mirrored y-axis)
            }
            if (this.isEnemyPufferFish(enemy)) {
                this.y += this.speed * 0.25;  //-= for more movement, but less realistic
            } else {
                this.y += this.speed * 0.5;
            }
        }, 1000 / 30);
    }


    distanceBetween(enemy1, enemy2) { //calculate the distance between two enemies
        const dx = enemy1.x - enemy2.x;
        const dy = enemy1.y - enemy2.y;
        return Math.sqrt(dx * dx + dy * dy); //pythagorean theorem
    }


    handleSpawn(characterX) { //spawns enemy once character reaches certain point, parameter optional
        try {
            setTimeout(() => { //world not yet defined to this point
                const spawning = setInterval(() => {
                    if (this.isCharacterInPlace(characterX)) {
                        this.release(spawning);
                    } else if (!characterX) {
                        this.release(spawning);
                    }
                }, 100);
            }, 1250);
        } catch (e) { //for the event in which world is not defined
            this.handleSpawn(characterX);
            console.warn(e);
        }
    }


    release(spawning) { //releases enemy from spawn point
        clearInterval(spawning);
        this.startMovement();
    }


    getIntervallDuration() { //returns duration of movement interval
        if (this instanceof Endboss) {
            return 1000 / 60;
        } else {
            return 1000 / 30;
        }
    }


    startMovement() { //executed once enemy is spawned
        if (this.isRandomized) {
            this.randomizePlacement(this.x, this.y);
            this.randomizeMovements();
        } else {
            this.move();
            const interacting = setInterval(() => {
                if (this.isDefeated) {
                    clearInterval(interacting);
                    clearInterval(this.moving);
                }
                this.interactWithOther();
            }, 300);
        }
    }


    deductDamage(dmg) { //deduct damage from either character or endboss
        if (this.health > 0) {
            this.health -= dmg;
            if (this instanceof Endboss) {
                console.log('Endboss slap');
                setTimeout(() => this.lastHit = new Date().getTime(), 220); //delay hurting animating until slap actually hits endboss
            } else {
                this.lastHit = new Date().getTime();
            }
        }
    }


    checkLeavingMap() { //check if object is out of map and splices it
        const checkLeavingMap = setInterval(() => {
            if (this.isOutOfMap()) {
                const index = world.level.enemies.indexOf(this);
                world.level.enemies.splice(index, 1);
                clearInterval(checkLeavingMap);
            }
        }, 1000 / 30);
    }

    //(Super)JellyFish
    moveBackAndForth() {
        this.setEnds();
        if (this.direction == 'right') {
            this.moveLeftToRight()
        } else if (this.direction == 'left') {
            this.moveRightToLeft();
        }
    }


    setEnds() { //define beginning and ending of movement
        if (this.direction == 'right') {
            this.leftEnd = this.x;
            this.rightEnd = this.x + 400;
        } else if (this.direction == 'left') {
            this.leftEnd = this.x - 400;
            this.rightEnd = this.x;
        }
    }


    moveLeftToRight() {
        this.movingRight = setInterval(() => {
            this.moveRight();
            if (this.x >= this.rightEnd) {
                clearInterval(this.movingRight);
                this.moveRightToLeft();
            }
        }, 1000 / 30);
    }


    moveRightToLeft() {
        this.movingLeft = setInterval(() => {
            this.moveLeft();
            if (this.x <= this.leftEnd) {
                clearInterval(this.movingLeft);
                this.moveLeftToRight();
            }
        }, 1000 / 30);
    }


    startDeathAnimation() { //JellyFish death animation
        this.isDefeated = true;
        let IMAGES_DYING = this.setImages();
        clearInterval(this.swimming); clearInterval(this.moving);
        setInterval(() => {
            this.playAnimation(IMAGES_DYING[this.color]);
        }, 1000 / 6);
    }


    setImages() {
        if (this instanceof JellyFish) {
            return JF_IMAGES_DYING;
        } else if (this instanceof SuperJellyFish) {
            return SJF_IMAGES_DYING;
        }
    }


    moveOutOfMap() { //moves JellyFish upwards and splices enemy from array
        const movingOutOfMap = setInterval(() => {
            this.y -= this.speed;
            if (this.isOutOfMap()) {
                clearInterval(movingOutOfMap);
            }
        }, 1000 / 60);
    }

    //conditionals
    isAboveGround() { //character's lower end of map
        return this.y < 310;
    }


    isNearingEndOfCanvas() { //enemie's higher and lower end of map
        if (this instanceof Endboss) {
            return this.y > canvas.height - this.height || this.y < 0;
        } else {
            return this.y < 0 || this.y >= 410;
        }
    }


    isInteractingOnXAxis() {
        return this.hasIncreasedSpeed || this.hasDecreasedSpeed;
    }


    isColliding(mo) {
        return this.x + this.width - this.offset.right > mo.x + mo.offset.left &&
            this.y + this.height - this.offset.bottom > mo.y + mo.offset.top &&
            this.x + this.offset.left < mo.x + mo.width - mo.offset.right &&
            this.y + this.offset.top < mo.y + mo.height - mo.offset.bottom;
    }


    isOutOfMap() { //if object left the map and is no longer visible
        return this.x < -275 || this.y < -70 || this.y > 480;
    }


    isEnemyEndboss(enemy) {
        return this.returnConstructorName(enemy) == 'Endboss'
    }


    isEnemySuperJellyFish(enemy) {
        return this.returnConstructorName(enemy) == 'SuperJellyFish';
    }


    isEnemyJellyFish(enemy) {
        return this.returnConstructorName(enemy) == 'JellyFish';
    }


    isEnemyPufferFish(enemy) {
        return this.returnConstructorName(enemy) == 'PufferFish';
    }


    isDead() {
        return this.health <= 0;
    }


    isCharacterInPlace(characterX) { //used to check if enemy is allowed to move
        return world.character.x > characterX;
    }


    isSleepInterrupted() { //any situation that causes character to wake up
        return this.isPressingAnyKey() || this.isHurt() || this.isDead() || this.hasStartedDeathAnimation;
    }


    isPressingAnyKey() {
        return world.keyboard.UP || world.keyboard.DOWN || world.keyboard.LEFT ||
            world.keyboard.RIGHT || world.keyboard.F || world.keyboard.G || world.keyboard.H;
    }


    isEndbossAttackAnimation(images) {
        return images.includes('img/2.Enemy/3 Final Enemy/Attack/1.png');
    }


    isComingNearAnother(enemy) {
        return enemy !== this && this.distanceBetween(this, enemy) < 50;
    }


    hasDrawnAwayFrom(enemy, distance) { //checks if object has drawn away from nearing object
        return this.distanceBetween(this, enemy) > distance;
    }


    hasCountReachedLimit(count) {
        this.setLimit(this.pufferFishLimit);
        if (this instanceof Endboss) {
            return count >= 30;
        } else if (count >= this.pufferFishLimit.value) {
            this.pufferFishLimit.value = null;
            return true;
        } else {
            return false;
        }
    }


    hasCountAlmostReachedLimit(count) {
        if (this instanceof Endboss) {
            return count >= 25;
        } else if (count >= this.pufferFishLimit.value - 7.5) {
            return true;
        } else {
            return false;
        }
    }


    setLimit(pufferFishLimit) { //determine how long pufferFish will travel in one direction
        if (!pufferFishLimit.value) {
            pufferFishLimit.value = 30 + 40 * Math.random(); //30 (inclusive) to 70 (exclusive)
        }
    }


    meetsConditionsForGravity() {
        return this.isAboveGround() && !world.keyboard.UP; // latter condition prevents bug swimming upwards
    }


    meetsConditionsAcceleration(enemy) { //only slows down if object in front is a PufferFish
        return this.x <= enemy.x && this.isEnemyPufferFish(enemy) && !this.hasIncreasedSpeed;
    }


    meetsConditionsDeceleration(enemy) { //only speeds up if object behind is a PufferFish
        return this.x >= enemy.x && this.isEnemyPufferFish(enemy) && !this.hasDecreasedSpeed;
    }


    meetsConditionsUp(enemy) {
        return this.y <= enemy.y && this.y > 35 && !this.isCorrectingUpwards || this.y >= 410;
    }


    meetsConditionsDown(enemy) {
        return this.y >= enemy.y && this.y < 410 && !this.isCorrectingDownwards || this.y <= 35;
    }
}


/*isColliding(obj) {
    return (this.x + this.width) >= obj.x && this.x <= (obj.x + obj.width) &&
        (this.y + this.offsetY + this.height) >= obj.Y &&
        (this.y + this.offsetY) <= (obj.y + obj.height) && obj.onCollisionCourse;
}*/


/*isAlmostColliding(mo) {
    return this.x + this.width - this.offset.right/1.5 > mo.x + mo.offset.left/1.5 &&
    this.y + this.height - this.offset.bottom > mo.y + mo.offset.top &&
    this.x + this.offset.left/1.5 < mo.x + mo.width - mo.offset.right/1.5 &&
    this.y + this.offset.top < mo.y + mo.height - mo.offset.bottom;
}*/