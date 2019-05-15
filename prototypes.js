"use strict";

/*
===============================
Prototype des Armes
===============================
*/

var weapons = {
    blaster: {
        type: "blaster shot",
        damage: 1,
        speed: 10,
        draw: function(){
            // ctx.fillStyle = "aqua";
            this.path(this.x, this.y);
            ctx.fill();
        },
        path: function(x,y){
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI*2 );
            ctx.closePath();
        },
        onCollision: function(){
            console.log("hit!");
        }
    },
    missile: {
        type: "missile",
        damage: 3,
        acceleration: 0.2,
        draw: function(){
            ctx.fillStyle = "#de5cff";
            ctx.save();
            ctx.translate(this.x, this.y)
            ctx.rotate((Math.PI / 180) * this.angle);
            this.path();
            ctx.fill();
            ctx.restore();
        },
        path: function(x,y){
            ctx.beginPath();
            ctx.moveTo(0, -5);
            ctx.lineTo(0, 5);
            ctx.lineTo(12,0);
            ctx.closePath();
        },
        follow: function(obj){
            auxFunc.findAngle(this);
            this.x += this.directionX;
            this.y += this.directionY;
            if(obj.type === "hunter"){
                this.destX = obj.x+16;
                this.destY = obj.y+16;
            } else {
                this.destX = obj.x;
                this.destY = obj.y;
            }
            this.speed += this.acceleration;
            this.directionX = null;
            this.directionY = null;
            // var b = obj.x - this.x - this.directionX;
            // var c = obj.y - this.y - this.directionY;
            // var a = Math.sqrt( (b*b) + (c*c) );
            // var increaseSpeed = a / this.acceleration;
            // var newDirectionX = b / increaseSpeed;
            // var newDirectionY = c / increaseSpeed;
            // this.directionX += newDirectionX;
            // this.directionY += newDirectionY;

            // var deltaX = newDirectionX - this.directionX;
            // var deltaY = newDirectionY - this.directionY;
            // if(deltaX > 0){
            //     this.directionX += Math.abs(newDirectionX);
            // }
            // if(deltaX < 0){
            //     this.directionX -= Math.abs(newDirectionX);
            // }
            // if(deltaY > 0){
            //     this.directionY += Math.abs(newDirectionY);
            // }
            // if(deltaY < 0){
            //     this.directionY -= Math.abs(newDirectionY);
            // }
        },
        stopAndRetarget: function(){
            if(this.speed > 0){
                this.x += this.directionX;
                this.y += this.directionY;
                this.destX += this.directionX;
                this.destY += this.directionY;
                this.directionX = null;
                this.directionY = null;
                this.speed -= this.acceleration;
            } else {
                this.target = auxFunc.findTarget();
            }
        }
    },
    laser: {
        draw: function(){
            ctx.lineWidth = 3;
            this.path(arsenal.player.ship.x+16, arsenal.player.ship.y);
            ctx.strokeStyle = auxFunc.randomColor();
            ctx.stroke();
        },
        path: function(x,y){
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x,0);
            ctx.closePath();
        },
        recharge: function(){
            // this.rechargeStarted = setTimeout(function(){
                this.recharging = setInterval(function(){ 
                    if(arsenal.player.battery >= 1000){
                        arsenal.player.battery = 1000;
                        clearInterval(this.recharging);
                        this.recharging = null;
                        // this.rechargeStarted = null;
                    } else {
                        arsenal.player.battery += 5;
                    }
                },250);
            // }, 2000);
        },
        // rechargeStarted: null,
        recharging: null
    },
    megaBomb: {
        draw: function(){
            ctx.fillStyle = "white";
            this.path();
            ctx.fill();
        },
        path: function(){
            ctx.beginPath();
            ctx.arc(400, 300, this.frames[this.currentSprite]*4, 0, Math.PI*2 );
            ctx.closePath();
        },
        explode: function(){
            for(var i = 0 ; arsenal.existant[i] ; i++){
                    arsenal.existant[i].hp -= 50;
            };
        }
    },
    shield: {
        draw: function(){
            ctx.strokeStyle = "aqua";
            ctx.lineWidth = 3;
            this.path(32);
            ctx.stroke();
        },
        path: function(radius){
            ctx.beginPath();
            ctx.arc(arsenal.player.ship.x+16, arsenal.player.ship.y+16, radius+(arsenal.currentSprite*2), 0, Math.PI*2);
            ctx.closePath();
        },
        reflect: function(shot){
            var deltaX = shot.x - (arsenal.player.ship.x+16);
            var deltaY = shot.y - (arsenal.player.ship.y+16);
            shot.destX = shot.x + deltaX;
            shot.destY = shot.y + deltaY;
            // shot.directionX = null;
            // shot.directionY = null;
            // auxFunc.calcMove(shot);
            arsenal.shots.push(AddBlasterShot(shot.x,shot.y,shot.destX,shot.destY));
        }
    }
};

/*
===============================
Prototype des Enemies
===============================
*/

var enemies = {
    ghost: {
        type: "ghost",
        halfWidth: 16,
        sprites: {
            still: [{
                sx: 0,
                sy: 112,
                swidth: 32,
                sheight: 32
            },{
                sx: 32,
                sy: 112,
                swidth: 32,
                sheight: 32
            }],
            moving: [{
                sx: 64,
                sy: 112,
                swidth: 32,
                sheight: 32
            },{
                sx: 96,
                sy: 112,
                swidth: 32,
                sheight: 32
            }],
        },
        draw: function(){
            ctx.save();
            ctx.rotate(Math.PI);
            ctx.drawImage(
                arsenal.images.ship, 
                this.sprites.still[arsenal.currentSprite].sx, 
                this.sprites.still[arsenal.currentSprite].sy, 
                this.sprites.still[arsenal.currentSprite].swidth, 
                this.sprites.still[arsenal.currentSprite].sheight,
                -this.x-16, -(this.y)-16, 32, 32
                );
            ctx.restore();
        },
        speed: 0.7,
        path: function(x,y){
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI*2);
            ctx.closePath();
            // ctx.fill();
        }         
    },
    hunter: {
        type: "hunter",
        halfWidth: 16,
        nextCannon: "right",
        sprites: {
            still: [{
                sx: 0,
                sy: 80,
                swidth: 32,
                sheight: 32
            },{
                sx: 32,
                sy: 80,
                swidth: 32,
                sheight: 32
            }],
            moving: [{
                sx: 64,
                sy: 80,
                swidth: 32,
                sheight: 32
            },{
                sx: 96,
                sy: 80,
                swidth: 32,
                sheight: 32
            }],
        },
        draw: function(){
            ctx.save();
            ctx.rotate(Math.PI);
            ctx.drawImage(
                arsenal.images.ship, 
                this.sprites.still[arsenal.currentSprite].sx, 
                this.sprites.still[arsenal.currentSprite].sy, 
                this.sprites.still[arsenal.currentSprite].swidth, 
                this.sprites.still[arsenal.currentSprite].sheight,
                -this.x-32, -(this.y)-25, 32, 32
                );
            ctx.restore();
        },
        speed: 0.8,
        path: function(x,y){
            ctx.beginPath();
            ctx.rect(x, y, 32, 25);
            ctx.closePath();
            // ctx.fill();
        },
        shoot: function(){
            if(auxFunc.rollDice(10)){
                if(this.nextCannon === "right"){
                    this.nextCannon = "left";
                    arsenal.enemyShots.push(AddBlasterShot(this.x+28,this.y+20,this.x,630));
                } else {
                    this.nextCannon = "right";
                    arsenal.enemyShots.push(AddBlasterShot(this.x+4,this.y+20,this.x,630));
                }
            }
        }
    }
};

/*
===============================
Animations
===============================
*/

var fx = {
    explosion: {
        frames: [
            [192,192],
            [128,192],
            [64,192],
            [0,192],
            [192,128],
            [128,128],
            [64,128],
            [0,128],
            [192,64],
            [128,64],
            [64,64],
            [0,64],
            [192,0],
            [128,0],
            [64,0],
            [0,0],
            [64,0],
            [128,0],
            [192,0],
            [0,64],
            [64,64],
            [128,64],
            [192,64],
            [0,128],
            [64,128],
            [128,128],
            [192,128],
            [0,192],
            [64,192],
            [128,192],
            [192,192],
        ],
        draw: function(){
            ctx.drawImage(
                arsenal.images.explosion, 
                fx.explosion.frames[this.currentSprite][0], 
                fx.explosion.frames[this.currentSprite][1], 
                64, 64, this.x, this.y, this.size, this.size
                );
        },
    }
}

/*
===============================
Fonctions usines
===============================
*/

var AddBlasterShot = (function (){
    var blasterShot = function(x,y,destX,destY){
        this.x = x;
        this.y = y;
        this.destX = destX || null;
        this.destY = destY || null;
        this.directionX = null;
        this.directionY = null;
    }
    blasterShot.prototype = weapons.blaster;
    return function (x,y,destX,destY) {
        return new blasterShot(x,y,destX,destY);
    }
}());

var AddMissile = (function (){
    var CreateMissile = function(x,y,destX,destY,target){
        this.x = x;
        this.y = y;
        this.destX = destX || null;
        this.destY = destY || null;
        this.directionX = null;
        this.directionY = null;
        this.speed = 0.1;
        this.angle = 0;
        this.target = target;
    }
    CreateMissile.prototype = weapons.missile;
    return function (x,y,destX,destY,target) {
        return new CreateMissile(x,y,destX,destY,target);
    }
}());

var AddGhost = (function(){
    var CreateGhost = function(x,y,destX,destY){
        this.x = x;
        this.y = y;
        this.destX = destX;
        this.destY = destY;
        this.directionX = null;
        this.directionY = null;
        this.hp = 1;
    }
    CreateGhost.prototype = enemies.ghost;
    return function (x,y,destX,destY) {
        return new CreateGhost(x,y,destX,destY);
    }
}());

var AddHunter = (function(){
    var CreateHunter = function(x,y,destX,destY){
        this.x = x;
        this.y = y;
        this.destX = destX;
        this.destY = destY;
        this.directionX = null;
        this.directionY = null;
        this.hp = 3;
    }
    CreateHunter.prototype = enemies.hunter;
    return function (x,y,destX,destY) {
        return new CreateHunter(x,y,destX,destY);
    }
}());

var AddExplosion = (function(){
    var CreateExplosion = function(x,y,size){
        this.x = x;
        this.y = y;
        this.size = size;
        this.currentSprite = 0;
    };
    CreateExplosion.prototype = fx.explosion;
    return function(x,y,size){
        return new CreateExplosion(x,y,size);
    };
}());

var AddMegaBomb = (function(){
    var CreateMegaExplosion = function(){
        this.frames = [];
        this.radius = 0;
        this.currentSprite = 0;
        for(var i = 0 ; i < 101 ; i++){ //i va servir comme frames et aussi comme radius
            this.frames.push(i);
        };
        this.explode();
        console.log("BOOOM!");
    };
    CreateMegaExplosion.prototype = weapons.megaBomb;
    return function(){
        return new CreateMegaExplosion();
    };
}());