"use strict";
var showMenu = function () {
    var menu = document.getElementById("mymenu");
    // var margin = menu.style.marginLeft;
    if(menu.className === "slideLeft" || menu.className === ""){
        // menu.style.marginLeft = 0;
        menu.className = "slideRight";
    } else {
        menu.className = "slideLeft";
        // menu.style.marginLeft = "-200px";
    }
    // if (margin === "" || parseInt(margin) < 0 ) {
    //     menu.className = "fadeIn";
    // } else {
    //     menu.className = "";
    // }
};

var sound = function () {
    var soundIcon = document.getElementById("sound");
    if (soundIcon.alt == "sound-on") {
        soundIcon.src = "images/sound-off.png";
        soundIcon.alt = "sound-off";
        arsenal.audio.mute = true;
        if(arsenal.audio.bgMusic){
            arsenal.audio.bgMusic.pause();
        }
    } else {
        soundIcon.src = "images/sound-on.png";
        soundIcon.alt = "sound-on";
        arsenal.audio.mute = false;
        if(arsenal.audio.bgMusic){
            arsenal.audio.bgMusic.play();
        }
    };
};

var start = function () {
    var container = document.getElementById("container");
    container.innerHTML = '<canvas id="stage" width="800" height="600"></canvas>';
    var canvas = document.getElementById("stage");
    // canvas.style.border = "1px black solid";
    // canvas.style.marginTop = "20px";
    var restart = document.createElement("button");
    restart.innerText = "Restart";
    restart.className = "start fadeIn";
    restart.onclick = auxFunc.restart;
    container.append(restart);
    arsenal.init();
};

//*****************//
//Main game Object //
//*****************//

var ctx;

var arsenal = {
    globalVariables: {
        enemieCount: 5,
    },
    currentSprite: 0,
    currentLevel: 1,
    levelTransition: false,
    levelTransitionScene: null,
    toNextLevel: 15,
    goToNextLevel: false,
    paused: false,
    init: function(){
        var stage = document.getElementById("stage");
        ctx = stage.getContext("2d");
        
        //Creates new enemies
        
        for(var i = 0 ; i < this.globalVariables.enemieCount ; i++){
            // this.existant.push(AddSaucer(300+(i*50), 130+(i*100), null, null));
             
            this.existant.push(AddGhost(auxFunc.randomXPosition(), -20, null, 600));
            this.existant[i].destX = this.existant[i].x;
            // this.existant.push(AddHunter(auxFunc.randomXPosition(), -20, null, 600));
            // this.existant[i].destX = this.existant[i].x;
        };

        //Images loading
        for(var i = 0 ; arsenal.imagesSources[i] ; i++){
            arsenal.images[arsenal.imagesSources[i]] = new Image();
            arsenal.images[arsenal.imagesSources[i]].src = "images/" + arsenal.imagesSources[i] + ".png";
        }
        arsenal.images.background.position = 0;
        arsenal.images.nebula.position = -700;
        for(var i = 0 ; arsenal.cvParts[i] ; i++){
            arsenal.images.cvParts[arsenal.cvParts[i]] = new Image();
            arsenal.images.cvParts[arsenal.cvParts[i]].src = "images/" + arsenal.cvParts[i] + ".jpg";
        }

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
                        if(arsenal.fxEnCours[i].onCompletion){
                            arsenal.fxEnCours[i].onCompletion();
                        }
                        arsenal.fxEnCours.splice(i,1); //stop animation
                    }
                };
            };
        },15);

        //audio load and start

        this.audio.bgMusic = new Audio('sound/battletheme.mp3');
        this.audio.bgMusic.loop = true;
        this.audio.bgMusic.play();
        this.audio.shot = [];
        this.audio.missile = [];
        this.audio.explosion = [];
        for(var i = 0 ; i < 10; i++){
            arsenal.audio.missile.push(new Audio('sound/rlaunch.wav'));
            arsenal.audio.shot.push(new Audio('sound/laserfire01.ogg'));
            arsenal.audio.explosion.push(new Audio('sound/rumble.flac'));
        };
        this.audio.laser = new Audio('sound/burstfire.mp3');
        this.audio.laser.loop = true;

        //Add inputs
        addListeners();

        //Enter Main Loop
        this.stopScene = mainLoop();
    },
    images: {
        cvParts: {},
    },
    imagesSources: ["ship","saucer","background","nebula","aim","explosion","itemCss","itemHtml","itemJs","itemBootstrap","itemMongo","itemAngular","itemNode","itemJQuery","jsLogo"],
    cvParts: ["divers","competences","formation","experience"],
    jsBar: 0,
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
        missilesAmmo: 20,
        megaBombAmmo: 3,
        shield: false,
        megaBomb: false,
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
            },
            path: function(){
                ctx.beginPath();
                ctx.moveTo(arsenal.player.ship.x,arsenal.player.ship.y+48);
                ctx.lineTo(arsenal.player.ship.x+32,arsenal.player.ship.y+48);
                ctx.lineTo(arsenal.player.ship.x+16,arsenal.player.ship.y);
                ctx.closePath();
            }
        },
    },
    existant: [],   //enemies
    enemyShots: [], //enemy shots
    shots: [],      //blaster shots and missiles
    fxEnCours: [], // Effets à faire
    items: [],      //items to be pick up
};

//====================================
//  MAIN LOOP
//====================================
var mainLoop = function(){
    
    //adding more ghosts
    while (arsenal.existant.length < arsenal.globalVariables.enemieCount){
        if(arsenal.currentLevel === 1){
            var destx = auxFunc.randomXPosition();
            arsenal.existant.push(AddGhost(destx, -20, destx, 600));
        }
        if(arsenal.currentLevel === 2){
            var destx = auxFunc.randomXPosition()
            arsenal.existant.push(AddGhost(auxFunc.randomXPosition(), -20, auxFunc.randomXPosition(), 600));
        }
        if((arsenal.currentLevel >= 4) && (auxFunc.rollDice(5))){
            arsenal.existant.unshift(AddSaucer( auxFunc.randomXPosition(), -150, auxFunc.randomXPosition(), 400));
        }
        if((arsenal.currentLevel >= 3) && auxFunc.rollDice(30)){
            arsenal.existant.push(AddGhost( auxFunc.randomXPosition(), -150, auxFunc.randomXPosition(), 600));
        } else if (arsenal.currentLevel >= 3){
            arsenal.existant.push(AddHunter( auxFunc.randomXPosition(), -150, auxFunc.randomXPosition(), 600));
        }
        // arsenal.existant.push(AddGhost( auxFunc.randomXPosition(), -150, auxFunc.randomXPosition(), 400));
    };

    // Sorts saucers enemies
    arsenal.existant.sort(function (a, b) {
        return a.y - b.y;
      });
    arsenal.existant.sort(function (a, b) {
        return b.type - a.type;
      });

    //clear previous frame
    ctx.clearRect(0,0, 800, 600);
    
    //===============================
    // DRAWING STARTS HERE
    //===============================
    
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
    

    //Draw + moves Enemies
    for(var i = 0 ; arsenal.existant[i] ; i++){
        auxFunc.calcMove(arsenal.existant[i]);
        arsenal.existant[i].draw();
        if((arsenal.existant[i].type === "hunter") && (arsenal.existant[i].y > 0)){
            arsenal.existant[i].shoot();
        }
        if(arsenal.existant[i].type === "saucer"){
            arsenal.existant[i].changeState();
            if(arsenal.existant[i].currentState === "opened"){
                arsenal.existant[i].shoot();
            }
        }
        //Losing condition
        if(arsenal.existant[i].y >= 538){
            auxFunc.gameOver();
            return "Game Over!";
        };

        // ctx.fillStyle = 'white';
        // ctx.font = '24px arial';
        // ctx.fillText("Angle: " + arsenal.existant[i].angle, 200, 40);

    };
    
    //draws + moves player shots
    for(var i = 0 ; arsenal.shots[i] ; i++){
        ctx.fillStyle = "aqua";
        arsenal.shots[i].draw();
        auxFunc.calcMove(arsenal.shots[i]);
        //clean-up, removes enemy shots outside window
        if( (arsenal.shots[i].type === "blaster shot") && (arsenal.shots[i].x < -4 || arsenal.shots[i].x > 804 || arsenal.shots[i].y < -4) ) {
            arsenal.shots.splice(i,1);
        }
    };

    //draws + moves enemy shots
    for(var i = 0 ; arsenal.enemyShots[i] ; i++){
        ctx.fillStyle = "red";
        arsenal.enemyShots[i].draw();
        auxFunc.calcMove(arsenal.enemyShots[i]);
        //clean-up, removes enemy shots outside window
        if (arsenal.enemyShots[i].y > 610) {
            arsenal.enemyShots.splice(i,1);
        }
    };

    //Draws + moves items
    for(var i = 0; arsenal.items[i]; i++){
        auxFunc.calcMove(arsenal.items[i]);
        arsenal.items[i].draw();
        //clean-up, removes enemy shots outside window
        if (arsenal.items[i].y > 600) {
            arsenal.items.splice(i,1);
        }
    }

    // draws Laser 
    if((arsenal.player.laser == true) && (arsenal.player.battery > 0)){
        weapons.laser.draw();
        arsenal.player.battery -= 2;
    }

    //draws shield
    if((arsenal.player.shield === true) && (arsenal.player.battery > 0)){
        weapons.shield.draw();
        arsenal.player.battery -= 1;
        if(arsenal.player.battery <= 0){
            arsenal.player.shield = false;
            if(weapons.laser.recharging === null){
                weapons.laser.recharge();
            }
        };
    }

    //===============================
    // COLLISION SYSTEM STARTS HERE
    //===============================

    //for player shots
    var noSaucer = true;
    for(var i = 0 ; arsenal.existant[i] ; i++){     //pour chaque enemie existant
        arsenal.existant[i].path(arsenal.existant[i].x,arsenal.existant[i].y);

        //si jouer tire le laser
        if((arsenal.player.laser === true) && (arsenal.player.battery > 0)) {   
            
            //special laser collision for saucers
            if(arsenal.existant[i].type === "saucer"){
                
                if(arsenal.existant[i].currentState === "opened"){
                    if(((arsenal.player.ship.x + 16) > arsenal.existant[i].x-46) && ((arsenal.player.ship.x + 16) < arsenal.existant[i].x+46  && (arsenal.existant[i].y+46 >= weapons.laser.limit)  )){
                        
                        // if(
                        //     (arsenal.existant[i].angle >= 0 && arsenal.existant[i].angle <= 46) ||
                        //     (arsenal.existant[i].angle >= 81 && arsenal.existant[i].angle <= 163) ||
                        //     (arsenal.existant[i].angle >= 181 && arsenal.existant[i].angle <= 263) ||
                        //     (arsenal.existant[i].angle >= 298 && arsenal.existant[i].angle <= 360) 
                        // ){
                        arsenal.existant[i].pathShield(arsenal.existant[i].x,arsenal.existant[i].y);
                        var hit = false;
                        for(var l = arsenal.existant[i].y+46 ; (l >= arsenal.existant[i].y-46) && !hit; l--){
                            var noSaucer = false;
                            if(ctx.isPointInPath(arsenal.player.ship.x + 16, l)){
                                weapons.laser.limit = l;
                                hit = true;
                            } else {
                                weapons.laser.limit = 0;
                            }
                        } 
                        if (
                            ((arsenal.player.ship.x + 16) > arsenal.existant[i].x-7.5) && 
                            ((arsenal.player.ship.x + 16) < arsenal.existant[i].x+7.5 && 
                            (arsenal.existant[i].y+18 >= weapons.laser.limit))
                        ){
                            arsenal.existant[i].hp--;
                        }
                    }
                } else {
                    arsenal.existant[i].pathShield(arsenal.existant[i].x,arsenal.existant[i].y);
                    var hit = false;
                    for(var l = arsenal.existant[i].y+46 ; (l >= arsenal.existant[i].y-46) && !hit; l--){
                        if(ctx.isPointInPath(arsenal.player.ship.x + 16, l)){
                            weapons.laser.limit = l;
                            hit = true;
                            var noSaucer = false;
                        } 
                        else {
                            // weapons.laser.limit = 0;
                        }
                    } 
                    
                    // if(((arsenal.player.ship.x + 16) > arsenal.existant[i].x-36) && ((arsenal.player.ship.x + 16) < arsenal.existant[i].x+36)   && (arsenal.existant[i].y+36 > weapons.laser.limit)   ){
                    //     weapons.laser.limit = arsenal.existant[i].y+36
                    // } else {
                    //     weapons.laser.limit = 0;
                    // }
                }
            }
            
            //laser coliision for saucers ends here

            if(arsenal.existant[i].type === "ghost"){
                if((arsenal.existant[i].x - arsenal.existant[i].halfWidth < arsenal.player.ship.x + 16) && (arsenal.existant[i].x + arsenal.existant[i].halfWidth > arsenal.player.ship.x + 16) && (arsenal.existant[i].y+12 > weapons.laser.limit) ){
                    arsenal.existant[i].hp--;
                }
            }
            if(arsenal.existant[i].type === "hunter"){
                if(((arsenal.player.ship.x + 16) > arsenal.existant[i].x) && ((arsenal.player.ship.x + 16) < arsenal.existant[i].x+32) && (arsenal.existant[i].y+12 > weapons.laser.limit)){
                    arsenal.existant[i].hp--;
                }
            }
        };
        //laser colision ends here
        

        //pour chaque blaster shot and missile
        for(var j = 0 ; arsenal.shots[j] ; j++) {   
            var shot = arsenal.shots[j];
            if(arsenal.existant[i].type === "saucer"){ //si colision avec bouclier du saucer
                arsenal.existant[i].pathShield(arsenal.existant[i].x,arsenal.existant[i].y);
                if(ctx.isPointInPath(shot.x, shot.y) ){
                    if(arsenal.shots[j].type === "missile"){
                        arsenal.shots[j].target.targetedBy = undefined;
                        arsenal.fxEnCours.push(AddExplosion(arsenal.shots[j].x, arsenal.shots[j].y,20))
                    }
                    arsenal.shots.splice(j,1);
                }
                arsenal.existant[i].path(arsenal.existant[i].x,arsenal.existant[i].y);
            }
            if(ctx.isPointInPath(shot.x, shot.y) ){ //si le tire "j" x,y est dans l'enemie "i"
                arsenal.existant[i].hp -= arsenal.shots[j].damage;
                if(arsenal.shots[j].type === "missile"){
                    arsenal.shots[j].target.targetedBy = undefined;
                }
                arsenal.shots.splice(j,1);
            };
        };

        //Pour Mega Bombe
        if((arsenal.player.megaBomb) && (ctx.isPointInPath(arsenal.existant[i].x, arsenal.existant[i].y, arsenal.player.megaBomb.path() ))){
            arsenal.existant[i].hp--;
        }

        //exploding enemies
        if (arsenal.existant[i].hp <= 0){
            
            //Adds explosion fx
            if(arsenal.existant[i].type === "ghost"){
                arsenal.fxEnCours.push(AddExplosion(arsenal.existant[i].x-14, arsenal.existant[i].y-10,32))
            };
            if(arsenal.existant[i].type === "hunter"){
                arsenal.fxEnCours.push(AddExplosion(arsenal.existant[i].x, arsenal.existant[i].y-12,48))
            };
            if(arsenal.existant[i].type === "saucer"){
                arsenal.fxEnCours.push(AddExplosion(arsenal.existant[i].x-48, arsenal.existant[i].y-45,96))
            }
            
            //Audio
            if(!arsenal.audio.mute){
                arsenal.audio.explosion[arsenal.audio.shotLoop].play();
                arsenal.audio.shotLoop++;
                if(arsenal.audio.shotLoop == 10){arsenal.audio.shotLoop = 0;};
            }
            
            //chance to drop item
            if(auxFunc.rollDice(7)){
                //console.log("new item!");
                arsenal.items.push(new AddItem(arsenal.existant[i].x, arsenal.existant[i].y, auxFunc.randomItem()));
            };
            arsenal.existant.splice(i,1);
            arsenal.player.score += 1;
            arsenal.player.levelScore += 1;
        }
    };
    if(noSaucer){
        weapons.laser.limit = 0; //reinitialise le laser si pas de saucers
    }

    //Collision system for Enemy shots
    for(var i = 0 ; arsenal.enemyShots[i] ; i++){     //pour chaque enemy shot
        if(arsenal.player.shield === true) {
            weapons.shield.path(38);
        } else {
            arsenal.player.ship.path();
        }
        if(ctx.isPointInPath(arsenal.enemyShots[i].x, arsenal.enemyShots[i].y) ){
            if(arsenal.player.shield === true) {
                weapons.shield.reflect(arsenal.enemyShots[i]);
            } else {
                arsenal.player.health -= 2;
            }
            arsenal.enemyShots.splice(i,1);
        };
        if(arsenal.player.health <= 0){
            auxFunc.gameOver();
            return "Game Over!";
        };
    };

    //Collision for items
    for(var i = 0; arsenal.items[i]; i++){
        if(arsenal.items[i].y >= 530){
            if((arsenal.items[i].x > arsenal.player.ship.x-20) && (arsenal.items[i].x < arsenal.player.ship.x+32)){
                arsenal.items[i].onPickUp();
                arsenal.items.splice(i,1)
            };
        };
    };

    //===============================
    //  COLLISION ENDS HERE
    //===============================

    //Draws FXs
    for(var i = 0; arsenal.fxEnCours[i]; i++){
        arsenal.fxEnCours[i].draw();
    }

    //Limite bordure pour player
    if(arsenal.player.ship.x >= 756){
        arsenal.player.ship.x = 756;
    } else if(arsenal.player.ship.x <= 10){
        arsenal.player.ship.x = 10;
    }

    //draws player ship
    arsenal.player.ship.draw();

    //===============================
    //  UI ELEMENTS
    //===============================
    
    //Show score
    ctx.fillStyle = "white";
    ctx.font = '24px arial';
    ctx.fillText(("Score: " + arsenal.player.score), 10, 34);
    
    //Shows level
    ctx.fillStyle = "white";
    ctx.font = '24px arial';
    ctx.fillText(("Niveau: " + arsenal.currentLevel), 130, 34);

    //HTML icon
    ctx.drawImage(arsenal.images.itemHtml, 10, 39);

    //Draws health bar
    ctx.fillStyle = "white";
    ctx.fillRect(40, 49, 110, 10);
    ctx.fillStyle = "#e44d26";
    ctx.fillRect(45, 51, arsenal.player.health, 6);

    //CSS icon
    ctx.drawImage(arsenal.images.itemCss, 10, 74);

    //Battery bar
    ctx.fillStyle = "white";
    ctx.fillRect(40, 84, 110, 10);
    ctx.fillStyle = "#264de4";
    ctx.fillRect(45, 86, arsenal.player.battery/10, 6);

    //JS icon
    ctx.drawImage(arsenal.images.itemJs, 10, 109);

    //Draws bar to next level
    ctx.fillStyle = "white";
    ctx.fillRect(40, 119, 110, 10);
    ctx.fillStyle = "#d3b72f";
    arsenal.jsBar = arsenal.player.levelScore*(100/arsenal.toNextLevel);
    if(arsenal.jsBar > 100){arsenal.jsBar = 100;}
    ctx.fillRect(45, 121, arsenal.jsBar, 6);

    if(arsenal.currentLevel >= 2){
        //JQuery icon
        ctx.drawImage(arsenal.images.itemJQuery, 10, 145);
    };
    
    if(arsenal.currentLevel >= 3){
        //Angular laser
        ctx.drawImage(arsenal.images.itemAngular, 45, 145);
        
        //Bootstrap icon
        // ctx.fillStyle = "white";
        // ctx.fillRect(10, 143, 100, 34)
        ctx.drawImage(arsenal.images.itemBootstrap, 10, 180);
        
        //Draws Missile ammo
        ctx.fillStyle = "#8956d8";
        ctx.font = '24px arial';
        ctx.fillText(" x " + arsenal.player.missilesAmmo, 40, 207);
    };

    if(arsenal.currentLevel >= 4){
        //Node shield
        ctx.drawImage(arsenal.images.itemNode, 80, 145);
        
        //Mongo (mega bomb) ammo
        for(var i = 0 ; i < arsenal.player.megaBombAmmo; i++){
            ctx.drawImage(arsenal.images.itemMongo, 10+(i*35), 215);
        }
    }

    //===============================
    //  PROGRESSION
    //===============================

    if((arsenal.player.levelScore >= arsenal.toNextLevel) && (!arsenal.levelTransition) && arsenal.currentLevel < 5){
        arsenal.levelTransition = true;
        arsenal.fxEnCours.push(AddFadeOut(levelTransition.init));
    }

    if(arsenal.player.levelScore >= arsenal.toNextLevel && arsenal.currentLevel >= 5){
        arsenal.player.levelScore = 0;
        arsenal.toNextLevel = 20;
        arsenal.globalVariables.enemieCount += 2;
        arsenal.currentLevel++;
    }

    //loop
    if(arsenal.goToNextLevel){
        return
    }
    if(!arsenal.paused){
        arsenal.stopScene = window.requestAnimationFrame(mainLoop);
    };
};


//*****************//
// INPUT HANDLERS  //
//*****************//

var addListeners = function(){

    //for targeting and shooting
    var canvas = document.getElementById("stage")
    var shooting;
    var cible = {};

    //player mouvement
    window.addEventListener("keydown", function(event){
        var key = event.key;
        if(!arsenal.paused){
            if(key === "d"){
                if(arsenal.player.moving != null) {
                    clearInterval(arsenal.player.moving);
                };
                arsenal.player.moving = setInterval(function(){
                    arsenal.player.ship.x += 1;
                }, arsenal.player.speed);
                arsenal.player.direction = "right";
            } 
            if (key === "q") {
                if(arsenal.player.moving != null) {
                    clearInterval(arsenal.player.moving);
                };
                arsenal.player.moving = setInterval(function(){
                    arsenal.player.ship.x -= 1;
                }, arsenal.player.speed);
                arsenal.player.direction = "left";
            }
            if (key === " " && arsenal.currentLevel >= 3){
                arsenal.player.laser = true;
                if(!arsenal.audio.mute){
                    arsenal.audio.laser.play();
                }
                if(weapons.laser.recharging){
                    clearInterval(weapons.laser.recharging);
                };
                weapons.laser.recharging = null;
            };
            if ((key === "z") && (arsenal.player.missilesAmmo > 0) && arsenal.currentLevel >= 3){
                var missile = AddMissile(arsenal.player.ship.x+16,arsenal.player.ship.y,arsenal.player.ship.x+16,-10, auxFunc.findTarget() );
                arsenal.shots.push(missile);
                //Audio
                if(!arsenal.audio.mute){
                    arsenal.audio.missile[arsenal.audio.shotLoop].play();
                    arsenal.audio.shotLoop++;
                    if(arsenal.audio.shotLoop == 10){arsenal.audio.shotLoop = 0;};
                }
                arsenal.player.missilesAmmo--;
            }
            if ((key === "Enter") && arsenal.currentLevel >= 4 && (arsenal.player.megaBomb === false) && (arsenal.player.megaBombAmmo > 0)){
                arsenal.player.megaBombAmmo--;
                arsenal.fxEnCours.push(AddMegaBomb());
            };
            if (key === "e" && arsenal.currentLevel >= 4){
                arsenal.player.shield = !arsenal.player.shield;
                if((arsenal.player.shield === false) && (weapons.laser.recharging === null)){
                    weapons.laser.recharge();
                };
            }
        }
        if (key === "p"){
            window.clearInterval(shooting);
            auxFunc.pause();
        }
    });

    window.addEventListener("keyup", function(event){
        var key = event.key;
        if(!arsenal.paused){
            if((key === "d" && arsenal.player.direction === "right") || (key === "q" && arsenal.player.direction === "left") ){
                clearInterval(arsenal.player.moving);
                arsenal.player.moving = null;
                arsenal.player.direction = "still";
            };
            if (key === " "){
                arsenal.player.laser = false;
                arsenal.audio.laser.pause();
                if(weapons.laser.recharging === null){
                    weapons.laser.recharge();
                };
            };
        }
    });

    canvas.style.cursor = "url(" + arsenal.images.aim.src + ") 32 32, default";

    canvas.addEventListener("mousedown", function(event){
        //Player shooting - blaster
        if(!arsenal.paused){
            if(!arsenal.audio.mute){
                arsenal.audio.shot[arsenal.audio.shotLoop].play();
                arsenal.audio.shotLoop++;
                if(arsenal.audio.shotLoop == 10){arsenal.audio.shotLoop = 0;};
            }
            //creates shot
            arsenal.shots.push(AddBlasterShot(arsenal.player.ship.x+16,arsenal.player.ship.y,cible.x,cible.y));
    
            // Player shooting - Machine blaster
            if(arsenal.player.weaponEquiped == "machine blaster"){
                shooting = window.setInterval(function(){
                    //Audio
                    if(!arsenal.audio.mute){
                        arsenal.audio.shot[arsenal.audio.shotLoop].play();
                        arsenal.audio.shotLoop++;
                        if(arsenal.audio.shotLoop == 10){arsenal.audio.shotLoop = 0;};
                    }
                    //creates shot
                    arsenal.shots.push(AddBlasterShot(arsenal.player.ship.x+16,arsenal.player.ship.y,cible.x,cible.y));
                }, 100);
            };
        }
    });
            
        //Audio

    //Continuous Targeting for machine blaster and others
    canvas.addEventListener("mousemove", function(event){
        cible.x = event.clientX - event.target.offsetLeft;
        cible.y = event.clientY - event.target.offsetTop;
    });

    canvas.addEventListener("mouseup", function(){
        window.clearInterval(shooting);
    });
};