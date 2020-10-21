$(document).ready(function () {
    inputName() //écran permettant de donner des noms aux joueurs
    let dataGameSet = createGameSet(); //crée le plateau de jeu et renvoie les données du jeu
    player1.detection(dataGameSet); //lancement de le partie avec les données du jeu
    /* pour rajouter une nouvelle arme, il faut un visuel, créer l'objet, puis le pusher dans le tableau */
});

let gameObjects = []; //contient tous les objets du jeu
let gameObjectsElt = []; //contient les éléments HTML liés aux objets

function inputName() {
    let inputContainerContainer = jQuery('<div></div>')
    inputContainerContainer.attr({
        id: 'inputContainerContainer'
    })

    let inputContainer = jQuery('<div></div>')
    inputContainer.attr({
        id: 'inputNameContainer'
    })
    let labelInputP1 = jQuery('<label>Entrez le nom du joueur 1</label>')
    let labelInputP2 = jQuery('<label>Entrez le nom du joueur 2</label>')

    labelInputP1.attr({
        id: `labelInputP1`
    })
    labelInputP2.attr({
        id: `labelInputP2`
    })

    let inputNameP1 = jQuery('<input>')
    let inputNameP2 = jQuery('<input>')

    inputNameP1.attr({
        id: 'inputNameP1',
        class: 'inputName'
    })

    inputNameP2.attr({
        id: 'inputNameP2',
        class: 'inputName'
    })

    let buttonsContainer = jQuery('<div id="buttonsContainer"></div>')
    let cancelButton = jQuery('<button id="cancel">Passer</button>')
    let inputNameButton = jQuery('<button>Valider</button>')
    inputNameButton.css({
        width: '80px',
        height: '30px',
        zIndex: '6'
    })
    inputNameButton.attr({
        id: 'inputNameButton'
    })

    $('body').append(inputContainerContainer)
    $('#inputContainerContainer').append(inputContainer)
    $('#inputNameContainer').append(labelInputP1)
    $('#inputNameContainer').append(inputNameP1)
    $('#inputNameContainer').append(labelInputP2)
    $('#inputNameContainer').append(inputNameP2)
    $('#inputNameContainer').append(buttonsContainer)
    $('#buttonsContainer').append(inputNameButton)
    $('#buttonsContainer').append(cancelButton)
    let defaultMessage = 'Veuillez entrer un nom';
    $(inputNameButton).click(function () {
        if ((($('#inputNameP1').val() === '') || ($('#inputNameP2').val() === '')) ||
            (($('#inputNameP1').val() === defaultMessage) || ($('#inputNameP2').val() === defaultMessage))) {
            $('#inputNameP1').val(defaultMessage)
            $('#inputNameP2').val(defaultMessage)
        } else { //si des noms sont rentrés, modification des éléments HTML 
            $(`#p1CardName`).text($('#inputNameP1').val())
            $(`#p2CardName`).text($('#inputNameP2').val())
            $('#inputContainerContainer').css({
                display: 'none'
            })
        }
    })
    $(cancelButton).click(function () {
        $('#inputContainerContainer').css({
            display: 'none'
        })
    })
}

function createGameSet() { //crée le plateau et renvoie des données
    let tiles = [];
    let gameProperties = { //permet de changer certaines propriétés du jeu
        tilePerLine: 10, //nombre de cases par lignes
        tileLineNumber: 10, //nombre de lignes, limité à 26
        freeTiles: 0.9, //une valeur de 1 rend la carte entièrement explorable (0.9 est recommandé)
        boardGameBorder: 'solid black 1px'
    }

    $('#boardGame').css({
        border: gameProperties.boardGameBorder
    })

    for (i = 0; i < gameProperties.tileLineNumber; i++) { //création des lignes du jeu en fonction des valeurs de gameProperties
        let tileLine = jQuery('<tr></tr>');
        tileLine.attr('class', 'tileLine');
        $('#boardGame').append(tileLine);
    };

    let tilesUnblocked = [];
    let lineCounter = 0;
    let linesRef = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']; //références des lignes du jeu
    linesRef.length = gameProperties.tileLineNumber //permet de réduire le tableau en fonction du nombre de lignes constituants le plateau du jeu

    $('.tileLine').each(function () {
        for (i = 0; i < gameProperties.tilePerLine; i++) {
            let tile = new Tile();
            let tileElt = tile.HTMLElement;
            if (i === 0) {
                lineCounter++;
            }
            tile.line = linesRef[lineCounter - 1]; //on attribut une lettre pour la ligne
            tile.row = i; //un numéro de colonne à partir de 0

            $(this).append(tileElt);
            if (Math.random() > gameProperties.freeTiles) { //un certain pourcentage de cases seront bloquées, basées sur la propriétées fixée dans gameProperties
                tileElt.css({
                    backgroundImage: `url(images/tiles/blocked.png)`
                });
                tile.blocked = true;
            } else { //le reste ne sera pas bloqué
                let randomNumber = Math.round(Math.random() * 7);
                let tilesWeed = ['tiles1.png', 'tiles2.png', 'tiles3.png', 'tiles4.png', 'tiles5.png', 'tiles6.png', 'tiles7.png', 'tiles8.png'];
                tile.HTMLElement.css({
                    backgroundImage: `url(images/tiles/${tilesWeed[randomNumber]})` //on va récupérer au hasard des tiles d'herbe
                });
                tilesUnblocked.push(tile);
            }
            tiles.push(tile);
        }
    })


    for (i = 0; i < gameObjects.length; i++) { //on itère sur le tableau contenant les objets du jeu pour les placer un à un 
        let tilesUnblockedAndEmpty = tilesUnblocked.filter(tile => tile.occupied === false); //parmi les tiles non bloquées, on récupère celles qui ne sont pas déjà occupées par un élément du jeu
        let randomIndex = Math.floor(tilesUnblockedAndEmpty.length * Math.random()) //on créé un index aléatoire sur ces tiles non bloquées et non occupées
        let randomTile = tilesUnblockedAndEmpty[randomIndex];

        let lineBefore = linesRef[linesRef.findIndex(elt => elt === randomTile.line) - 1];
        let lineAfter = linesRef[linesRef.findIndex(elt => elt === randomTile.line) + 1];
        let rowBefore = randomTile.row - 1;
        let rowAfter = randomTile.row + 1;
        //le tableau ci-dessous regroupe toutes les tiles situées autour du joueur. Elles sont définies une à une sous ce tableau, puis pushées toutes ensemble
        let tilesAroundPlayer = []
        let tileUpLeft = [lineBefore, rowBefore];
        let tileUpRight = [lineBefore, rowAfter];
        let tileUp = [lineBefore, randomTile.row];
        let tileLeft = [randomTile.line, randomTile.row - 1];
        let tileRight = [randomTile.line, randomTile.row + 1];
        let tileDownLeft = [lineAfter, rowBefore];
        let tileDown = [lineAfter, randomTile.row];
        let tileDownRight = [lineAfter, rowAfter];
        tilesAroundPlayer.push(tileUpLeft, tileUp, tileUpRight, tileLeft, tileRight, tileDownLeft, tileDown, tileDownRight);

        gameObjectElt = gameObjects[i].HTMLElement; //correspond à l'élément HTML de l'objet JS, chaque objet JS ayant une propriété HTMLElement
        gameObjectElt.css({
            width: '70px',
            height: '70px',
            backgroundImage: `url(images/${gameObjects[i].imgName})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
            position: 'absolute'
        })
        gameObjectElt.attr({
            id: gameObjects[i].name
        })
        gameObjectsElt.push(gameObjectElt); //on push l'objet dans un tableau rassemblant tous les éléments HTML du jeu, pour pouvoir les manipuler quand on veut

        if (gameObjects[i] instanceof Weapon) { //si l'objet est une arme, on le place sur n'importe quelle case vide et inoccupée
            let weapon = gameObjects[i];
            randomTile.HTMLElement.append(gameObjectElt);
            randomTile.occupied = true;
            randomTile.weapon = weapon;
        } else if (gameObjects[i] instanceof Player) {
            let player = gameObjects[i];
            player.createCard()
            randomTile.available = false;
            randomTile.HTMLElement.append(gameObjectElt);
            randomTile.occupied = true;
            randomTile.player = player;
            $(tilesUnblocked).each(function () {
                let tile = this;
                $(tilesAroundPlayer).each(function () {
                    let tileChecked = this;
                    if ((tile.line === tileChecked[0]) && (tile.row === tileChecked[1])) {
                        tile.occupied = true; //comme c'est un joueur, on va considérer comme "occupée" toutes les cases autour de lui, pour éviter que le joueur suivant soit placé juste à côté de lui
                    }
                })
            })
        }

    }
    return [tiles, linesRef] //on return les données du jeu qui seront ensuite utilisée par les méthodes des différentes class
}

let fight = (function () { //cette fonction ne peut être appelée qu'une seule fois 
    let executed = false;
    return function () {
        if (!executed) {
            executed = true;
            //création du champ de bataille
            let battlefieldElt = jQuery('<div></div>');
            battlefieldElt.attr({
                id: 'battlefield'
            })

            $('#boardGame').append(battlefieldElt);

            //création de l'interface du champ de bataille
            let interfaceBattlefieldContainer = jQuery('<div></div>');
            interfaceBattlefieldContainer.attr({
                id: 'interfaceBattlefieldContainer'
            })
            $('#battlefield').append(interfaceBattlefieldContainer);

            let interfaceBattlefield = jQuery('<div></div>');
            interfaceBattlefield.attr({
                id: 'interfaceBattlefield'
            })
            $('#interfaceBattlefieldContainer').append(interfaceBattlefield);

            //boutons pour attaquer et se défendre
            for (i = 0; i < 2; i++) {
                let playerAttackElt = jQuery('<button>Attaquer</button>');
                let playerDefenseElt = jQuery('<button>Se défendre</button>');
                let playerNumber;
                let player;
                let target;
                if (i === 0) {
                    playerNumber = 1;
                    player = player1;
                    target = player2;
                } else {
                    playerNumber = 2;
                    player = player2;
                    target = player1;

                };
                playerAttackElt.attr({
                    id: `player${playerNumber}attack`,
                    class: `buttonGame buttonsPlayer${playerNumber}`
                });
                playerDefenseElt.attr({
                    id: `player${playerNumber}defense`,
                    class: `buttonGame buttonsPlayer${playerNumber}`
                });
                $('#interfaceBattlefield').append(playerAttackElt, playerDefenseElt);
                $(`.buttonsPlayer2`).attr('class', 'buttonDesactivated');
            }

            //actions d'attaque et de défense en fonction des clics sur les boutons
            function handlingInterface(attacker, target, attackButtonAttacker, attackButtonTarget, defenseButtonAttacker, defenseButtonTarget, attackerEltFight, targetEltFight, classAttack) {
                $(attackButtonAttacker).click(() => {
                    $(attackButtonAttacker).off();
                    $(defenseButtonAttacker).off();

                    attacker.attack(target);
                    target.updateCardHealth(target.health);

                    $(attackButtonTarget).attr('class', 'buttonGame');
                    $(defenseButtonTarget).attr('class', 'buttonGame');

                    $(attackButtonAttacker).attr('class', 'buttonDesactivated');
                    $(defenseButtonAttacker).attr('class', 'buttonDesactivated');

                    $(targetEltFight).append(playerHitElt);
                    $(attackerEltFight).attr('class', classAttack);

                    setTimeout(function () {
                        $(attackerEltFight).removeAttr('class', classAttack);;
                    }, 1000)

                    if ((attacker.health <= 0) || (target.health <= 0)) {
                        endBattle()
                    } else {
                        continueFight(attacker)
                    }
                })
                $(defenseButtonAttacker).click(() => {
                    $(defenseButtonAttacker).off()
                    $(attackButtonAttacker).off()

                    attacker.defense = true;

                    $(attackButtonTarget).attr('class', 'buttonGame');
                    $(defenseButtonTarget).attr('class', 'buttonGame');

                    $(attackButtonAttacker).attr('class', 'buttonDesactivated');
                    $(defenseButtonAttacker).attr('class', 'buttonDesactivated');

                    continueFight(attacker);
                })

                function continueFight(attacker) {
                    if (attacker.id === 'p1') {
                        handlingInterface(player2, player1, '#player2attack', '#player1attack', '#player2defense', '#player1defense', '#player2EltFight', '#player1EltFight', 'p2attacking');
                    } else {
                        handlingInterface(player1, player2, '#player1attack', '#player2attack', '#player1defense', '#player2defense', '#player1EltFight', '#player2EltFight', 'p1attacking');
                    }
                }
            }
            handlingInterface(player1, player2, '#player1attack', '#player2attack', '#player1defense', '#player2defense', '#player1EltFight', '#player2EltFight', 'p1attacking')

            //joueurs visible sur le battlefield
            let player1EltFight = jQuery('<div></div>')
            player1EltFight.attr({
                id: 'player1EltFight'
            })
            let player2EltFight = jQuery('<div></div>')
            player2EltFight.attr({
                id: 'player2EltFight'
            })

            //impact quand ils sont frappés
            let playerHitElt = jQuery('<div></div>')
            playerHitElt.attr({
                class: 'hit'
            })

            $('#battlefield').append(player1EltFight);
            $('#battlefield').append(player2EltFight);

            //attribution de l'arme et du skin en fonction de l'arme portée par le joueur
            let player, playerElt, imageNumber;

            for (i = 0; i < 2; i++) { //boucle for pour changer l'image des deux joueurs
                if (i === 0) {
                    player = player1;
                    playerElt = player1EltFight;
                    imageNumber = 1;
                } else {
                    player = player2;
                    playerElt = player2EltFight;
                    imageNumber = 2;
                }
                switch (player.weapon.name) { //switch case au cas où on ajoute des armes
                    case 'bardiche':
                        changePlayerEltImage('bardiche');
                        break;
                    case 'hammer':
                        changePlayerEltImage('hammer');
                        break;
                    case 'axe':
                        changePlayerEltImage('axe');
                        break;
                    case 'sword':
                        changePlayerEltImage('sword');
                        break
                    default: //que les joueur ne soit armé que de ses poings ou d'une arme ajoutée, l'image sera celle du joueur avec ses poings
                        changePlayerEltImage('fists');
                }

                function changePlayerEltImage(weapon) {
                    playerElt.css({
                        backgroundImage: `url(images/viking-${imageNumber}-${weapon}.png)`
                    })
                }
            }
        }

    }
})();

function endBattle() { //produit le message de fin de bataille
    let endMessageContainer = jQuery('<div></div>');
    endMessageContainer.attr({
        id: 'endMessageContainer'
    });

    let endMessage = jQuery('<div></div>')
    endMessage.attr({
        id: 'endMessage',
        class: 'endMessageAnimation'
    });


    let buttonReloading = jQuery('<button></button>')
    buttonReloading.attr({
        id: 'buttonReloading'
    });
    $(buttonReloading).text('Recommencer ?');

    endMessage.text('Le combat est terminé !');
    $('#boardGame').append(endMessageContainer);
    $(endMessageContainer).append(endMessage);
    $(endMessage).append(buttonReloading);
    $('#interfaceBattlefield').css({
        display: 'none'
    });

    $('#buttonReloading').click(() => {
        document.location.reload(true); // permet de recharger la fenêtre
    });
}

let sword = new Weapon('sword', 25, 'sword.png', 'épée');
let bardiche = new Weapon('bardiche', 30, 'bardiche.png', 'bardiche');
let hammer = new Weapon('hammer', 27, 'hammer.png', 'marteau');
let axe = new Weapon('axe', 25, 'axe.png', 'hache');
let fists = new Weapon('fists', 10, 'poings');
//let staff = new Weapon('staff', 15, 'staff.png', 'bâton');

let player1 = new Player('player1', 100, 'player1.png', 'p1');
let player2 = new Player('player2', 100, 'player2.png', 'p2');

player1.changeWeaponOfPlayer(fists)
player2.changeWeaponOfPlayer(fists)

gameObjects.push(sword, bardiche, hammer, axe, player1, player2);