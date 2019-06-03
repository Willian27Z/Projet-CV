"use strict";
var auxFunc = {
    calcMove: function(obj){
        if(obj.directionX === null || obj.directionY === null){
            var b = obj.destX - obj.x;
            var c = obj.destY - obj.y;
            var a = Math.sqrt( (b*b) + (c*c) );
            var temp = a / obj.speed;
            obj.directionX = b / temp;
            obj.directionY = c / temp;
        } else {
            obj.x += obj.directionX;
            obj.y += obj.directionY;
        };
        if(((obj.type === "ghost") || (obj.type === "hunter")) && (arsenal.currentLevel >= 2)){
            if(auxFunc.rollDice(0.5)){
                obj.destX = auxFunc.randomXPosition();
                obj.directionX = null;
            }
        }
        if(obj.type === "saucer"){
            if(( auxFunc.rollDice(0.5) ) || ( (obj.y > obj.destY-1) && (obj.y < obj.destY+1) ) || ( (obj.x > obj.destX-1) && (obj.x < obj.destX+1)  )){
                obj.destX = Math.floor(Math.random() * (740)) + 50;
                obj.destY = Math.floor(Math.random() * (400)) + 50;
                obj.directionX = null;
                obj.directionY = null;
            }
        }

        if(obj.type === "missile"){
            if(obj.target){
                if(obj.target.hp > 0){  
                    obj.follow(obj.target);
                } else {
                    obj.stopAndRetarget();
                }  
            } else {
                obj.target = auxFunc.findTarget();
            }
        }
    },
    // drawObject: function(ctx, obj){     //ctx => canvas 2d
    //     obj.draw()
    // },
    randomColor: function(){
        var color = "#";
        for(var i = 0 ; i < 6 ; i++){
            var dice = parseInt(Math.floor(Math.random() * (16)));
            dice -= 1;
            if(dice < 0){dice = 0};
            if(dice > 9){
                switch(dice){
                    case 10:
                        dice = "A";
                        break;
                    case 11:
                        dice = "B";
                        break;
                    case 12:
                        dice = "C";
                        break;
                    case 13:
                        dice = "D";
                        break;
                    case 14:
                        dice = "E";
                        break;
                    case 15:
                        dice = "F";
                        break;
                    default:
                        dice = 0;
                }
            };
            color += dice;
        };
        return color;
        
    },
    randomItem: function(){
        var dice = parseInt(Math.floor(Math.random() * (100)));
        if( (dice <= 10) && (arsenal.player.megaBombAmmo < 3) && (arsenal.currentLevel >= 4) ){
            return items.mongo;
        } 
        if(dice < 30 && arsenal.currentLevel >= 3){
            return items.bootstrap;
        } 
        if(dice < 60){
            return items.html;
        } else {
            return items.css;
        }
    },
    randomXPosition: function(){
        var temp = Math.floor(Math.random() * (780)) + 10;
        if(arsenal.currentLevel < 3){
            if(arsenal.existant.length == 1){
                while((arsenal.existant[0].x > temp-32) && (arsenal.existant[0].x < temp+32)){
                    temp = Math.floor(Math.random() * (780)) + 10;
                }
            }
            if(arsenal.existant.length >= 2){
                var xPositions = [];
                var spacesAvailable = [];
                var spacefound = false;
                for(var i = 0; arsenal.existant[i]; i++){
                    xPositions[i] = arsenal.existant[i].x;
                };
                xPositions.sort(function(a, b) {
                    return a - b;
                  });
                // console.log(xPositions);
                for(var i = 0; xPositions[i]; i++){
                    if((i == 0) && (xPositions[0] > 58) && (!spacesAvailable[0])){
                        spacesAvailable.push([10,xPositions[0]-16]);
                    } else if(!xPositions[i+1] && (xPositions[i] < 742)) {
                        spacesAvailable.push([xPositions[i]+16,790]);
                    } else {
                        if((xPositions[i+1] - xPositions[i]) > 64 ){
                            spacesAvailable.push([xPositions[i]+16,xPositions[i+1]-16]);
                        }
                    }
                };
                while(spacefound == false){
                    for(var i = 0; spacesAvailable[i]; i++){
                        if(temp-16 > spacesAvailable[i][0] && temp+16 < spacesAvailable[i][1]){
                            // console.log("spaces available: ", spacesAvailable);
                            // console.log("X chosen: "+ temp);
                            return temp;
                        }
                    }
                    temp = Math.floor(Math.random() * (780)) + 10;
                };
            }
        }
        return temp;
    },
    findTarget: function(){
        for(var i = arsenal.player.ship.y ; i>0 ; i-=2){
            for (var j = 0; arsenal.existant[j] ; j++){
                if((arsenal.existant[j].y > i) && (!arsenal.existant[j].targetedBy)){
                    arsenal.existant[j].targetedBy = this;
                    return arsenal.existant[j];
                }
            };
        };
    },
    findAngle: function(obj){
        var b = obj.destX - obj.x;
        var c = obj.destY - obj.y;
        var a = Math.hypot(c,b);
        obj.angle = Math.acos(b/a) * 360 / (Math.PI * 2);
        if(obj.y > obj.destY){
            obj.angle = -(obj.angle);
        }
    },
    rollDice: function(percentage){
        var dice = Math.random()*100;
        if(dice <= percentage){
            return true;
        } else {
            return false;
        }
    },
    gameOver: function(){
        window.cancelAnimationFrame(arsenal.stopScene);
        arsenal.audio.bgMusic.pause();
        arsenal.audio.mute = true;
        ctx.clearRect(0,0, 800, 600);
        ctx.fillStyle = 'black';
        ctx.fillRect(0,0,800,600);
        ctx.fillStyle = '#0a4998';
        ctx.font = '42px arial';
        ctx.fillText("Game Over!", 200, 250);
        ctx.fillText(("Votre Score: " + arsenal.player.score), 200, 300);
        ctx.fillText(("Niveau atteint: " + arsenal.currentLevel), 200, 350);
    },
    pause: function(cvPart){
        if(arsenal.paused){
            arsenal.paused = false;
            if(!arsenal.levelTransition){
                if(!arsenal.audio.mute){
                    arsenal.audio.bgMusic.play();
                }
                arsenal.stopScene = window.requestAnimationFrame(mainLoop);
            } else {
                arsenal.stopScene = window.requestAnimationFrame(arsenal.levelTransitionScene);
            }
        } else {
            window.cancelAnimationFrame(arsenal.stopScene);            
            arsenal.audio.bgMusic.pause();
            ctx.fillStyle = 'white';
            ctx.font = '42px arial';
            ctx.fillText("Game Paused", 250, 300);
            arsenal.paused = true;
            if(cvPart){
                ctx.drawImage(arsenal.images.cvParts[cvPart],0,0);
            }
        }
    },
    restart: function(){
        var stage = document.getElementById("stage");
        stage.onclick = null;
        var cvPart = document.getElementById("divers");
        cvPart.innerHTML = "";
        cvPart.className = "";
        cvPart = document.getElementById("experience");
        cvPart.innerHTML = "";
        cvPart.className = "";
        cvPart = document.getElementById("formation");
        cvPart.innerHTML = "";
        cvPart.className = "";
        cvPart = document.getElementById("competences");
        cvPart.innerHTML = "";
        cvPart.className = "";
        window.cancelAnimationFrame(arsenal.stopScene);

        clearInterval(levelTransition.textScroller);

        levelTransition.stopScene = null;
        levelTransition.textScroller = null;
        levelTransition.textLineOnScreen = 0;
        levelTransition.characterCounter = 0;
        levelTransition.textOnScreen = [""];
        levelTransition.cvAdded = false;
        levelTransition.finished = false;

        arsenal.player.weaponEquiped = "blaster";
        arsenal.player.score = 0;
        arsenal.player.levelScore = 0;
        arsenal.player.ship.x = 386;
        arsenal.player.health = 100;
        arsenal.player.battery = 1000;
        arsenal.player.missilesAmmo = 20;
        arsenal.player.shield = false;
        arsenal.player.megaBomb = false;
        arsenal.player.megaBombAmmo = 0;

        arsenal.levelTransition = false;
        arsenal.levelTransitionScene = false;
        arsenal.currentLevel = 1;
        arsenal.toNextLevel = 15;
        arsenal.goToNextLevel = false;
        arsenal.paused = false;
        arsenal.globalVariables.enemieCount = 5;
        arsenal.existant = [];
        arsenal.enemyShots = [];
        arsenal.shots = [];
        arsenal.fxEnCours = [];
        arsenal.items = [];
        arsenal.audio.mute = false;

        for(var i = 0 ; i < arsenal.globalVariables.enemieCount ; i++){
            arsenal.existant.push(AddGhost(auxFunc.randomXPosition(), -20, null, 600));
            arsenal.existant[i].destX = arsenal.existant[i].x;
        };

        arsenal.audio.bgMusic.currentTime = 0;
        if(!arsenal.audio.mute){
            arsenal.audio.bgMusic.play();
        }

        arsenal.stopScene = mainLoop();
    }

}
