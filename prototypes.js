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
        limit: 0,
        draw: function(){
            ctx.lineWidth = 3;
            this.path(arsenal.player.ship.x+16, arsenal.player.ship.y);
            ctx.strokeStyle = auxFunc.randomColor();
            ctx.stroke();
        },
        path: function(x,y){
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, this.limit);
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
        type: "Mega Bomb",
        draw: function(){
            ctx.fillStyle = "white";
            this.path();
            ctx.fill();
        },
        path: function(){
            ctx.beginPath();
            ctx.arc(this.x, 550, this.frames[this.currentSprite]*7, 0, Math.PI*2 );
            ctx.closePath();
        },
        onCompletion: function(){
            arsenal.player.megaBomb = false;
        }
    },
    shield: {
        draw: function(){
            //gradient test
            var grd = ctx.createRadialGradient(arsenal.player.ship.x+16, arsenal.player.ship.y+24, 25, arsenal.player.ship.x+16, arsenal.player.ship.y+24, 45);
            grd.addColorStop(0, "rgb(93,255,255, 0)");
            grd.addColorStop(0.5, "rgb(93,255,255, 1)");
            grd.addColorStop(1, "rgb(93,255,255, 0)");
            ctx.strokeStyle = grd;
            this.path(32);
            // ctx.fillStyle = "red";
            // ctx.fill()
            //
            // ctx.strokeStyle = "aqua";
            ctx.lineWidth = 5;
            ctx.stroke();
        },
        path: function(radius){
            ctx.beginPath();
            ctx.arc(arsenal.player.ship.x+16, arsenal.player.ship.y+24, radius/*+(arsenal.currentSprite*2)*/, 0, Math.PI*2);
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
Prototype des Items
===============================
*/

var items = {
    html: {
        draw: function(){
            ctx.drawImage(arsenal.images.itemHtml, this.x, this.y);
        },
        onPickUp: function(){
            arsenal.player.health += 10;
            if(arsenal.player.health > 100){
                arsenal.player.health = 100;
            }
        }
    },
    bootstrap: {
        draw: function(){
            ctx.drawImage(arsenal.images.itemBootstrap, this.x, this.y);
        },
        onPickUp: function(){
            arsenal.player.missilesAmmo += 5;
        }
    },
    mongo: {
        draw: function(){
            ctx.drawImage(arsenal.images.itemMongo, this.x, this.y);
        },
        onPickUp: function(){
            arsenal.player.megaBombAmmo += 1;
        }
    },
    css: {
        draw: function(){
            ctx.drawImage(arsenal.images.itemCss, this.x, this.y);
        },
        onPickUp: function(){
            arsenal.player.battery += 100;
            if(arsenal.player.battery > 1000){
                arsenal.player.battery = 1000;
            }
        }
    }
}

/*
===============================
Prototype des Enemies
===============================
*/

var enemies = {
    ghost: {
        type: "ghost",
        halfWidth: 16,
        speed: 0.7,
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
            // moving: [{
            //     sx: 64,
            //     sy: 112,
            //     swidth: 32,
            //     sheight: 32
            // },{
            //     sx: 96,
            //     sy: 112,
            //     swidth: 32,
            //     sheight: 32
            // }],
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
        speed: 0.8,
        nextCannon: "right",
        shootChance: 5,
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
            // moving: [{
            //     sx: 64,
            //     sy: 80,
            //     swidth: 32,
            //     sheight: 32
            // },{
            //     sx: 96,
            //     sy: 80,
            //     swidth: 32,
            //     sheight: 32
            // }],
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
        path: function(x,y){
            ctx.beginPath();
            ctx.rect(x, y, 32, 25);
            ctx.closePath();
            // ctx.fill();
        },
        shoot: function(){
            if(auxFunc.rollDice(this.shootChance)){
                if(this.nextCannon === "right"){
                    this.nextCannon = "left";
                    arsenal.enemyShots.push(AddBlasterShot(this.x+28,this.y+20,this.x,630));
                } else {
                    this.nextCannon = "right";
                    arsenal.enemyShots.push(AddBlasterShot(this.x+4,this.y+20,this.x,630));
                }
            }
        }
    },
    saucer: {
        type: "saucer",
        halfWidth: 48,
        speed: 1,
        shootChance: 5,
        sprites: {
            closed: {
                sx: 0,
                sy: 494,
                swidth: 96,
                sheight: 90
            },
            change: [{
                sx: 96,
                sy: 494,
                swidth: 96,
                sheight: 90
            },{
                sx: 192,
                sy: 494,
                swidth: 96,
                sheight: 90
            },{
                sx: 288,
                sy: 494,
                swidth: 96,
                sheight: 90
            }],
            opened: [{
                sx: 384,
                sy: 494,
                swidth: 96,
                sheight: 90
            },{
                sx: 480,
                sy: 494,
                swidth: 96,
                sheight: 90
            },{
                sx: 576,
                sy: 494,
                swidth: 96,
                sheight: 90
            }],
        },
        draw: function(){
            ctx.save();
            ctx.translate(this.x, this.y)
            ctx.rotate(this.angle * (Math.PI/180));
            if(this.currentState === "closed"){
                ctx.drawImage(
                    arsenal.images.saucer, 
                    this.sprites.closed.sx, 
                    this.sprites.closed.sy, 
                    this.sprites.closed.swidth, 
                    this.sprites.closed.sheight,
                    -48, -45, 96, 90
                    );
            }
            if(this.currentState === "change"){
                ctx.drawImage(
                    arsenal.images.saucer, 
                    this.sprites.change[this.currentSprite].sx, 
                    this.sprites.change[this.currentSprite].sy, 
                    this.sprites.change[this.currentSprite].swidth, 
                    this.sprites.change[this.currentSprite].sheight,
                    -48, -45, 96, 90
                    );
            }
            if(this.currentState === "opened"){
                ctx.drawImage(
                    arsenal.images.saucer, 
                    this.sprites.opened[this.currentSprite].sx, 
                    this.sprites.opened[this.currentSprite].sy, 
                    this.sprites.opened[this.currentSprite].swidth, 
                    this.sprites.opened[this.currentSprite].sheight,
                    -48, -45, 96, 90
                    );
                }
            ctx.restore();
            // pour debuger le bouclier
            // ctx.strokeStyle = "blue";
            // ctx.lineWidth = 2;
            // this.pathShield(this.x,this.y);
            // ctx.stroke();
            // ctx.fillStyle = "red";
            // this.path(this.x,this.y);
            // ctx.fill();
        },
        pathShield: function(x,y){
            ctx.save();
            ctx.translate(x, y)
            ctx.rotate(this.angle * (Math.PI/180));
            if(this.currentState === "closed"){
                ctx.beginPath();
                ctx.arc(0, -2, 36, 0, Math.PI*2);
                ctx.closePath();
            } else {
                ctx.beginPath();
                ctx.arc(-13, -10, 34, 153*(Math.PI/180), 267*(Math.PI/180), false);
                ctx.moveTo(16,-44);
                ctx.arc(13, -10, 34, 290*(Math.PI/180), 25*(Math.PI/180), false);
                ctx.moveTo(0,15);
                ctx.arc(0, 10, 34, 145*(Math.PI/180), 33*(Math.PI/180), true);
                ctx.closePath();
            }
            ctx.restore();
        },
        path: function(x,y){
            ctx.beginPath();
            ctx.arc(x, y-2, 15, 0, Math.PI*2);
            ctx.closePath();
        },
        changeState: function(){
            if((this.currentState === "closed") && (auxFunc.rollDice(0.8))){
                this.previousState = "closed";
                this.currentState = "change";
                this.currentSprite = 0;
                this.spriteIncrease = true;
            }
            if((this.currentState === "opened") && (auxFunc.rollDice(0.5))){
                this.previousState = "opened";
                this.currentState = "change";
                this.currentSprite = 2;
                this.spriteIncrease = false;
            }
            if((this.currentState === "change")){
                if((this.previousState === "closed") && (this.currentSprite === 2)){
                    this.currentState = "opened";
                }
                if((this.previousState === "opened") && (this.currentSprite === 0)) {
                    this.currentState = "closed";
                }
            }
        },
        shoot: function(){
            if(auxFunc.rollDice(this.shootChance)){
                arsenal.enemyShots.push(AddBlasterShot(this.x,this.y,arsenal.player.ship.x,560));
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
            // [192,192],
            // [128,192],
            // [64,192],
            // [0,192],
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
        onCompletion: null,
    },
    fadeOut: {
        draw: function(){
            ctx.fillStyle = "rgb(0,0,0, " + this.frames[this.currentSprite] + ")";
            ctx.fillRect(0,0,800,600);
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

var AddSaucer = (function(){
    var CreateSaucer = function(x,y,destX,destY){
        this.x = x;
        this.y = y;
        this.destX = destX;
        this.destY = destY;
        this.directionX = null;
        this.directionY = null;
        this.hp = 5;
        // states: "closed","change","opened",
        this.currentState = "opened";
        this.currentSprite = 0;
        this.angle = 0;
        this.spriteIncrease = true;
        var thisEnemy = this;
        this.rotator = setInterval(function(){
            thisEnemy.angle++;
            if(thisEnemy.angle >= 360){thisEnemy.angle = 0;}
        },50);
        this.spriteChanger = setInterval(function(){
            if(thisEnemy.spriteIncrease){
                thisEnemy.currentSprite++;
                if(thisEnemy.currentSprite === 2){
                    thisEnemy.spriteIncrease = false;
                }
            } else {
                thisEnemy.currentSprite--;
                if(thisEnemy.currentSprite === 0){
                    thisEnemy.spriteIncrease = true;
                }
            }
        },200);
    }
    CreateSaucer.prototype = enemies.saucer;
    return function (x,y,destX,destY) {
        return new CreateSaucer(x,y,destX,destY);
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
        this.x = arsenal.player.ship.x+16;
        this.frames = [];
        this.radius = 0;
        this.currentSprite = 0;
        for(var i = 0 ; i < 101 ; i++){ //i va servir comme frames et aussi comme radius
            this.frames.push(i);
        };
        arsenal.player.megaBomb = this;
    };
    CreateMegaExplosion.prototype = weapons.megaBomb;
    return function(){
        return new CreateMegaExplosion();
    };
}());

var AddItem = function(x,y,type){
    this.x = x;
    this.y = y;
    this.destX = x;
    this.destY = 700;
    this.directionX = null;
    this.directionY = null;
    this.speed = 1;
    this.draw = type.draw;
    this.onPickUp = type.onPickUp;
};

var AddFadeOut = (function(){
    var CreateFadeOut = function(onCompletion){
        this.frames = [];
        this.currentSprite = 0;
        for(var i = 0 ; i < 100 ; i++){ //i va servir comme transparence
            this.frames.push(i/100);
        };
        this.onCompletion = onCompletion;
    };
    CreateFadeOut.prototype = fx.fadeOut;
    return function(onCompletion){
        return new CreateFadeOut(onCompletion);
    };
}());

