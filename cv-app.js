'use strict';
var showMenu = function () {
    console.log("Menu clicked!");
    var menu = document.getElementById("mymenu");
    var margin = menu.style.marginLeft;
    if (margin === "" || parseInt(margin) < 0 ) {
        menu.style.marginLeft = 0;
    } else {
        menu.style.marginLeft = "-200px";
    }
};

var sound = function () {
    console.log("Sound icon clicked!");
    var soundIcon = document.getElementById("sound");
    if (soundIcon.className == "fas fa-volume-up") {
        soundIcon.className = "fas fa-volume-mute";
    } else {
        soundIcon.className = "fas fa-volume-up";
    }
};

var start = function () {
    var container = document.getElementById("container");
    container.innerHTML = '<canvas id="stage" width="800" height="600"></canvas>';
    var canvas = document.getElementById("stage");
    canvas.style.border = "1px black solid";
    canvas.style.marginTop = "50px";
    arsenal.init();
};

//*****************//
//Main game Object //
//*****************//

var arsenal = {
    stage: null,
    ctx: null,
    variables: {
        enemieCount: 10,
        ghostSpeed: 0.7
    },
    init: function(){
        this.stage = document.getElementById("stage");
        this.ctx = this.stage.getContext("2d");
        for(var i = 0 ; i < this.variables.enemieCount ; i++){
            var randomXPosition = function(){
                return Math.floor(Math.random() * (780)) + 10
            }
            this.enemies.ghostsX.push(randomXPosition());
            this.enemies.ghostsY.push(-20);
        };
        this.spriteKeeper = window.setInterval(function(){
            if(arsenal.currentSprite == 0){
                arsenal.currentSprite = 1;
            } else { arsenal.currentSprite = 0; }
        }, 100);
        this.player.ship = new Image();
        this.player.ship.src = "ships_human.png"; 
        this.images.background = new Image();
        this.images.background.src = "seamless_space.png"
        this.images.background.position = 0;
        this.images.weapons = new Image();
        this.images.weapons.src = "qubodup_ringicons.svg"
        this.images.aim = new Image();
        this.images.aim.src = "direction.png"
        this.audio.bgMusic = new Audio('battle_theme.mp3');
        this.audio.bgMusic.play();
        this.audio.shot = [new Audio("laserfire01.ogg"),new Audio("laserfire01.ogg"),new Audio("laserfire01.ogg"),new Audio("laserfire01.ogg"),new Audio("laserfire01.ogg"),new Audio("laserfire01.ogg"),new Audio("laserfire01.ogg"),new Audio("laserfire01.ogg"),new Audio("laserfire01.ogg"),new Audio("laserfire01.ogg"),new Audio("laserfire01.ogg"),new Audio("laserfire01.ogg")];
        addListeners();
        this.stopScene = mainLoop();
    },
    audio: {
        shotLoop: 0,
        mute: false
    },
    images: {
        player: "images/ships_human.png"
    },
    currentSprite: 0,
    shape: {
        ghost: function(x, y){             //path for ghosts
            var ghost = new Path2D();
            //ghost.y = arsenal.enemies.ghostsY[x]; //Le probleme est la!
            //console.log(arsenal.enemies.ghostsY[x]);
            // ghost.moveTo(x, 116+y);
            // ghost.lineTo(x, 102+y);
            // ghost.bezierCurveTo(x, 94+y, x+6, 88+y, x+14, 88+y);
            // ghost.bezierCurveTo(x+22, 88+y, x+28, 94+y, x+28, 102+y);
            // ghost.lineTo(x+28, 116+y);
            // ghost.lineTo(x+23.333, 111.333+y);
            // ghost.lineTo(x+18.666,  116+y);
            // ghost.lineTo(x+14, 111.333+y);
            // ghost.lineTo(x+9.333,  116+y);
            // ghost.lineTo(x+4.666, 111.333+y);
            // ghost.lineTo(x, 116+y);
            ghost.arc(x, y, 12, 0, Math.PI*2);
            ghost.closePath();
            return ghost;
        }
    },
    currentLevel: 1,
    levelTransition: false,
    player: {           //player's properties
        score: 0,
        moving: null,
        x: 390,
        speed: 10,
        targetX: null,
        targetY: null,
        weaponEquiped: "blaster",
        shotsFired: [],
        shotsTarget: [],
        shotsDirection: [],
        sprites: {
            still: [{       //  still[0] & still[1]
                sx: 0,
                sy: 448,
                swidth: 32,
                sheight: 48
            },{
                sx: 32,
                sy: 448,
                swidth: 32,
                sheight: 48
            }],
            moving: [{       //  moving[0] & moving[1]
                sx: 64,
                sy: 448,
                swidth: 32,
                sheight: 48,
            },{
                sx: 96,
                sy: 448,
                swidth: 32,
                sheight: 48,
            }]
        },
        drawShip: function(){
            var ship = new Image();
            ship.src = arsenal.images.player;
            return ship;
        },
        direction: "still"
    },
    weapons: {          //all the weapons available for the player
        blaster: {
            bullet: function(coordXY){
                var bullet = new Path2D;
                bullet.arc(coordXY[0], coordXY[1], 3, 0, Math.PI*2 );
                bullet.closePath();
                return bullet;
            },
            speed: 10
        }
    },
    enemies: {      // enemies' properties
        ghostsX: [],
        ghostsY: [],
        addGhost: function(){
            var randomXPosition = function(){
                return Math.floor(Math.random() * (780)) + 10
            };
            arsenal.enemies.ghostsX.push(randomXPosition());
            arsenal.enemies.ghostsY.push(-20);
        },
        sprites: {
            ghost: [{
                sx: 0,
                sy: 112,
                swidth: 32,
                sheight: 32
            },{
                sx: 32,
                sy: 112,
                swidth: 32,
                sheight: 32
            }]
        }
    }
};

//*****************//
//Main Loop        //
//*****************//

var mainLoop = function(){
    var ctx = arsenal.ctx;
    
    //clear previous frame
    ctx.clearRect(0,0, 800, 600);
    
    //draw background
    ctx.drawImage(arsenal.images.background,0,arsenal.images.background.position);
    arsenal.images.background.position += 0.5;
    if(arsenal.images.background.position == 1024){
        ctx.drawImage(arsenal.images.background,0,0);
        arsenal.images.background.position = 0;
    }
    ctx.drawImage(arsenal.images.background,0,-1024+arsenal.images.background.position);

    // Drawing Dead-Line
    ctx.beginPath();    
    ctx.moveTo(0, 550);
    ctx.lineTo(800, 550);
    ctx.closePath();
    ctx.strokeStyle = "red";
    ctx.stroke();
    
    //adding more ghosts
    while (arsenal.enemies.ghostsX.length < arsenal.variables.enemieCount){
        arsenal.enemies.addGhost();
    };

    // Enemies animation
    for(var i = 0 ; i <  arsenal.enemies.ghostsX[i] ; i++){
        ctx.fillStyle = 'black';
        ctx.fill(arsenal.shape.ghost( arsenal.enemies.ghostsX[i] , arsenal.enemies.ghostsY[i] ));
        arsenal.enemies.ghostsY[i] += arsenal.variables.ghostSpeed;
        ctx.save();
        ctx.rotate(Math.PI);
        ctx.drawImage(
            arsenal.player.ship, 
            arsenal.enemies.sprites.ghost[arsenal.currentSprite].sx, 
            arsenal.enemies.sprites.ghost[arsenal.currentSprite].sy, 
            arsenal.enemies.sprites.ghost[arsenal.currentSprite].swidth, 
            arsenal.enemies.sprites.ghost[arsenal.currentSprite].sheight,
            -arsenal.enemies.ghostsX[i]-16, -(arsenal.enemies.ghostsY[i])-16, 32, 32
            );
        ctx.restore();
    };

    //draws shots
    for(var i=0 ; arsenal.player.shotsFired[i] ; i++){
        ctx.fillStyle = "aqua";
        ctx.fill( arsenal.weapons.blaster.bullet(arsenal.player.shotsFired[i]) );
        if(!arsenal.player.shotsDirection[i]){
            var x = arsenal.player.shotsTarget[i][0] - arsenal.player.shotsFired[i][0];
            var y = arsenal.player.shotsTarget[i][1] - arsenal.player.shotsFired[i][1];
            var a = Math.sqrt( (x*x) + (y*y) );
            var temp = a/arsenal.weapons.blaster.speed;
            var deltaX = x / temp;
            var deltaY = y / temp;
            arsenal.player.shotsDirection[i] = [deltaX, deltaY];
        } else {
            arsenal.player.shotsFired[i][0] += arsenal.player.shotsDirection[i][0];
            arsenal.player.shotsFired[i][1] += arsenal.player.shotsDirection[i][1];
            //clean-up shots
            if(arsenal.player.shotsFired[i][0] < -4 || arsenal.player.shotsFired[i][0] > 804 || arsenal.player.shotsFired[i][1] < -4) {
                arsenal.player.shotsFired.splice(i,1);
                arsenal.player.shotsDirection.splice(i,1);
                arsenal.player.shotsTarget.splice(i,1);
            }
        }
    };

    //Show score
    ctx.fillStyle = "white";
    ctx.font = '24px arial';
    ctx.fillText(("Score: " + arsenal.player.score), 10, 50);

    //Collision system
    for(var i = 0 ; arsenal.enemies.ghostsX[i] ; i++){
        var enemy = arsenal.shape.ghost( arsenal.enemies.ghostsX[i] , arsenal.enemies.ghostsY[i] );
        for(var j = 0 ; arsenal.player.shotsFired[j] ; j++) {
            var shot = arsenal.player.shotsFired[j];
            if(ctx.isPointInPath(enemy, shot[0], shot[1]) ){
                arsenal.enemies.ghostsX.splice(i,1);
                arsenal.enemies.ghostsY.splice(i,1);
                arsenal.player.shotsFired.splice(j,1);
                arsenal.player.shotsDirection.splice(j,1);
                arsenal.player.shotsTarget.splice(j,1);
                arsenal.player.score += 1;
            };
        };
    };

    //draws player
    if(arsenal.player.x >= 770){
        arsenal.player.x = 770;
    } else if(arsenal.player.x <= 10){
        arsenal.player.x = 10;
    }
    if(arsenal.player.direction == "still"){
        ctx.drawImage(
            arsenal.player.ship, 
            arsenal.player.sprites.still[arsenal.currentSprite].sx, 
            arsenal.player.sprites.still[arsenal.currentSprite].sy, 
            arsenal.player.sprites.still[arsenal.currentSprite].swidth, 
            arsenal.player.sprites.still[arsenal.currentSprite].sheight, 
            arsenal.player.x, 550, 32, 48
            );
    }
    if (arsenal.player.direction == "right"){
        ctx.save();
        ctx.scale(-1,1);
        ctx.drawImage(
            arsenal.player.ship, 
            arsenal.player.sprites.moving[arsenal.currentSprite].sx, 
            arsenal.player.sprites.moving[arsenal.currentSprite].sy, 
            arsenal.player.sprites.moving[arsenal.currentSprite].swidth, 
            arsenal.player.sprites.moving[arsenal.currentSprite].sheight, 
            -arsenal.player.x, 550, -32, 48
            );
        ctx.restore();
    };
    if (arsenal.player.direction == "left"){
        ctx.drawImage(
            arsenal.player.ship, 
            arsenal.player.sprites.moving[arsenal.currentSprite].sx, 
            arsenal.player.sprites.moving[arsenal.currentSprite].sy, 
            arsenal.player.sprites.moving[arsenal.currentSprite].swidth, 
            arsenal.player.sprites.moving[arsenal.currentSprite].sheight, 
            arsenal.player.x, 550, 32, 48
            );
    };
    
    //Draws weapon equiped
    if(arsenal.player.weaponEquiped == "blaster"){
        ctx.drawImage(arsenal.images.weapons, 24, 0, 24, 24, 10, 60, 50, 50);
    }
    if(arsenal.player.weaponEquiped == "machine blaster"){
        ctx.drawImage(arsenal.images.weapons, 24, 24, 24, 24, 10, 60, 50, 50);
    }

    //Losing condition
    for(var i = 0 ; arsenal.enemies.ghostsY[i] ; i++){
        if(arsenal.enemies.ghostsY[i] >= 538){
            window.cancelAnimationFrame(arsenal.stopScene);
            ctx.clearRect(0,0, 800, 600);
            ctx.fillStyle = 'black';
            ctx.font = '42px arial';
            ctx.fillText("Vous avez perdu !", 200, 300);
            ctx.fillText(("Votre Score: " + arsenal.player.score), 200, 350);
            return
        };
    };

    //progression - Level 2
    if(arsenal.player.score > 20 && arsenal.currentLevel == 1){
        if(arsenal.levelTransition == false){
            setTimeout(function(){
                arsenal.variables.enemieCount += 5;
                arsenal.currentLevel = 2;
                arsenal.levelTransition = false;
            }, 5000);

        };
        arsenal.levelTransition = true;
        ctx.fillStyle = 'white';
        ctx.font = '42px arial';
        ctx.fillText("Niveau 2 !", 200, 300);
        ctx.font = '24px arial';
        ctx.fillText("Machine blaster Unlocked! - Press W to equip", 200, 352);
    }
    //progression - Level 3
    if(arsenal.player.score > 60 && arsenal.currentLevel == 2){
        if(arsenal.levelTransition == false){
            setTimeout(function(){
                arsenal.variables.ghostSpeed = 1.2;
                arsenal.currentLevel = 3;
                arsenal.levelTransition = false;
            }, 5000);

        };
        arsenal.levelTransition = true;
        ctx.fillStyle = 'white';
        ctx.font = '42px arial';
        ctx.fillText("Niveau 3 !", 200, 300);
        ctx.font = '24px arial';
        ctx.fillText("Boogies fly faster!", 200, 352);
    }

    //loop
    arsenal.stopScene = window.requestAnimationFrame(mainLoop);
};

//*****************//
//Input handlers   //
//*****************//

var addListeners = function(){

    //player mouvement
    window.addEventListener("keydown", function(event){
        var key = event.key;
        if(key == "d"){
            if(arsenal.player.moving != null) {
                clearInterval(arsenal.player.moving);
            };
            arsenal.player.moving = setInterval(function(){
                arsenal.player.x += 1;
            }, arsenal.player.speed);
            arsenal.player.direction = "right";
        } 
        if (key == "q") {
            if(arsenal.player.moving != null) {
                clearInterval(arsenal.player.moving);
            };
            arsenal.player.moving = setInterval(function(){
                arsenal.player.x -= 1;
            }, arsenal.player.speed);
            arsenal.player.direction = "left";
        }
        if (key == "w" && (arsenal.currentLevel >= 2 || arsenal.levelTransition == true)){    //Weapon shift
            if(arsenal.player.weaponEquiped == "blaster"){
                arsenal.player.weaponEquiped = "machine blaster";
            } else {
                arsenal.player.weaponEquiped = "blaster";
            };
        };
    });

    window.addEventListener("keyup", function(event){
        var key = event.key;
        if((key == "d" && arsenal.player.direction == "right") || (key == "q" && arsenal.player.direction == "left") ){
            clearInterval(arsenal.player.moving);
            arsenal.player.moving = null;
            arsenal.player.direction = "still";
        }
    });

    //for targeting and shooting
    var canvas = document.getElementById("stage")
    var shooting;
    var cible = [];

    canvas.style.cursor = "url(" + arsenal.images.aim.src + ") 32 32, default";

    canvas.addEventListener("mousedown", function(event){
        //Player shooting - blaster
        if(arsenal.player.weaponEquiped == "blaster"){
            arsenal.audio.shot[arsenal.audio.shotLoop].play();
            arsenal.audio.shotLoop++;
            if(arsenal.audio.shotLoop == 10){arsenal.audio.shotLoop = 0;};
            arsenal.player.shotsFired.push([arsenal.player.x+16,550]);
            var coordX = event.clientX - event.target.offsetLeft;
            var coordY = event.clientY - event.target.offsetTop;
            arsenal.player.shotsTarget.push([coordX,coordY]);
        };
        // Player shooting - Machine blaster
        if(arsenal.player.weaponEquiped == "machine blaster"){
            shooting = window.setInterval(function(){
                arsenal.audio.shot[arsenal.audio.shotLoop].play();
                arsenal.audio.shotLoop++;
                if(arsenal.audio.shotLoop == 10){arsenal.audio.shotLoop = 0;};
                arsenal.player.shotsFired.push([arsenal.player.x+16,550]);
                arsenal.player.shotsTarget.push(cible);
            }, 100);
        };
    });

    //Player shooting - machine blaster
    canvas.addEventListener("mousemove", function(event){
        cible[0] = event.clientX - event.target.offsetLeft;
        cible[1] = event.clientY - event.target.offsetTop;
    });
    
    canvas.addEventListener("mousedown", function(event){
    });

    canvas.addEventListener("mouseup", function(event){
        window.clearInterval(shooting);
    });
};