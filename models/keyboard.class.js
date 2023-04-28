class Keyboard {
    UP;
    RIGHT;
    DOWN;
    LEFT;
    F;
    G;
    H;


    constructor() {
        //DOM content needs to be loaded before binding events +
        //prohibits character from moving before canvas is fully loaded
        setTimeout(() => {
            this.binKeyPressEvents();
            this.bindBtsPressEvents();
        }, 2350);
    }


    bindBtsPressEvents() { //mobile
        // ------ touchstart ------
        document.getElementById('arrow-down').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.DOWN = true;
        });
        document.getElementById('arrow-left').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.LEFT = true;
        });
        document.getElementById('arrow-up').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.UP = true;
        });
        document.getElementById('arrow-right').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.RIGHT = true;
        });
        document.getElementById('slap').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.F = true;
        });
        document.getElementById('throw-bubble').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.G = true;
        });
        document.getElementById('throw-poison').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.H = true;
        });
        // ------ touchend ------
        document.getElementById('arrow-down').addEventListener('touchend', (e) => {
            e.preventDefault();
            this.DOWN = false;
        });
        document.getElementById('arrow-left').addEventListener('touchend', (e) => {
            e.preventDefault();
            this.LEFT = false;
        });
        document.getElementById('arrow-up').addEventListener('touchend', (e) => {
            e.preventDefault();
            this.UP = false;
        });
        document.getElementById('arrow-right').addEventListener('touchend', (e) => {
            e.preventDefault();
            this.RIGHT = false;
        });
        document.getElementById('slap').addEventListener('touchend', (e) => {
            e.preventDefault();
            this.F = false;
        });
        document.getElementById('throw-bubble').addEventListener('touchend', (e) => {
            e.preventDefault();
            this.G = false;
        });
        document.getElementById('throw-poison').addEventListener('touchend', (e) => {
            e.preventDefault();
            this.H = false;
        });
    }


    binKeyPressEvents() { //keyboard
        // ------ keydown ------
        window.addEventListener('keydown', (event) => {
            switch (event.keyCode) {
                case 16: //shift
                    this.DOWN = true;
                    break;
                case 32: //space
                    this.UP = true;
                    break;
                case 37: //arrowLeft
                    this.LEFT = true;
                    break;
                case 38: //arrowUp
                    this.UP = true;
                    break;
                case 39: //arrowRight
                    this.RIGHT = true;
                    break;
                case 40: //arrowDown
                    this.DOWN = true;
                    break;
                case 65: //a
                    this.LEFT = true;
                    break;
                case 68: //d
                    this.RIGHT = true;
                    break;
                case 70: //f
                    this.F = true;
                    break;
                case 71: //g
                    this.G = true;
                    break;
                case 72: //h
                    this.H = true;
                    break;
                case 83: //s
                    this.DOWN = true;
                    break;
                case 87: //w
                    this.UP = true;
                    break;
                default:
                    break;
            }
        });
        // ------ keyup ------
        window.addEventListener('keyup', (event) => {
            switch (event.keyCode) {
                case 16: //shift
                    this.DOWN = false;
                    break;
                case 32: //space
                    this.UP = false;
                    break;
                case 37: //arrowLeft
                    this.LEFT = false;
                    break;
                case 38: //arrowUp
                    this.UP = false;
                    break;
                case 39: //arrowRight
                    this.RIGHT = false;
                    break;
                case 40: //arrowDown
                    this.DOWN = false;
                    break;
                case 65: //a
                    this.LEFT = false;
                    break;
                case 68: //d
                    this.RIGHT = false;
                    break;
                case 70: //f
                    this.F = false;
                case 71: //g
                    this.G = false;
                    break;
                case 72: //h
                    this.H = true;
                    break;
                case 83: //s
                    this.DOWN = false;
                    break;
                case 87: //w
                    this.UP = false;
                    break;
                default:
                    break;
            }
        });
    }
}