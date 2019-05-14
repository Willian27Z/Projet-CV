"use strict";
var showMenu = function () {
    var menu = document.getElementById("mymenu");
    var margin = menu.style.marginLeft;
    if (margin === "" || parseInt(margin) < 0 ) {
        menu.style.marginLeft = 0;
    } else {
        menu.style.marginLeft = "-200px";
    }
};

var sound = function () {
    var soundIcon = document.getElementById("sound");
    if (soundIcon.alt == "sound-on") {
        soundIcon.src = "images/sound-off.png";
        soundIcon.alt = "sound-off"
    } else {
        soundIcon.src = "images/sound-on.png";
        soundIcon.alt = "sound-on";
    };
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

var ctx;

var arsenal = {
    globalVariables: {
        enemieCount: 6,
    },
    currentSprite: 0,
    currentLevel: 1,
    levelTransition: false,
    toNextLevel: 20,
    init: function(){
        var stage = document.getElementById("stage");
        ctx = stage.getContext("2d");
        
        //Creates new enemies
        
        for(var i = 0 ; i < this.globalVariables.enemieCount/2 ; i++){
            this.existant.push(AddGhost(auxFunc.randomXPosition(), 100, null, 600));
            this.existant[i].destX = this.existant[i].x;
            this.existant.push(AddHunter(auxFunc.randomXPosition(), 100, null, 600));
            this.existant[i].destX = this.existant[i].x;
        };

        //Images loading
        this.images.ship = new Image();
        this.images.ship.src = "images/ships_human.png"; 
        this.images.background = new Image();
        this.images.background.src = "images/seamless_space.png"
        this.images.background.position = 0;
        this.images.nebula = new Image();
        this.images.nebula.src = "images/Nebula1.png"
        this.images.nebula.position = -700;
        this.images.weapons = new Image();
        this.images.weapons.src = "images/qubodup_ringicons.svg"
        this.images.aim = new Image();
        this.images.aim.src = "images/direction.png"
        this.images.explosion = new Image();
        this.images.explosion.src = "images/exp.png"
        
        //Sprite changer

        this.spriteKeeper = window.setInterval(function(){
            if(arsenal.currentSprite == 0){
                arsenal.currentSprite = 1;
            } else { arsenal.currentSprite = 0; }
        }, 80);
        
        this.fxSpriteKeeper = window.setInterval(function(){
            if(arsenal.fxEnCours){  //s'il y a des fx à faire
                for(var i = 0; arsenal.fxEnCours[i]; i++){  // pour chaque effet
                    if(arsenal.fxEnCours[i].currentSprite < arsenal.fxEnCours[i].frames.length-1){ //si l'animation n'est pas finit
                        arsenal.fxEnCours[i].currentSprite++; // prochain sprite
                    } else { // si plus de sprite à montrer
                        arsenal.fxEnCours.splice(i,1); //annuler animation
                    }
                };
            };
        },15);

        //audio load and start

        this.audio.bgMusic = new Audio('sound/battle_theme.mp3');
        this.audio.bgMusic.play();
        this.audio.shot = [];
        this.audio.missile = [];
        this.audio.explosion = [];
        for(var i = 0 ; i < 10; i++){
            arsenal.audio.missile.push(new Audio('sound/rlaunch.wav'));
            arsenal.audio.shot.push(new Audio('sound/laserfire01.ogg'));
            arsenal.audio.explosion.push(new Audio('sound/rumble.flac'));
        };
        this.audio.laser = new Audio('sound/burst fire.mp3');
        this.audio.laser.loop = true;

        //Add inputs
        addListeners();

        //Enter Main Loop
        this.stopScene = mainLoop();
    },
    images: {},   
    audio: {
        shotLoop: 0,
        mute: false
    },
    player: {
        score: 0,
        levelScore: 0,
        health: 100,
        moving: null,
        direction: "still",
        weaponEquiped: "blaster",
        speed: 5,
        laser: false,
        battery: 1000,
        missilesAmmo: 50,
        ship: {
            x: 386,
            y: 550,
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
            draw: function(){
                if(arsenal.player.direction == "still"){
                    ctx.drawImage(
                        arsenal.images.ship, 
                        arsenal.player.ship.sprites.still[arsenal.currentSprite].sx, 
                        arsenal.player.ship.sprites.still[arsenal.currentSprite].sy, 
                        arsenal.player.ship.sprites.still[arsenal.currentSprite].swidth, 
                        arsenal.player.ship.sprites.still[arsenal.currentSprite].sheight, 
                        arsenal.player.ship.x, arsenal.player.ship.y, 32, 48
                        );
                };
                if (arsenal.player.direction == "right"){
                    ctx.save();
                    ctx.scale(-1,1);
                    ctx.drawImage(
                        arsenal.images.ship, 
                        arsenal.player.ship.sprites.moving[arsenal.currentSprite].sx, 
                        arsenal.player.ship.sprites.moving[arsenal.currentSprite].sy, 
                        arsenal.player.ship.sprites.moving[arsenal.currentSprite].swidth, 
                        arsenal.player.ship.sprites.moving[arsenal.currentSprite].sheight, 
                        -(arsenal.player.ship.x), arsenal.player.ship.y, -32, 48
                        );
                    ctx.restore();
                };
                if (arsenal.player.direction == "left"){
                    ctx.drawImage(
                        arsenal.images.ship, 
                        arsenal.player.ship.sprites.moving[arsenal.currentSprite].sx, 
                        arsenal.player.ship.sprites.moving[arsenal.currentSprite].sy, 
                        arsenal.player.ship.sprites.moving[arsenal.currentSprite].swidth, 
                        arsenal.player.ship.sprites.moving[arsenal.currentSprite].sheight, 
                        arsenal.player.ship.x, arsenal.player.ship.y, 32, 48
                        );
                };
                // this.path();
            },
            path: function(){
                // ctx.fillStyle = "white";
                ctx.beginPath();
                ctx.moveTo(arsenal.player.ship.x,arsenal.player.ship.y+48);
                ctx.lineTo(arsenal.player.ship.x+32,arsenal.player.ship.y+48);
                ctx.lineTo(arsenal.player.ship.x+16,arsenal.player.ship.y);
                ctx.closePath();
                // ctx.fill();
            }
        },
    },
    existant: [],   //enemies
    enemyShots: [], //enemy shots
    shots: [],      //blaster shots and missiles
    fxEnCours: [], // Effets à faire
};

//====================================
//  MAIN LOOP
//====================================
var mainLoop = function(){
    
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
    //draw Nebula
    if(arsenal.images.nebula.position < 1000){
        ctx.drawImage(arsenal.images.nebula,50,arsenal.images.nebula.position);
        arsenal.images.nebula.position += 0.3;
    }

    // Drawing Dead-Line
    ctx.lineWidth = 1;
    ctx.beginPath();    
    ctx.moveTo(0, 550);
    ctx.lineTo(800, 550);
    ctx.closePath();
    ctx.strokeStyle = "red";
    ctx.stroke();
    
    //adding more ghosts
    while (arsenal.existant.length < arsenal.globalVariables.enemieCount){
        if(auxFunc.rollDice(50)){
            arsenal.existant.push(AddGhost( auxFunc.randomXPosition(), -20, auxFunc.randomXPosition(), 600));
        } else {
            arsenal.existant.push(AddHunter( auxFunc.randomXPosition(), -20, auxFunc.randomXPosition(), 600));
        }
    };

    //Draw Enemies
    for(var i = 0 ; arsenal.existant[i] ; i++){
        auxFunc.calcMove(arsenal.existant[i]);
        arsenal.existant[i].draw();
        if(arsenal.existant[i].shoot){
            arsenal.existant[i].shoot();
        }
        //Losing condition
        if(arsenal.existant[i].y >= 538){
            auxFunc.gameOver();
        };
    };
    
    //draws shots
    for(var i = 0 ; arsenal.shots[i] ; i++){
        ctx.fillStyle = "aqua";
        arsenal.shots[i].draw();
        auxFunc.calcMove(arsenal.shots[i]);
        //clean-up
        if( (arsenal.shots[i].type === "blaster shot") && (arsenal.shots[i].x < -4 || arsenal.shots[i].x > 804 || arsenal.shots[i].y < -4) ) {
            arsenal.shots.splice(i,1);
        }
    };

    //draws enemy shots
    for(var i = 0 ; arsenal.enemyShots[i] ; i++){
        ctx.fillStyle = "red";
        arsenal.enemyShots[i].draw();
        auxFunc.calcMove(arsenal.enemyShots[i]);
        //clean-up
        if (arsenal.enemyShots[i].y > 610) {
            arsenal.enemyShots.splice(i,1);
        }
    };

    // draws Laser 
    if((arsenal.player.laser == true) && (arsenal.player.battery > 0)){
        weapons.laser.draw();
        arsenal.player.battery -= 2;
    }

    //Show score
    ctx.fillStyle = "white";
    ctx.font = '24px arial';
    ctx.fillText(("Score: " + arsenal.player.score), 10, 50);
    //Show Player health
    ctx.fillText(("Health: " + arsenal.player.health), 10, 75);

    //Collision system for player shots
    for(var i = 0 ; arsenal.existant[i] ; i++){     //pour chaque enemie existant
        arsenal.existant[i].path(arsenal.existant[i].x,arsenal.existant[i].y);

        if((arsenal.player.laser == true) && (arsenal.player.battery > 0)) {          //si jouer tire le laser
            // for(var y = arsenal.player.ship.y; y >= 0 ; y-=31){
            //     if(ctx.isPointInPath(arsenal.player.ship.x+16, y) ){ //si le laser est dans l'enemie "i"
            //     arsenal.existant.splice(i,1);
            //     arsenal.player.score += 1;
            //     };
            // };
            if(arsenal.existant[i].type === "ghost"){
                if((arsenal.existant[i].x - arsenal.existant[i].halfWidth < arsenal.player.ship.x + 16) && (arsenal.existant[i].x + arsenal.existant[i].halfWidth > arsenal.player.ship.x + 16)){
                    arsenal.existant[i].hp--;
                }
            }
            if(arsenal.existant[i].type === "hunter"){
                if(((arsenal.player.ship.x + 16) > arsenal.existant[i].x) && ((arsenal.player.ship.x + 16) < arsenal.existant[i].x+32)){
                    arsenal.existant[i].hp--;
                }
            }
        };

        for(var j = 0 ; arsenal.shots[j] ; j++) {   //pour chaque tire
            var shot = arsenal.shots[j];
            if(ctx.isPointInPath(shot.x, shot.y) ){ //si le tire "j" x,y est dans l'enemie "i"
                arsenal.existant[i].hp -= arsenal.shots[j].damage;
                arsenal.shots.splice(j,1);
            };
        };

        //exploding enemies
        if (arsenal.existant[i].hp <= 0){
            if(arsenal.existant[i].type === "ghost"){
                arsenal.fxEnCours.push(AddExplosion(arsenal.existant[i].x-14, arsenal.existant[i].y-10,32))
            }
            if(arsenal.existant[i].type === "hunter"){
                arsenal.fxEnCours.push(AddExplosion(arsenal.existant[i].x, arsenal.existant[i].y-12,48))
            }
             //Audio
             arsenal.audio.explosion[arsenal.audio.shotLoop].play();
             arsenal.audio.shotLoop++;
             if(arsenal.audio.shotLoop == 10){arsenal.audio.shotLoop = 0;};
            arsenal.existant.splice(i,1);
            arsenal.player.score += 1;
            arsenal.player.levelScore += 1;
        }
    };

    //Collision system for Enemy shots
    arsenal.player.ship.path();
    for(var i = 0 ; arsenal.enemyShots[i] ; i++){     //pour chaque enemy shot
        if(ctx.isPointInPath(arsenal.enemyShots[i].x, arsenal.enemyShots[i].y) ){
            arsenal.player.health -= 2;
            arsenal.enemyShots.splice(i,1);
        };
        if(arsenal.player.health <= 0){
            auxFunc.gameOver();
        };
    };

    //Draws FXs
    for(var i = 0; arsenal.fxEnCours[i]; i++){
        arsenal.fxEnCours[i].draw();
    }

    //draws player
    if(arsenal.player.ship.x >= 756){
        arsenal.player.ship.x = 756;
    } else if(arsenal.player.ship.x <= 10){
        arsenal.player.ship.x = 10;
    }
    arsenal.player.ship.draw();
    
    //Draws weapon equiped
    // if(arsenal.player.weaponEquiped == "blaster"){
    //     ctx.drawImage(arsenal.images.weapons, 24, 0, 24, 24, 10, 60, 50, 50);
    // }
    // if(arsenal.player.weaponEquiped == "machine blaster"){
    //     ctx.drawImage(arsenal.images.weapons, 24, 24, 24, 24, 10, 60, 50, 50);
    // }
    // ctx.drawImage(arsenal.images.weapons, 48, 0, 24, 24, 10, 120, 50, 50);

    //Draws health
    ctx.fillStyle = "white";
    ctx.fillRect(10, 90, 110, 9);
    ctx.fillStyle = "red";
    ctx.fillRect(15, 92, arsenal.player.health, 5);

    //Draws laser bar
    weapons.laser.drawBattery();
    
    //Draws Missile ammo
    ctx.fillStyle = "white";
    ctx.font = '24px arial';
    ctx.fillText(("Missiles: " + arsenal.player.missilesAmmo), 10, 210);
    
    //Draws bar to next level
    ctx.fillStyle = "white";
    ctx.fillRect(10, 300, 13, 103);
    ctx.fillStyle = "green";
    ctx.fillRect(13, 400, 7, -(arsenal.player.levelScore*(100/arsenal.toNextLevel)));

    //progression - Level 2
    if((arsenal.player.score >= 20) && (arsenal.currentLevel === 1)){
        if(arsenal.levelTransition === false){
            arsenal.player.weaponEquiped = "machine blaster";
            arsenal.player.levelScore = 0;
            arsenal.toNextLevel = 60;
            setTimeout(function(){
                arsenal.globalVariables.enemieCount += 5;
                arsenal.currentLevel = 2;
                arsenal.levelTransition = false;
            }, 5000);
        };
        arsenal.levelTransition = true;
        ctx.fillStyle = 'white';
        ctx.font = '42px arial';
        ctx.fillText("Niveau 2 !", 200, 300);
        ctx.font = '24px arial';
        ctx.fillText("Machine blaster Unlocked!", 200, 352);
    }
    //progression - Level 3
    if(arsenal.player.score >= 60 && arsenal.currentLevel === 2){
        if(arsenal.levelTransition === false){
            arsenal.player.levelScore = 0;
            arsenal.toNextLevel = 100;
            setTimeout(function(){
                enemies.ghost.speed = 1.2;
                enemies.hunter.speed = 1.5;
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
// INPUT HANDLERS  //
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
                arsenal.player.ship.x += 1;
            }, arsenal.player.speed);
            arsenal.player.direction = "right";
        } 
        if (key == "q") {
            if(arsenal.player.moving != null) {
                clearInterval(arsenal.player.moving);
            };
            arsenal.player.moving = setInterval(function(){
                arsenal.player.ship.x -= 1;
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
        if (key == " "){
            arsenal.player.laser = true;
            arsenal.audio.laser.play();
            if(weapons.laser.recharging){
                clearInterval(weapons.laser.recharging);
            };
            weapons.laser.recharging = null;
        };
        if ((key == "z") && (arsenal.player.missilesAmmo > 0)){
            var missile = AddMissile(arsenal.player.ship.x+16,arsenal.player.ship.y,arsenal.player.ship.x+16,-10, auxFunc.findTarget() );
            arsenal.shots.push(missile);
            //Audio
            arsenal.audio.missile[arsenal.audio.shotLoop].play();
            arsenal.audio.shotLoop++;
            if(arsenal.audio.shotLoop == 10){arsenal.audio.shotLoop = 0;};
            arsenal.player.missilesAmmo--;
        }
    });

    window.addEventListener("keyup", function(event){
        var key = event.key;
        if((key == "d" && arsenal.player.direction == "right") || (key == "q" && arsenal.player.direction == "left") ){
            clearInterval(arsenal.player.moving);
            arsenal.player.moving = null;
            arsenal.player.direction = "still";
        };
        if (key == " "){
            arsenal.player.laser = false;
            arsenal.audio.laser.pause();
            if(weapons.laser.recharging == null){
                weapons.laser.recharge();
            };
        };
    });

    //for targeting and shooting
    var canvas = document.getElementById("stage")
    var shooting;
    var cible = {};

    canvas.style.cursor = "url(" + arsenal.images.aim.src + ") 32 32, default";

    canvas.addEventListener("mousedown", function(event){
        //Player shooting - blaster

        //Audio
        arsenal.audio.shot[arsenal.audio.shotLoop].play();
        arsenal.audio.shotLoop++;
        if(arsenal.audio.shotLoop == 10){arsenal.audio.shotLoop = 0;};
        //creates shot
        arsenal.shots.push(AddBlasterShot(arsenal.player.ship.x+16,arsenal.player.ship.y,cible.x,cible.y));

        // Player shooting - Machine blaster
        if(arsenal.player.weaponEquiped == "machine blaster"){
            shooting = window.setInterval(function(){
                //Audio
                arsenal.audio.shot[arsenal.audio.shotLoop].play();
                arsenal.audio.shotLoop++;
                if(arsenal.audio.shotLoop == 10){arsenal.audio.shotLoop = 0;};
                //creates shot
                arsenal.shots.push(AddBlasterShot(arsenal.player.ship.x+16,arsenal.player.ship.y,cible.x,cible.y));
            }, 100);
        };
    });

    //Continuous Targeting for machine blaster and others
    canvas.addEventListener("mousemove", function(event){
        cible.x = event.clientX - event.target.offsetLeft;
        cible.y = event.clientY - event.target.offsetTop;
    });

    canvas.addEventListener("mouseup", function(){
        window.clearInterval(shooting);
    });
};