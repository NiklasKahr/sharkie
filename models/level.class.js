class Level { //contains all objects in a level and performs calculations on them
    enemies;
    chests;
    collectableObjects;
    totalCoins;
    totalPoison;
    backgroundObjects;
    level_end_x;

    constructor(enemies, chests, collectableObjects, backgroundObjects) {
        this.enemies = enemies;
        this.chests = chests;
        this.collectableObjects = collectableObjects;
        this.totalCoins = this.quantifyCollectableObjects('COIN');
        this.totalPoison = this.quantifyCollectableObjects('POISON') + this.totalCoins / 6; //player can trade 6 coins for 1 poison
        this.backgroundObjects = backgroundObjects;
        this.level_end_x = this.returnEndOfMap();
    }


    quantifyCollectableObjects(collectable) { //returns number of collectable coins or poison in level
        //use of == not possible ('POISON_LEFT', 'POISON_RIGHT')
        return this.collectableObjects.filter(object =>
            object.typeOfCollectable.includes(collectable)).length;
    }


    returnEndOfMap() { //returns x position of the last background object
        return this.backgroundObjects[this.backgroundObjects.length - 1].x;
        // + this.backgroundObjects[this.backgroundObjects.length - 1].width
    }
}