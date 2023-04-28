class StatusBar extends DrawableObject { //status bars for health, poison and coins
    percentage = 100;


    constructor(TYPE, percent, y) {
        super();
        this.loadImages(BARS_IMAGES[TYPE]);
        this.x = 30;
        this.y = y;
        this.width = 200;
        this.height = 60;
        this.setPercentage(percent, TYPE);
    }


    setPercentage(percent, TYPE) {
        this.percentage = percent;
        let path = BARS_IMAGES[TYPE][this.resolveImageIndex()];
        this.img = this.imageCache[path];
    }


    resolveImageIndex() { //returns the index of the image to be displayed
        let i = 0;
        while (this.percentage > i * 20) {
            i++;
        }
        return i;
    }
}