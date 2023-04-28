class World {
    canvas;
    ctx;
    keyboard;
    level = level1;
    camera_x = 0;
    character;
    statusBarHealth = new StatusBar('HEALTH', 100, 10); //percentage, y
    statusBarPoison = new StatusBar('POISON', 0, 48);
    statusBarCoins = new StatusBar('COINS', 0, 86);
    winning_sound = new Audio('audio/win.mp3');
    loosing_sound = new Audio('audio/lose.mp3');
    throwableObjects = [];
    collectedCoins = 0;
    relativeCollectedCoins;
    collectedPoison = 0;
    relativeCollectedPoison;
    coin_sound = new Audio('audio/coin.mp3');
    poison_sound = new Audio('audio/poison.mp3');
    isGameRunning = true;
    isThrowingObject;
    isCharakterSlapping
    isEjectingJellyFish;
    isEjectingSuperJellyFish;
    hadEndbossEncounter;


    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.character = new Character();
        this.setWorld();
        this.run();
        this.draw();
        this.setVolume();
    }


    setWorld() { //set world reference to character object
        this.character.world = this;
    }


    run() { //set fundamental intervals for the game
        setInterval(() => {
            this.checkCollisions();
            this.checkThrowObjects();
            this.checkGameStatus();
        }, 1000 / 60)
    }


    checkCollisions() { //check for collisions between character/bubbles and enemies
        this.collidingPufferfish();
        this.slappingEnemy();
        this.collidingChest();
        this.collidingCollectable();
        this.collidingThrowableObject();
    }


    checkThrowObjects() { //check if bubbles have been thrown
        if (this.meetsConditionsForThrowingBubble()) {
            this.isThrowingObject = true;
            this.handleBubble();
        } else if (this.meetsConditionsForThrowingPoisonBubble()) {
            this.isThrowingObject = true;
            this.handlePoisonBubble();
        }
    }


    handleBubble() { //handle spawn of normal bubble
        setTimeout(() => {
            let bubble = new ThrowableObject('bubble', this.character.x + 150, this.character.y + 90);
            this.throwableObjects.push(bubble);
            setTimeout(() => this.isThrowingObject = false, 100); //prevents spawning multiple bubbles
        }, 400);
    }


    handlePoisonBubble() { //handle spawn of poison bubble
        setTimeout(() => {
            let poisonBubble = new ThrowableObject('poisonBubble', this.character.x + 150, this.character.y + 90);
            this.throwableObjects.push(poisonBubble);
            this.deductPoison();
            setTimeout(() => this.isThrowingObject = false, 100); //prevents spamming
        }, 400);
    }


    checkGameStatus() { //check if either character or endboss is defeated
        if (this.isEndbossDefeated() && this.isGameRunning) {
            this.isGameRunning = false;
            this.clearIntervals();
            this.winning_sound.play();
            showWinScreen();
        } else if (this.isCharacterDefeated() && this.isGameRunning) {
            this.isGameRunning = false;
            setTimeout(() => { //delay to show character death animation
                this.clearIntervals();
                this.loosing_sound.play();
                showLossScreen();
            }, 2500);
        }
    }


    setVolume() { //set volume of game sounds
        setInterval(() => {
            if (isSoundTurnedOn) {
                this.turnSoundOn();
            } else {
                this.turnSoundOff();
            }
        }, 1000 / 6);
    }


    turnSoundOn() { //turn game sounds on
        this.winning_sound.volume = 0.25;
        this.loosing_sound.volume = 0.25;
        this.character.swimming_sound.volume = 0.85;
        this.character.slapping_sound.volume = 0.45;
        this.character.throwing_bubble_sound.volume = 0.4;
        this.character.throwing_poison_sound.volume = 0.3;
        this.character.hurting_sound.volume = 0.04;
        this.character.shocking_sound.volume = 0.07;
        this.coin_sound.volume = 0.25;
        this.poison_sound.volume = 0.1;
        this.level.chests.forEach(chest => {
            chest.chest_sound.volume = 0.4;
        });
    }


    turnSoundOff() { //turn game sounds off
        this.winning_sound.volume = 0;
        this.loosing_sound.volume = 0;
        this.character.swimming_sound.volume = 0;
        this.character.slapping_sound.volume = 0;
        this.character.throwing_bubble_sound.volume = 0;
        this.character.throwing_poison_sound.volume = 0;
        this.character.hurting_sound.volume = 0;
        this.character.shocking_sound.volume = 0;
        this.coin_sound.volume = 0;
        this.poison_sound.volume = 0;
        this.level.chests.forEach(chest => {
            chest.chest_sound.volume = 0;
        });
    }


    draw() { //specify the order in which objects are drawn
        this.clearRectAndTranslate();
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.chests);
        this.addObjectsToMap(this.level.collectableObjects);
        this.renderEnemiesAndCharacter();
        this.ctx.translate(-this.camera_x, 0);
        // ------ begin of space for fixed objects ------
        this.renderBars();
        // ------ end of space for fixed objects ------
        this.ctx.translate(this.camera_x, 0);
        this.renderThrowableObjectsAndTranslate();
        requestAnimationFrame(() => this.draw()); // repetition speed depending on gpu
    }


    addObjectsToMap(objects) {
        objects.forEach(object => {
            this.addToMap(object);
        });
    }


    addToMap(mo) { //draw objects on canvas, mo = MovableObject
        if (mo.headsLeft) {
            this.flipImage(mo);
        }
        mo.draw(this.ctx)
        //mo.drawFrame(this.ctx)
        if (mo.headsLeft) {
            this.flipImageBack(mo)
        }
    }


    flipImage(mo) { //flip image horizontally
        this.ctx.save();
        this.ctx.translate(mo.width, 0)
        this.ctx.scale(-1, 1);
        mo.x = mo.x * -1;
    }


    flipImageBack(mo) { //flip image back to normal
        mo.x = mo.x * -1;
        this.ctx.restore();
    }


    clearRectAndTranslate() { //clear canvas and translate camera
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.translate(this.camera_x, 0);
    }


    renderBars() { //render StatusBar objects
        this.addToMap(this.statusBarPoison);
        this.addToMap(this.statusBarHealth);
        this.addToMap(this.statusBarCoins);
    }


    renderEnemiesAndCharacter() {
        this.addObjectsToMap(this.level.enemies);
        this.addToMap(this.character);
    }


    renderThrowableObjectsAndTranslate() {
        this.addObjectsToMap(this.throwableObjects);
        this.ctx.translate(-this.camera_x, 0);
    }


    collidingPufferfish() { //character collides with PufferFish
        this.level.enemies.forEach(enemy => {
            if (this.character.isColliding(enemy)) {
                if (this.meetsConditionsForInflation(enemy)) {
                    enemy.startInflatedSwimming();
                }
                this.character.hit(enemy);
                this.statusBarHealth.setPercentage(this.character.health, 'HEALTH');
            }
        });
    }


    slappingEnemy() { //character slaps enemy
        this.level.enemies.forEach(enemy => {
            if (this.meetsConditionsForSlapping(enemy) && this.character.isColliding(enemy)) {
                if (enemy instanceof PufferFish) {
                    this.exitPufferfish(enemy);
                } else if (enemy instanceof Endboss && this.canEndbossBeHit(enemy)) {
                    let endboss = enemy;
                    endboss.hasBeenHit = true;
                    endboss.deductDamage(25);
                    setTimeout(() => endboss.hasBeenHit = false, 550); //to prevent multiple hits at once
                }
            }
        });
    }


    exitPufferfish(pufferFish) { //character exits PufferFish
        this.determineDirectionOfHit(pufferFish);
        pufferFish.isDefeated = true;
        setTimeout(() => { //to match animation
            pufferFish.dies();
        }, 220);
    }


    collidingChest() { //character collides with Chest
        this.level.chests.forEach(chest => {
            if (this.character.isColliding(chest)) {
                if (this.collectedCoins >= 6 && !chest.isLooted) {
                    chest.isLooted = true; //chest can only be looted once
                    chest.open();
                    this.deductCoins(6);
                    this.creditCollectable('POISON');
                }
            }
        });
    }


    collidingCollectable() { //character collides with coin or poison
        this.level.collectableObjects.forEach(object => {
            if (this.character.isColliding(object)) {
                if (this.isCollectable(object, 'COIN')) { //find out the object type
                    this.coin_sound.play();
                    this.creditCollectable('COIN');
                } else if (this.isCollectable(object, 'POISON')) {
                    this.poison_sound.play();
                    this.creditCollectable('POISON');
                }
                const index = this.level.collectableObjects.indexOf(object);
                this.level.collectableObjects.splice(index, 1);
            }
        });
    }


    collidingThrowableObject() { //checks for collision between throwable objects and enemies
        this.throwableObjects.forEach(object => {
            this.collidingBubble(object)
            this.collidingPoisonBubble(object)
        });
    }


    collidingBubble(object) { //bubble collides with JellyFish
        this.level.enemies.forEach(jellyFish => {
            if (this.isCollidingBubble(object, jellyFish)) {
                this.isEjectingJellyFish = true;
                setTimeout(() => { //to prevent hit where enemy is not enveloped by object
                    const objectIndex = this.throwableObjects.indexOf(object);
                    this.throwableObjects.splice(objectIndex, 1);
                    jellyFish.startDeathAnimation();
                    jellyFish.moveOutOfMap();
                    this.isEjectingJellyFish = false;
                }, 80);
            }
        });
    }


    collidingPoisonBubble(object) { //poison bubble collides with SuperJellyFish or Endboss
        this.level.enemies.forEach(enemy => {
            if (this.isCollidingPoisonBubble(object, enemy)) {
                if (enemy instanceof SuperJellyFish) {
                    this.handleHitSuperJellyFish(enemy, object);
                } else if (enemy instanceof Endboss) {
                    this.handleHitEndboss(enemy, object);
                }
            }
        });
    }


    handleHitSuperJellyFish(superJellyFish, object) { //move SuperJellyFish out of map
        this.isEjectingSuperJellyFish = true;
        setTimeout(() => { //to prevent hit where enemy is not enveloped by object
            const objectIndex = this.throwableObjects.indexOf(object);
            this.throwableObjects.splice(objectIndex, 1);
            superJellyFish.startDeathAnimation();
            superJellyFish.moveOutOfMap();
            this.isEjectingSuperJellyFish = false;
        }, 80);
    }


    handleHitEndboss(endboss, object) { //deduct damage from Endboss
        setTimeout(() => { //to prevent hit where enemy is not touched by object
            const objectIndex = this.throwableObjects.indexOf(object);
            this.throwableObjects.splice(objectIndex, 1);
            if (this.canEndbossBeHit(endboss)) {
                endboss.hasBeenHit = true;
                endboss.deductDamage(25);
            }
        }, 35);
        setTimeout(() => {
            endboss.hasBeenHit = false;
        }, 100);
    }


    determineDirectionOfHit(pufferFish) { //causes PufferFish object to leave map in correct direction
        if (this.character.headsLeft) {
            pufferFish.isHitFromLeft = false; //pufferFish leaves map to the right, see PufferFish.dies()
        } else {
            pufferFish.isHitFromLeft = true; //pufferFish leaves map to the left
        }
    }


    deductPoison() { //if poison pubble was used
        this.collectedPoison--;
        this.relativeCollectedPoison = this.collectedPoison / this.level.totalPoison * 100;
        this.statusBarPoison.setPercentage(this.relativeCollectedPoison, 'POISON');
    }


    deductCoins(subtrahend) { //if chest was opened (deducts 6 coins)
        this.collectedCoins -= subtrahend;
        this.relativeCollectedCoins = this.collectedCoins / this.level.totalCoins * 100;
        this.statusBarCoins.setPercentage(this.relativeCollectedCoins, 'COINS');
    }


    creditCollectable(collectable) { //credit collected coins and poison and update StatusBar
        if (collectable == 'COIN') {
            this.collectedCoins++;
            this.relativeCollectedCoins = this.collectedCoins / this.level.totalCoins * 100;
            this.statusBarCoins.setPercentage(this.relativeCollectedCoins, 'COINS')
        } else if (collectable == 'POISON') {
            this.collectedPoison++;
            this.relativeCollectedPoison = this.collectedPoison / this.level.totalPoison * 100;
            this.statusBarPoison.setPercentage(this.relativeCollectedPoison, 'POISON');
        }
    }


    clearIntervals() { //clears all intervals once game is over
        for (let i = 1; i < 999; i++) window.clearInterval(i);
    }

    //conditionals
    isCollectable(object, collectable) { //is object a collectable object
        return object.typeOfCollectable.includes(collectable);
    }


    isCollidingBubble(object, enemy) { //collides any JellyFish with bubble
        return object.isColliding(enemy) && enemy instanceof JellyFish && !this.isEjectingJellyFish
    }


    isCollidingPoisonBubble(object, enemy) { //collides any enemy object with poisonBubble
        return object.isColliding(enemy) && object.type == 'poisonBubble' && !this.isEjectingSuperJellyFish
    }


    isEndbossDefeated() { //endboss is last enemy in array
        return this.level.enemies[this.level.enemies.length - 1].isEndbossDefeated;
    }


    isCharacterDefeated() { //solely for readability (checkGameStatus())
        return this.character.isDead();
    }


    canEndbossBeHit(enemy) { //former prevents multiple hits at once, latter prevents hit while attacking
        return !enemy.hasBeenHit && !enemy.isPlayingAttackAnimation;
    }


    meetsConditionsForSlapping(enemy) { //slap enemy if F is pressed and enemy is a PufferFish or Endboss
        return this.keyboard.F && (enemy instanceof PufferFish || enemy instanceof Endboss)
            && this.landsHitOn(enemy) && !this.character.isDead() && !enemy.isDefeated;
    }


    meetsConditionsForThrowingBubble() { //throw bubble if G is pressed and character is not dead
        return this.keyboard.G && !this.character.isDead()
            && this.character.isPreparingAttack && !this.isThrowingObject;
    }


    meetsConditionsForThrowingPoisonBubble() { //throw poisonBubble if H is pressed and character is not dead
        return this.keyboard.H && !this.character.isDead() && this.collectedPoison > 0 &&
            this.character.isPreparingAttack && !this.isThrowingObject;
    }


    meetsConditionsForInflation(enemy) {
        return enemy instanceof PufferFish && !enemy.isInflated && !enemy.isDefeated;
    }

    landsHitOn(enemy) { //if PufferFish is inflated, it can be hit
        if (this.character.headsLeft) {
            return enemy.x < this.character.x + this.character.width / 4;
        } else {
            return this.character.x + this.character.width / 1.3 < enemy.x + enemy.width;
        }
    }
}


/*let self = this;
requestAnimationFrame(function() {
self.draw();
});*/