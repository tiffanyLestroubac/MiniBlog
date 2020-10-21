class Player {
    constructor(name, health, imgName, id, weapon) {
        this.id = id;
        this.name = name;
        this.health = health;
        this.weapon = weapon;
        this.weaponName = this.weaponName;
        this.strength = this.strength;
        this.defense = false;
        this.imgName = imgName;
        this.HTMLElement = jQuery('<div>');
        this.HTMLCard = jQuery('<div>');
    }

    detection(data) { //méthode permettant de détecter les cases autour du joueur, vers lesquelles il peut aller
        let player = this;
        let tiles = data[0]; //on récupère les données renvoyées par la fonction createGameSet
        let linesRef = data[1]; //tableau référencant les lignes du jeu en lettres
        let tilesToCheck = [ //les tiles à vérifier, devant et derrière le joueur
            [-1, -2, -3],
            [1, 2, 3]
        ];
        let playerTile = tiles.filter(elt => elt.player === player)[0]; //la tile sur laquelle se trouve le joueur au moment où on appelle cette méthode
        let tilesToColor = [
            [], //tiles à gauche
            [], //tiles à droite
            [], //tiles en haut
            [] //tiles en bas
        ];
        let indexOfPlayerInLinesRef = linesRef.findIndex(index => index === playerTile.line) //index de la ligne du joueur dans le tableau linesRef

        $(tiles).each(function () {
            for (let j = 0; j < tilesToCheck.length; j++) { //pour vérifier chaque tableau (avant et après le joueur) sucessivement 
                for (i = 0; i < tilesToCheck[j].length; i++) { //pour vérifier chaque tile, une à une
                    if ((this.line === playerTile.line) && (this.row === playerTile.row + tilesToCheck[j][i])) { //vérification à l'horizontale (même ligne)
                        if (j === 0) {
                            tilesToColor[0].push(this);
                        } else {
                            tilesToColor[1].push(this);
                        }
                    }
                    if ((this.line === linesRef[indexOfPlayerInLinesRef + tilesToCheck[j][i]]) && (this.row === playerTile.row)) { //vérification à la verticale (même colonne)
                        if (j === 0) {
                            tilesToColor[2].push(this);
                        } else {
                            tilesToColor[3].push(this);
                        }
                    }
                }
            }
        })
        tilesToColor[0].reverse() //on inverse les tiles à gauche et en haut pour vérifier le blocage en partant de la tile du joueur 
        tilesToColor[2].reverse() //inversion des tiles du haut pour la même raison

        $(tilesToColor).each(function () {
            let line = this;
            for (i = 0; i < line.length; i++) {
                if ((line[i].blocked) || (line[i].player)) {
                    line.length = i; //réduit la taille du tableau en fonction de l'index où une case est bloquée pour qu'un obstacle arrête la ligne
                };
            };
            $(line).each(function () { //on itère sur les tiles d'un tableau réduit aux cases sur lesquelles ont peut effectivement aller
                let newTile = this;
                newTile.possibleDestination = true; //ces tiles deviennent des destinations possibles pour le joueur
                newTile.changeTilesColor(); //rajout de la surcouche (overlay)
                $(newTile.HTMLElement).on('click', function handler() {
                    $(tiles).each(function () {
                        let tile = this;
                        if (tile.possibleDestination) { //immédiatement après le clic, on désactive l'écoute d'événement sur toutes les tiles vers lesquelles on pouvait se déplacer
                            $(tile.HTMLElement).off()
                        }
                    })
                    $('.tileOverlay').remove(); //on supprimer toutes les surcouches
                    playerTile.player = false; //on désactive tout de suite la case du joueur pour éviter que le joueur ne se détecte lui-même par la suite
                    let indexInLine = line.findIndex(elt => elt === newTile) //on récupère l'index de la case sur laquelle on clique, dans sa propre ligne
                    for (i = 0; i < indexInLine; i++) { //vérifie les tiles sur lesquelles le joueur est passé
                        if (line[i].weapon) {
                            player.weaponChangeOnTile(line[i], gameObjectsElt, player) //appelle la fonction permettant de changer l'arme présente sur la tile
                        }
                    }
                    if (newTile.weapon) { //vérifie la tile sur laquelle le joueur a cliqué
                        player.weaponChangeOnTile(newTile, gameObjectsElt, player)
                    }
                    player.checkPlayer(line, playerTile, indexInLine, newTile, linesRef, tiles, player, data); //appelle la fonction permettant de vérifier la présence de joueurs
                })
            })
        });
    }

    weaponChangeOnTile(newTile, gameObjectsElt, player) { //remplace l'arme sur la tile si le joueur en portait une
        let newWeapon = newTile.weapon;
        let oldWeapon = player.weapon;
        let oldWeaponElt = gameObjectsElt.filter(elt => elt[0].id === player.weapon.name) //on recherche l'arme portée par le joueur dans les éléments HTML du jeu
        if (player.weapon.name != 'fists') { //si le joueur possède une arme différente de ses poings, alors il doit la redéposer sur le plateau de jeu
            player.changeWeaponOfPlayer(newWeapon); //change l'armée du joueur
            player.updateCardWeapon(newWeapon.frenchName); //mise à jour de la carte d'info du joueur
            $('#' + newWeapon.name).remove(); //supprime l'élément HTML de la nouvelle arme
            newTile.HTMLElement.append(oldWeaponElt[0]); //remet l'ancienne arme dans la case
            newTile.weapon = oldWeapon; //rajoute l'objet JS à la case
        } else { //si le joueur ne possédait que ses poings
            player.changeWeaponOfPlayer(newWeapon);
            player.updateCardWeapon(newWeapon.frenchName);
            $('#' + newWeapon.name).remove();
            newTile.weapon = undefined; //la case n'a pas d'arme
        }
    }
    changeWeaponOfPlayer(weapon) { //modifie l'objet joueur
        this.weapon = weapon;
        this.weaponName = weapon.name;
        this.strength = weapon.strength;
    }
    checkPlayer(line, playerTile, indexInLine, newTile, linesRef, tiles, player, data) { //cette fonction vérifie si un joueur adverse se trouve sur la ligne, ou autour de la ligne de déplacement que suit le joueur
        let closestTile = line[0]; //permet de connaître la tile la plus proche du joueur par rapport à sa tile actuelle, pour calculer la direction du joueur

        if (closestTile.line === playerTile.line) { //si on va à l'horizontal, vérification de la présence de joueurs
            for (i = 0; i < indexInLine + 1; i++) { //on récupère l'index de la ligne où on clique en rajoutant + 1 pour prendre en compte la case sur la quelle on clique
                let tileInLine = line[i]; //les cases visitées par le joueur dans la ligne
                let indexOfPlayerInLinesRef = linesRef.findIndex(elt => elt === tileInLine.line); //index de la ligne du joueur dans le tableau linesRef
                let lineBefore = linesRef[indexOfPlayerInLinesRef - 1]; //la ligne avant le joueur
                let lineAfter = linesRef[indexOfPlayerInLinesRef + 1];
                $(tiles).each(function () { //on itère sur toutes les tiles du jeu, puisqu'on va vérifier les cases autour de la ligne visitée par le joueur
                    let tileToCheck = this;
                    if (tileInLine.row === tileToCheck.row) { //permet de vérifier les cases de la colonne des tiles visitées
                        if ((tileToCheck.line === lineBefore) || (tileToCheck.line === lineAfter)) { //si les tiles son sur la même colonne, ligne d'avant ou ligne d'après
                            if (tileToCheck.player) {
                                fight()
                            }
                        }
                    } else if ((tileToCheck.line === newTile.line) && ((tileToCheck.row === newTile.row - 1) || (tileToCheck.row === newTile.row + 1))) { //si les tiles sont sur la même ligne, et si elles sont à une colonne de + ou de -
                        if (tileToCheck.player) {
                            fight()
                        }
                    }
                })
            }
        } else { //sinon on va à la verticale
            for (i = 0; i < indexInLine + 1; i++) { //on itère sur le nombre de cases effectivement visitée + 1
                let lineOfPlayer = line[i].line;
                let indexOfNewTileInLinesRef = linesRef.findIndex(elt => elt === newTile.line); //permet de connaître l'index de la nouvelle case dans "linesRef", pour jouer avec les lignes suivantes et précédentes
                let lineBeforeNewTile = linesRef[indexOfNewTileInLinesRef - 1];
                let lineAfterNewTile = linesRef[indexOfNewTileInLinesRef + 1];
                let rowAfter = line[i].row + 1;
                let rowBefore = line[i].row - 1;
                $(tiles).each(function () { //itération sur toutes les tiles pour vérifier l'environnement autour de la ligne visitée
                    let tileToCheck = this;
                    if ((tileToCheck.line === lineOfPlayer) && ((tileToCheck.row === rowAfter) || (tileToCheck.row === rowBefore))) {
                        if (tileToCheck.player) {
                            fight()
                        }
                    } else if ((tileToCheck.row === newTile.row) && ((tileToCheck.line === lineBeforeNewTile) || (tileToCheck.line === lineAfterNewTile))) {
                        if (tileToCheck.player) {
                            fight()
                        }
                    }
                })
            }
        }
        newTile.player = player;
        newTile.HTMLElement.append(player.HTMLElement);
        if (player.id === 'p1') { //on relance la boucle de détection en fonction de qui a joué
            player2.detection(data);
        } else {
            player1.detection(data)
        }

    }

    createCard() { //permet de créer les cartes de chaque joueur des deux côtés de l'écran
        let cardElt = this.HTMLCard;
        cardElt.css({
            width: '300px',
            height: '300px',
            backgroundColor: 'white',
            border: '1px solid black'
        });
        cardElt.attr({
            id: this.name + 'Card'
        });
        let nameElt = jQuery('<span>');
        let healthEltContainer = jQuery('<div>');
        let healthElt = jQuery('<div>');
        let weaponElt = jQuery('<span>');

        let cardEltOverlay = jQuery('<div></div>');
        cardEltOverlay.css({
            width: '300px',
            height: '300px',
            position: 'absolute',
            backgroundColor: 'rgb(204, 169, 124, 0.74)'

        });
        cardEltOverlay.attr({
            id: `${this.id}CardSurcouche`
        });

        cardElt.append(cardEltOverlay);
        if (this.id === 'p1') {
            $('#content').prepend(cardElt);
        } else {
            $('#content').append(cardElt);
        }

        nameElt.attr({
            class: 'textCard',
            id: `${this.id}CardName`
        });
        healthElt.attr({
            class: 'textCard',
            id: `${this.id}HealthCard`
        });
        healthElt.css({
            width: '100%',
            height: '100%',
            backgroundColor: 'red',
            zIndex: '7'
        })
        healthEltContainer.css({
            zIndex: '7',
            width: '150px',
            height: '25px',
            border: 'solid black 1px'
        })
        weaponElt.attr({
            class: 'textCard',
            id: 'weapon' + this.name
        });
        nameElt.text('Nom du joueur : ' + this.name);
        weaponElt.text('Arme portée : poings');

        healthEltContainer.append(healthElt);

        cardElt.append(nameElt, healthEltContainer, weaponElt);
        $('#boardGame').append(cardElt)
    }

    updateCardWeapon(weaponName) { //méthode appelée lors d'un changement d'arme par le joueur, qui nécessite une mise à jour de la carte
        $('#weapon' + this.name).text('Arme portée : ' + weaponName)
    }
    updateCardHealth(health) { //mise à joueur de la barre de vie sur la carte lors des combats
        $('#' + this.id + 'HealthCard').css({
            width: `${health}%`
        })
    }
    attack(target) { //méthode utilisée lors des combats
        if (this.health > 0) {
            let damages = this.strength;
            if (target.defense === true) {
                damages = (damages / 2);
                console.log(damages)
                target.health -= damages;
                target.defense = false;
            } else {
                console.log(damages)
                target.health -= damages;
            }
        }
    }

}