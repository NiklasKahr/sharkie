class Chest extends MovableObject { //object to exchange coins for poison
    width = 70;
    height = 65;
    y = 402;
    j;
    chest_sound = new Audio('audio/chest.mp3');
    isLooted;


    constructor(x) {
        super().loadImage(CT_IMAGES['CLOSED'][0]);
        this.loadImages(CT_IMAGES['CLOSED']);
        this.loadImages(CT_IMAGES['OPENING']);
        this.x = x;
    }


    open() {
        this.chest_sound.play();
        this.j = 0;
        this.currentImage = 0;
        this.opening = setInterval(() => {
            this.playAnimation(CT_IMAGES['OPENING']);
            this.j++;
            if (this.j > 1) {  //if CT_IMAGES['OPENING'] was played once (stays on last frame)
                clearInterval(this.opening);
                this.currentImage = 0;
                this.loadImage('img/4. Marcadores/Chest/chest_2.png');
            }
        }, 1000 / 6);
    }
}