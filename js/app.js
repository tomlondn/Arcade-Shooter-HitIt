// HTML DOM Elements for Access
const canvas = elem("#canvas");
const ctx = canvas.getContext("2d");
const gameTimer = elem("#timer"); 
const startElem = elem("#gameHeadline");
const startElemH1 = elem("#gameHeadline h1");
const startElemH2 = elem("#gameHeadline h2");
const playTime = elem("#playTime");
const gamePoints = elem("#points");

// Timer
let timerTimeout, timerSecLeft, timerMins,timerSeconds;

// Set the Text for Timer
const calculateTimerShow = () => {
    // Timer minutes
    timerMins = Math.floor(timerSeconds / 60);

    // Timer seconds that are not a fully minute
    timerSecLeft = timerSeconds % 60;
    
    // adding a 0 before Seconds when they are smaller than "10"
    if(timerSecLeft < 10) {
        timerSecLeft = `0${timerSecLeft}`;
    }
    
    gameTimer.innerText = `${timerMins}:${timerSecLeft}`;
}

const setPlayTime = () => {
    timerSeconds = parseInt(playTime.value);
    calculateTimerShow();
}

// init Timer
setPlayTime();
calculateTimerShow();

// Collector for all created objects 
let collector = [];

// Coordinates of the mouse click
const mousePosition = {};

// declare the points and speed for the gameobject sizes
const moveSpeedsAndPointsSetup = {
    "small" : {speed : 1.2, points : 6},
    "middle" : {speed : 1, points : 4},
    "big" : {speed : .8, points : 2}
};

// get a random color out of all available colors for the objects
const randomColor = () => {

    // Neon Colors
    const colors = [
        "#8bffff", "#ffb0ff", "#d591fe","#785dd0", "#6f9aff",
        "#9d27a1", "#471860", "#3c8ed7", "#ffa199", "#ffcc73",
        "#ffb78c", "#50b3b3", "#00FFFF", "#00FF7F", "#FFD700",
        "#FF69B4", "#9400D3", "#00BFFF", "#FFA07A", "#FF6347",
        "#7B68EE", "#00CED1", "#FFC0CB", "#8B008B"
    ];

    return colors[Math.floor(Math.random() * colors.length)];
}

// Counter of players points
let playerPoints = 0;

// AnimationFrame ID for Rendering the Canvas
let animate = false;

// Timout ID for Object Creating
let create = false;

// integrate Audio Files
let bgMusic = elem("#bgMusic");
bgMusic.src = "/audio/bg.wav";
bgMusic.volume = .1;

const shoot = new Audio("/audio/shoot.wav");
shoot.volume = .1;

const die = new Audio("/audio/die.wav");
die.volume = .1;


// set the Size of the Canvas
ctx.canvas.width = document.documentElement.clientWidth;
ctx.canvas.height = document.documentElement.clientHeight * .8;

// get the size of Canvas
const canvasWidth = canvas.offsetWidth;
const canvasHeight = canvas.offsetHeight;

// get a random Gameofbject of all available for Creating
const randomObject = () => Object.keys(gameObjects)[Math.floor(Math.random() * Object.keys(gameObjects).length)];

const calculateMoveSpeedAndSpeedOnSize = (obj, size, defaultSize) => {
    // small 100% to 120%, middle 121% to 140%, big 141% to Max Size
    const firstStep = defaultSize * 1.2;
    const secondStep = defaultSize * 1.4;

    // smaller or 120% of defaultSize
    if(size <= firstStep) {
        setMoveSpeedAndPoints(obj, "small");
    
    // bigger than 120% but smaller than 141% of defaultSize
    } else if ((size > firstStep) && (size <= secondStep)){
        setMoveSpeedAndPoints(obj, "middle");

    // 141%+ of defaultSize
    } else {
        setMoveSpeedAndPoints(obj, "big");
    }

}

// init the move speed and points values of the created gameobject
const setMoveSpeedAndPoints = (obj, sizeDescription) => {
    obj.speedX = moveSpeedsAndPointsSetup[sizeDescription].speed;
    obj.speedY = obj.speedX;
    obj.points = moveSpeedsAndPointsSetup[sizeDescription].points;
}

// set gameobjekt coordinates on canvas
const setCoordinates = (obj) => {
    // set Coordinates
    obj.x = Math.floor(Math.random() * (canvasWidth - 100)) + 50;
    obj.y = Math.floor(Math.random() * (canvasHeight - 100)) + 50;
}

// set size for the gameobjekt
const setSizes = (obj, sizesSetUp) => {
    // if circle: only r is needed
    if(obj.r){
        const defaultSize = obj.r;
        const randomSize = Math.floor(Math.random() * sizesSetUp.r);
        obj.r = checkAndSetSize(randomSize, obj.r);
        calculateMoveSpeedAndSpeedOnSize(obj, obj.r, defaultSize);

    }
    // if square: both sides are the same
    if(obj.s){
        const defaultSize = obj.s;
        const randomSize = Math.floor(Math.random() * sizesSetUp.s);
        obj.s = checkAndSetSize(randomSize, obj.s);
        calculateMoveSpeedAndSpeedOnSize(obj, obj.s, defaultSize);
    }

    // if rectangle: the sides are not the same and w and h are needed seperatly
    if(obj.w && obj.h){
        // Min size value 
        const defaultSize = obj.w;

        const randomSizeW = Math.floor(Math.random() * sizesSetUp.w);
        const randomSizeH = Math.floor(Math.random() * sizesSetUp.h);

        // checkup if randomSize is higher than default
        obj.w = checkAndSetSize(randomSizeW, obj.w);
        obj.h = checkAndSetSize(randomSizeH, obj.h);
        
        calculateMoveSpeedAndSpeedOnSize(obj, obj.w, defaultSize);

    }
}

// Check where the Object has to fly depending on the Space around it
const checkFlyDirection = (coordiante, side, canvasSide) => {
    const distanceTo0 = coordiante;
    const distanceToFull = canvasSide - (coordiante + side);

    if(distanceTo0 > distanceToFull) {
        return -1;
    } else {
        return 1;
    }
}

// ensures that the size always has a default value
// when the random Value is bigger then default than set size to the random value 
// if not than set the default size value
const checkAndSetSize = (size, min) => {
    if(size > min){
        return size;
    }else{
        return min;
    }
}

// declare all Gamobjects
const gameObjects = {
    "square" : {
        x : 0,
        y : 0,
        s : 30,
        points: 0,
        speedX: 0,
        speedY: 0,
        color: "rgb(0,0,0)",
        init : function(){
            // init needed values 
            setCoordinates(this);
            setSizes(this, {s: 65});
            this.color = randomColor();
            this.speedX =  this.speedX * checkFlyDirection(this.x, this.s, canvasWidth);
            this.speedY = this.speedY * checkFlyDirection(this.y, this.s, canvasHeight);

            collector.push(this);
        },
        draw: function(){
            ctx.fillStyle = this.color;
            ctx.strokeStyle = "#92feff";
            ctx.lineWidth = 3;
            ctx.shadowBlur = 40;
            ctx.shadowColor = "#92feff";
            ctx.fillRect(this.x, this.y, this.s, this.s);
            ctx.strokeRect(this.x, this.y, this.s, this.s);
        },
        move: function(){
            
            // clear Rectangle to get the look of flying gameobjects
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // draw the gameobject
            this.draw();

            collector.forEach((obj,index) => {

                // remove the gameobjekt when it flys out of the canvas
                if (obj.x > canvasWidth || obj.x < 0 || obj.y > canvasHeight || obj.y < 0) {
                    collector.splice(index, 1);
                }
                 // also draw all already crated gameobjects to not loose them on canvas bc of clearing it
                obj.draw();
            });

            // let the gameobjects move on Canvas
            this.x += this.speedX;
            this.y += this.speedY;
        }
    },
    "circle" : {
        x : 0,
        y : 0,
        r : 30,
        speedX: 0,
        speedY: 0,
        points: 0,
        color: "rgb(0,0,0)",
        init : function(){
            setCoordinates(this);
            setSizes(this, {r : 50});
            this.color = randomColor();
            this.speedX =  this.speedX * checkFlyDirection(this.x, this.r, canvasWidth);
            this.speedY = this.speedY * checkFlyDirection(this.y, this.r, canvasHeight);
 
            collector.push(this);
        },
        draw: function(){
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.strokeStyle = "#86d8fe";
            ctx.lineWidth = 3;
            ctx.shadowBlur = 40;
            ctx.shadowColor = "#bc13fe";
            ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();

        },
        move: function(){
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.draw();

            collector.forEach((obj,index) => {
                if (obj.x - (obj.r * 2) > canvasWidth || obj.x - (obj.r * 2) < 0 || obj.y - (obj.r * 2) > canvasHeight || obj.y  < (0 - (obj.r * 2))) {
                    collector.splice(index, 1);
                }
                obj.draw();
            });

            this.x += this.speedX;
            this.y += this.speedY;

        }
    },
    "rectangle" : {
        x : 0,
        y : 0,
        h : 25,
        w: 60,
        speedX: 0,
        speedY: 0,
        points: 0,
        color: "rgb(0,0,0)",
        init : function(){
            setCoordinates(this);
            setSizes(this,{w: 80, h: 45});
            this.color = randomColor();
            this.speedX =  this.speedX * checkFlyDirection(this.x, this.w, canvasWidth);
            this.speedY = this.speedY * checkFlyDirection(this.y, this.h, canvasHeight);

            collector.push(this);
        },
        draw: function() {
            ctx.fillStyle = this.color;
            ctx.strokeStyle = "#92feff";
            ctx.lineWidth = 3;
            ctx.shadowBlur = 40;
            ctx.shadowColor = "#92feff";
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.strokeRect(this.x, this.y, this.w, this.h);
        },
        move: function(){
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.draw();
            
            collector.forEach((obj,index) => {
                if (obj.x > canvasWidth || obj.x < 0 || obj.y > canvasHeight || obj.y < 0) {
                    collector.splice(index, 1);
                }
                obj.draw();
            });

            this.x += this.speedX;
            this.y += this.speedY;
        }
    }
}

// Check collision with a Rectangle or Square 
const collisionRectangle = (x, y, height, width, index) => {
    // on collision get the points and then remove the gameobjet out of the collector
    if(
        mousePosition.x > x 
        && mousePosition.x < (x + width)
        && mousePosition.y > y
        && mousePosition.y < (y + height)) {
            playerPoints += collector[index].points;
            gamePoints.innerText = playerPoints;

            collector.splice(index, 1);
            die.play();
    }
}

// Check collision with a circle 
const collisionCircle = (x, y, r, index) => {
    const distance = Math.sqrt(Math.pow(mousePosition.x - x, 2) + Math.pow(mousePosition.y - y, 2));

    if(distance <= r) {
        playerPoints += collector[index].points;
        gamePoints.innerText = playerPoints;

        collector.splice(index, 1);
        die.play();
    }
}

// Check if player hits a gameobject
const checkIfHitted = (e) => {
    shoot.play();

    // Get the Mouse Position for Collision Check 
    mousePosition.x = (e.clientX - canvas.getBoundingClientRect().left);
    mousePosition.y = (e.clientY - canvas.getBoundingClientRect().top);

    collector.forEach((obj, index) => {

        // Collision with square
        if(obj.s){
            collisionRectangle(obj.x, obj.y, obj.s, obj.s, index);
        }

        // Collision with rectangle
        if(obj.w && obj.h){
            collisionRectangle(obj.x, obj.y, obj.h, obj.w, index);
        }

        // Collsion with Circle
        if(obj.r){
            collisionCircle(obj.x, obj.y, obj.r, index);
        }
    });
}

// Creating a new Game Object
const createGameObject = () => {
    create = setTimeout(createGameObject, 600);

    const clone = Object.create(gameObjects[randomObject()]);
    clone.init();
}

// Redraw the Objects to let them Fly
const render = () => {
    animate = requestAnimationFrame(render);

    collector.forEach(obj => {
        obj.move();
    });
}

// Counting down the Play Time and Set Game End
const timer = () => {
    calculateTimerShow();

    if(timerSeconds <= 15){
        gameTimer.style.color = "red";
    }

    timerTimeout = setTimeout(timer, 1000);
    timerSeconds--;
    
    if(timerSeconds < 1) {
        gameTimer.style.color = "white";
        gameEnd();
    }
}

// Set the Start of Game
const startGame = () => {
    bgMusic.play();

    // start counting down timer
    timer();

    // remove the changing of play Time while playing
    playTime.removeEventListener("input", setPlayTime);

    render();
    createGameObject();

    // set the class to animate the background of the canvas
    canvas.className = "animated";
    
    // add click event to canvas for  
    canvas.addEventListener("click", checkIfHitted);

    startElem.style.display = "none";
}

// pause the game and set pause screen
const stopGame = () => {
    cancelAnimationFrame(animate);
    clearTimeout(create);
    clearTimeout(timerTimeout);

    canvas.className = "";
    canvas.removeEventListener("click", checkIfHitted);

    bgMusic.pause();

    // pause screen
    startElem.style.display = "block";   
    startElemH1.innerText = "Paused";
    startElemH2.innerText = "Press Space to resume Game!";

    // to resume game
    create = false;
    animate = false;
}

// All necessary will be resetted
const gameEnd = () => {
    cancelAnimationFrame(animate);
    clearTimeout(create);
    clearTimeout(timerTimeout);

    // enable changing the playtime
    playTime.addEventListener("input", setPlayTime);

    // clear Canvas and collector of created gameobjekts
    collector = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    canvas.className = "";

    // so you cant shoot before your start the game
    canvas.removeEventListener("click", checkIfHitted);

    bgMusic.pause();
    bgMusic.currentTime = 0;

    // to restart game
    animate = false,
    create = false;

    // End screen
    startElem.style.display = "block";
    startElemH1.innerHTML = `Ende<br>Punkte: ${playerPoints}`;
    startElemH2.innerText = "Press Space to Start Game!";

    // resett player Points
    playerPoints = 0;
    gamePoints.innerText = playerPoints;

    timerSeconds = parseInt(playTime.value);
    calculateTimerShow();
}
// handle start/stop of game with space
document.addEventListener('keydown', e => {
  if (e.key === ' '){
    if(!animate && !create) {
        startGame();
    } else {
        stopGame();
    }
  }
});

// change canvas size on window Resize
window.addEventListener("resize", () => {
    ctx.canvas.width = document.documentElement.clientWidth;
    ctx.canvas.height = document.documentElement.clientHeight * .8;
});

// change playtime timer
playTime.addEventListener("input", setPlayTime);