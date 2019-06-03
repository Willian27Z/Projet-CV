"use strict";

var levelTransition = {
    wasMuted: false,
    stopScene: null,
    textScroller: null,
    textLineOnScreen: 0,
    characterCounter: 0,
    textOnScreen: [""],
    cvAdded: false,
    finished: false,
    init: function(){
        arsenal.levelTransitionScene = levels[arsenal.currentLevel+1].scene;
        arsenal.goToNextLevel = true;
        if(!arsenal.audio.mute){
            arsenal.audio.mute = true;
            levelTransition.wasMuted = true;
        }
        arsenal.audio.bgMusic.pause();
        var stage = document.getElementById("stage");
        if(levelTransition.textScroller === null){
            levelTransition.textScroller = setInterval(function(){
                if(!arsenal.paused){

                    if(levels[arsenal.currentLevel+1].text[levelTransition.textLineOnScreen] && 
                        (levelTransition.characterCounter < levels[arsenal.currentLevel+1].text[levelTransition.textLineOnScreen].length)){
                            levelTransition.textOnScreen[levelTransition.textLineOnScreen] += levels[arsenal.currentLevel+1].text[levelTransition.textLineOnScreen][levelTransition.characterCounter];
                            levelTransition.characterCounter++;
                    } else {
                        levelTransition.textOnScreen.push("");
                        levelTransition.textLineOnScreen++;
                        levelTransition.characterCounter = 0;
                        //console.log("new line");
                    }
                    if(levelTransition.textLineOnScreen >= levels[arsenal.currentLevel+1].text.length && !levelTransition.finished){
                        levelTransition.finished = true;
                        //console.log("text over");
                        clearInterval(levelTransition.textScroller);
                            
                        stage.onclick = function(){
                            stage.onclick = null;
                            levelTransition.stopScene = null,
                            levelTransition.textScroller = null,
                            levelTransition.textLineOnScreen = 0,
                            levelTransition.characterCounter = 0,
                            levelTransition.textOnScreen = [""],
                            levelTransition.cvAdded = false,
                            levelTransition.finished = false,
                            window.cancelAnimationFrame(arsenal.stopScene);
                            
                            //reseting the game for next level
                            arsenal.existant = [];
                            arsenal.enemyShots = [];
                            arsenal.shots = [];
                            arsenal.fxEnCours = [];
                            arsenal.items = [];
                            arsenal.player.levelScore = 0;
                            arsenal.player.ship.x = 386;
                            arsenal.player.health = 100;
                            arsenal.player.battery = 1000;
                            arsenal.goToNextLevel = false;
                            arsenal.levelTransition = false;
    
                            //Make the level specific changes
                            levels[arsenal.currentLevel+1].makeChanges();
    
                            //sound
                            if(levelTransition.wasMuted){
                                arsenal.audio.mute = false;
                                levelTransition.wasMuted = false;
                            }
                            arsenal.audio.bgMusic.currentTime = 0;
                            if(!arsenal.audio.mute){
                                arsenal.audio.bgMusic.play();
                            }
                            //start main loop again
                            arsenal.stopScene = window.requestAnimationFrame(mainLoop);
                        };
                    }
                }
            },50);

        }
        stage.onclick = function(){
            if(!arsenal.paused){
                levelTransition.textOnScreen[levelTransition.textLineOnScreen] = levels[arsenal.currentLevel+1].text[levelTransition.textLineOnScreen];
                levelTransition.characterCounter = levels[arsenal.currentLevel+1].text[levelTransition.textLineOnScreen].length;
                levelTransition.textOnScreen.push("");
                levelTransition.textLineOnScreen++;
                levelTransition.characterCounter = 0;
            }
        }
        levels[arsenal.currentLevel+1].scene();
    }
}

var levels = {
    2: {
        text: [
        "Niveau 1 completé!",
        "Avec le code JS récupéré nous avons débloqué une partie du CV:",
        "L'arme ' jQuery blaster ' a été installé sur votre vaisseau.",
        "Vous pouvez maintenir la souris appuyé pour tirer constament.",
        "Alert! Une nouvelle vague s'approche!",
        "On compte sur vous! Bon courage",
        "(Click pour continuer...)"
        ],
        makeChanges: function(){
            arsenal.player.weaponEquiped = "machine blaster";
            arsenal.toNextLevel = 30;
            arsenal.globalVariables.enemieCount += 3;
            arsenal.currentLevel = 2;
        },
        scene: function(){
            ctx.clearRect(0,0, 800, 600);

            ctx.fillStyle = "black";
            ctx.fillRect(0,0,800,600);

            ctx.fillStyle = "white";
            ctx.font = '24px Arial';
            for(var i = 0 ; levelTransition.textOnScreen[i] ; i++){
                ctx.fillText(levelTransition.textOnScreen[i], 50, 120+(i * 35));
            }

            if(levelTransition.textLineOnScreen >= 2 && !levelTransition.cvAdded){
                levelTransition.cvAdded = true;
                var cvPart = document.getElementById("divers");
                cvPart.innerHTML = '<img src="images/cvPart.png" alt="Divers" onclick="auxFunc.pause(\'divers\')"><h3>Divers</h3>';
                cvPart.className = "fadeIn";
            }

            arsenal.stopScene = window.requestAnimationFrame(levels[2].scene);
        }
    },
    3: {
        text: [
            "Niveau 2 completé!",
            "Vous avez récupéré une nouvelle partie du CV",
            "Des missiles type bootstrap 4 ont été installés sur votre vaisseau",
            "Pour les lancer appuyez sur 'Z'",
            "ils se chargerons de trouver une cible ;)",
            "Vous avez aussi le puissant laser Angular (bar d'espace)",
            "Mais attention: le laser Angular consumme du CSS",
            "Notre radar détecte des nouveaux enemies! Vous savez quoi faire...",
            "(Click pour continuer...)"
        ],
        makeChanges: function(){
            arsenal.toNextLevel = 40;
            arsenal.globalVariables.enemieCount += 2;
            arsenal.currentLevel = 3;
        },
        scene: function(){
            ctx.clearRect(0,0, 800, 600);

            ctx.fillStyle = "black";
            ctx.fillRect(0,0,800,600);

            ctx.fillStyle = "white";
            ctx.font = '24px Arial';
            for(var i = 0 ; levelTransition.textOnScreen[i] ; i++){
                ctx.fillText(levelTransition.textOnScreen[i], 50, 120+(i * 35));
            }

            if(levelTransition.textLineOnScreen >= 2 && !levelTransition.cvAdded){
                levelTransition.cvAdded = true;
                var cvPart = document.getElementById("experience");
                cvPart.innerHTML = '<img src="images/cvPart.png" alt="Circle futuristic" onclick="auxFunc.pause(\'experience\')"><h3>Expérience</h3>';
                cvPart.className = "fadeIn";
            }

            arsenal.stopScene = window.requestAnimationFrame(levels[3].scene);
        }
    },
    4: {
        text: [
            "Niveau 3 completé!",
            "Vous avez récuperé une nouvelle partie du CV!",
            "Il ne reste que la dernière partie pour le completer",
            "Votre vaisseau a été équipé du fameux bouclier NodeJS (E)",
            "Il consumme aussi du CSS",
            "En plus, vous avez maintenant des 'MongoDBombs'! (entrée)",
            "Utilisez-les seulement en cas d'urgences",
            "Oh no! Des soucoupes arrivent avec leur boucliers!",
            "(Click pour continuer...)"
        ],
        makeChanges: function(){
            arsenal.toNextLevel = 50;
            arsenal.globalVariables.enemieCount += 2;
            enemies.ghost.speed = 0.9;
            enemies.hunter.speed = 1;
            arsenal.currentLevel = 4;
            if(arsenal.player.missilesAmmo < 20){arsenal.player.missilesAmmo = 20;}
            arsenal.player.megaBombAmmo = 3;
        },
        scene: function(){
            ctx.clearRect(0,0, 800, 600);

            ctx.fillStyle = "black";
            ctx.fillRect(0,0,800,600);

            ctx.fillStyle = "white";
            ctx.font = '24px Arial';
            for(var i = 0 ; levelTransition.textOnScreen[i] ; i++){
                ctx.fillText(levelTransition.textOnScreen[i], 50, 120+(i * 35));
            }

            if(levelTransition.textLineOnScreen >= 2 && !levelTransition.cvAdded){
                levelTransition.cvAdded = true;
                var cvPart = document.getElementById("formation");
                cvPart.innerHTML = '<img src="images/cvPart.png" alt="Circle futuristic" onclick="auxFunc.pause(\'formation\')"><h3>Formation</h3>';
                cvPart.className = "fadeIn";
            }

            arsenal.stopScene = window.requestAnimationFrame(levels[4].scene);
        }
    },
    5: {
        text: [
            "VICTOIRE ! ",
            "Félicitation! Vous avez débloqué tout le CV!",
            "Mais le fun ne s'arrête pas là!",
            "Vous pouvez continuer à jouer le temps que vous voulez:",
            "A chaque 20 enemies détruits",
            "la quantité d'enemies va augmenter",
            "Si non, vous pouvez voir mon CV complet en cliquant",
            "sur le button menu en haut à gauche",
            "Merci d'avoir joué mon jeu =)",
            "(Click pour continuer...)"
        ],
        makeChanges: function(){
            arsenal.toNextLevel = 20;
            arsenal.globalVariables.enemieCount += 2;
            arsenal.currentLevel = 5;
            if(arsenal.player.missilesAmmo < 20){arsenal.player.missilesAmmo = 20;}
        },
        scene: function(){
            ctx.clearRect(0,0, 800, 600);

            ctx.fillStyle = "black";
            ctx.fillRect(0,0,800,600);

            ctx.fillStyle = "white";
            ctx.font = '24px Arial';
            for(var i = 0 ; levelTransition.textOnScreen[i] ; i++){
                if(i === 0){
                    ctx.font = '30px Fantasy';
                    ctx.fillText(levelTransition.textOnScreen[i], 350, 100);
                } else {
                    ctx.fillText(levelTransition.textOnScreen[i], 50, 120+(i * 35));
                }
            }

            if(!levelTransition.cvAdded){
                levelTransition.cvAdded = true;
                var cvPart = document.getElementById("competences");
                cvPart.innerHTML = '<img src="images/cvPart.png" alt="Circle futuristic" onclick="auxFunc.pause(\'competences\')"><h3>Compétences</h3>';
                cvPart.className = "fadeIn";
            }

            arsenal.stopScene = window.requestAnimationFrame(levels[5].scene);
        }
    },
}