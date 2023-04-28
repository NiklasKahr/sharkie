class Endboss extends MovableObject { //final enemy of the game
    x = 5520;
    y = 25;
    width = 400;
    height = 400;
    speed = 0.25;
    j = 0;
    monitoring;
    attacking;
    checkingDeath;
    hasBeenHit;
    offset = {
        top: 180,
        bottom: 69,
        left: 22,
        right: 30
    }


    constructor() {
        super().loadImage(EB_IMAGES['SWIMMING'][0]);
        this.loadImages(EB_IMAGES['SWIMMING']);
        this.loadImages(EB_IMAGES['SPAWNING']);
        this.loadImages(EB_IMAGES['ATTACKING']);
        this.loadImages(EB_IMAGES['HURTING']);
        this.loadImages(EB_IMAGES['DYING']);
        this.animate();
        this.spawn();
        this.handleMovements();
    }


    animate() { //responsible for all animations except attack animation
        this.checkingDeath = setInterval(() => {
            if (this.isDead() && !this.hasStartedDeathAnimation) {
                this.handleDeath();
            }
        }, 1000 / 60);
        setInterval(() => {
            if (!this.isPlayingAttackAnimation) {
                this.handleOtherAnimations();
            }
        }, 1000 / 6);
    }


    handleDeath() { //sets mandatory variables and plays death animation
        clearInterval(this.checkingDeath);
        this.isDefeated = true;
        this.hasStartedDeathAnimation = true;
        setTimeout(() => this.isEndbossDefeated = true, 1750); //delay to show endboss death animation
        clearInterval(this.moving);
        this.playAnimationOnce(EB_IMAGES['DYING'], EB_IMAGES['DYING'].length - 1);
    }


    handleOtherAnimations() { //handles all animations except the attack and death
        if (this.hasPlayedSpawnAnimation() && !this.hasStartedDeathAnimation) {
            this.playAnimation(EB_IMAGES['SPAWNING']);
        } else if (this.isHurt() && !this.hasStartedDeathAnimation && !this.isPlayingAttackAnimation) {
            this.playAnimation(EB_IMAGES['HURTING']);
            this.recoilRight();
        } else if (!this.hasStartedDeathAnimation) {
            this.playAnimation(EB_IMAGES['SWIMMING']);
        }
        this.j++;
    }


    spawn() {
        setTimeout(() => { //world not yet defined to this point
            const checkingSpawn = setInterval(() => {
                //second condition prevents the endboss from spawning again
                if (this.isCharacterInPlace(4990) && !world.hadEndbossEncounter) {
                    world.hadEndbossEncounter = true;
                    this.currentImage = 0;
                    this.j = 0;
                    clearInterval(checkingSpawn);
                }
            }, 1000 / 80);
        }, 1250);
    }


    handleMovements() {
        setTimeout(() => { //world not yet defined to this point
            const initializingAttacks = setInterval(() => {
                if (world.hadEndbossEncounter) { //only initialize attacks after endboss has spawned
                    clearInterval(initializingAttacks);
                    this.randomizeAttacks();
                    setTimeout(() => this.moveZigZag(), 2000);
                }
            }, 1000 / 30);
        }, 1250);
    }


    randomizeAttacks() {
        setInterval(() => {
            if (!this.isPlayingDeathAnimation()) {
                this.isPlayingAttackAnimation = true;
                this.speed = 1.25;
                if (!this.isDefeated) {
                    this.playAnimationOnce(EB_IMAGES['ATTACKING'], EB_IMAGES['ATTACKING'].length - 1);
                }
                this.monitoreAttackAnimation();
            }
        }, 3000 + Math.random() * 1500); //3 (inclusive) to 4.5 seconds (exclusive)
    }


    recoilRight() { //recoil endboss to the right when hit
        this.x += this.speed * 18;
    }


    monitoreAttackAnimation() { //can interrupt attack animation
        this.monitoring = setInterval(() => {
            if (this.isDefeated || !this.isPlayingAttackAnimation) {
                clearInterval(this.monitoring);
                this.speed = 0.25;
            }
        }, 1000 / 30);
    }


    //conditionals
    isPlayingDeathAnimation() {
        return this.isDead() || this.hasStartedDeathAnimation;
    }


    hasPlayedSpawnAnimation() { //consists of 9 images
        return this.j < 10;
    }
}