class CollectableObject extends MovableObject { //collectable coins and poison
    typeOfCollectable;
    offset = {};
    coinOffset = {
        top: -4,
        bottom: -4,
        left: -4,
        right: -4
    }
    poisonOffset = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    }


    constructor(TYPE, x, y) {
        super().loadImage(CO_IMAGES[TYPE][0]);
        this.loadImages(CO_IMAGES[TYPE]);
        this.typeOfCollectable = TYPE;
        this.x = x;
        this.y = y;
        this.setOffset();
        if (this.hasAnimation()) { //poison object might not have animation
            this.animate();
        }
    }


    animate() {
        setInterval(() => {
            this.playAnimation(CO_IMAGES[this.typeOfCollectable]);
        }, 1000 / 4);
    }


    setOffset() {
        if (this.typeOfCollectable.includes('COIN')) {
            this.offset = this.coinOffset;
        } else if (this.typeOfCollectable.includes('POISON')) {
            this.offset = this.poisonOffset;
        }
    }

    
    hasAnimation() {
        return this.typeOfCollectable.includes('COIN') || this.typeOfCollectable == 'POISON'; //POISON_LEFT, POISON_RIGHT do not have an animation
    }
}