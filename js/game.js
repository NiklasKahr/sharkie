let canvas;
let world;
let keyboard = new Keyboard();
let isSoundTurnedOn;


function init() { //called when the page is loaded or game is restarted
    canvas = document.getElementById('canvas');
    level1 = getLevel1();
    world = new World(canvas, keyboard);
    adjustVisibility();
}


function adjustVisibility() { //called when the page is loaded or game is restarted
    hideElement('help');
    setTimeout(() => { //to load canvas
        hideElement('loading-screen');
        showElement('canvas');
        handleWindowWidth();
    }, 2000);
}


function enterFullscreen() { //called when the user clicks on the fullscreen button
    if (canvas.requestFullscreen) {
        canvas.requestFullscreen();
    } else if (canvas.msRequestFullscreen) { //for IE11
        canvas.msRequestFullscreen();
    } else if (canvas.webkitRequestFullscreen) { //iOS Safari
        canvas.webkitRequestFullscreen();
    }
}


function showWinScreen() { //called when the user wins
    showElement('winning-screen')
    hideElement('canvas-container');
    hideElement('sub-content');
}


function resetScreen() { //called when the user clicks on the play/try again button
    hideElement('canvas');
    hideElement('winning-screen');
    hideElement('losing-screen');
    hideElement('hud');
    showElement('canvas-container');
    showElement('loading-screen');
    showElement('sub-content');
}


function showLossScreen() { //called when the user loses
    hideElement('canvas-container');
    hideElement('sub-content');
    showElement('losing-screen');
}


function showElement(element) { //show an element by removing the d-none class
    if (isHelpElement(element)) {
        updateHelpButton('isShown');
        document.getElementById(element).classList.remove('v-hidden');
    } else {
        document.getElementById(element).classList.remove('d-none');
    }
}


function hideElement(element) { //hide an element by adding the d-none class
    if (isHelpElement(element)) {
        document.getElementById(element).classList.add('v-hidden');
        updateHelpButton('isHidden');
    } else {
        document.getElementById(element).classList.add('d-none');
    }
}


function handleWindowWidth() { //called when the page is loaded
    if (isMobilePhone() && isPortraitMode()) {
        handleMobileInPortrait();
    } else if (isLandScapeMode()) {
        handleMobileInLandscape();
    } else {
        handleDesktop();
    }
}


function doNotClose(event) { //prevent the container from closing when clicking inside it
    event.stopPropagation();
}


function updateHelpButton(helpStatus) { //called when the user clicks on the help button
    document.getElementById('help-button').disabled = true;
    if (helpStatus == 'isShown') {
        configureHelpButtonShow();
    } else if (helpStatus == 'isHidden') {
        configureHelpButtonHide();
    }
    setTimeout(() => {
        document.getElementById('help-button').disabled = false;
    }, 500);
}


function configureHelpButtonShow() {
    document.getElementById('help-button').classList.add('help-button-active');
    document.getElementById('help-button').onclick = function () {
        hideElement('help');
        replaceAnimationOf(document.getElementById('help'), 'fade-out-right');
    }
}


function configureHelpButtonHide() {
    document.getElementById('help-button').classList.remove('help-button-active');
    document.getElementById('help-button').onclick = function () {
        showElement('help');
        doNotClose(event);
        replaceAnimationOf(document.getElementById('help'), 'fade-in-right');
    };
}


function handleMobileInPortrait() {
    showElement('mobile-rotate');
    hideElement('menu');
    hideElement('hud');
    hideElement('canvas');
    hideElement('loading-screen');
    document.getElementById('help').classList.add('d-none');
}


function handleMobileInLandscape() {
    showElement('canvas');
    showElement('hud');
    hideElement('heading');
    hideElement('menu');
    hideElement('loading-screen');
    hideElement('mobile-rotate');
    document.getElementById('help').classList.add('d-none');
}


function handleDesktop() {
    hideElement('hud');
    showElement('canvas');
    showElement('heading');
    showElement('menu');
    hideElement('mobile-rotate');
    hideElement('loading-screen');
    hideElement('help');
    document.getElementById('help').classList.remove('d-none');
}


function setSound() { //called when the user clicks on the sound button
    if (isSoundTurnedOn) {
        isSoundTurnedOn = false;
        showElement('no-sound');
        showElement('mobile-no-sound');
        hideElement('sound');
        hideElement('mobile-sound');
    } else {
        isSoundTurnedOn = true;
        showElement('sound');
        showElement('mobile-sound');
        hideElement('no-sound');
        hideElement('mobile-no-sound');
    }
}

//replace the animation of an element, name of animations must begin with the same word (e.g. fade-in, fade-out)
function replaceAnimationOf(element, animation) {
    const arrayOfClasses = createArrayOfClass(element);
    const animationType = returnPrefix(animation); //e.g. fade-in --> fade
    const currentAnimation = searchForAnimation(animationType, arrayOfClasses);
    element.classList.replace(currentAnimation, animation);
}


function createArrayOfClass(element) { //return an array of classes
    return Array.from(element.classList);
}


function searchForAnimation(animationType, arrayOfClasses) { //returns the class that contains the animation
    for (let i = 0; i < arrayOfClasses.length; i++) {
        const currentClass = arrayOfClasses[i];
        if (currentClass.includes(animationType)) {
            return currentClass;
        }
    }
}


function returnPrefix(animation) { //return the first word of the animation's name
    return animation.split('-')[0];
}


function isMobilePhone() { //does not work on larger phones such as the Galaxy S20
    return window.innerHeight <= 920 && window.innerWidth <= 420 || window.innerWidth <= 420;
}


function isLandScapeMode() {
    return window.innerHeight <= 420 && window.innerHeight <= window.innerWidth;
}


function isPortraitMode() {
    return window.innerHeight >= window.innerWidth;
}


function isHelpElement(element) {
    return element == 'help';
}