class Tile {
    constructor(id) {
        this.blocked = false;
        this.HTMLElement = jQuery('<td>');
        this.occupied = false;
        this.player = false;
        this.line = '';
        this.row = -1;
        this.available = true;
        this.possibleDestination = false;
        this.weapon = this.weapon;
    };

    changeTilesColor() { //crée la surcouche de la tile sur laquelle le joueur peut cliquer, qui réagit en fonction du passage du curseur 
        let tileOverlay = jQuery('<div>');
        let tile = this.HTMLElement;
        if (this.possibleDestination === true) {
            tileOverlay.attr({
                class: 'tileOverlay'
            });
            tileOverlay.css({
                width: '60px',
                height: '60px',
                backgroundColor: 'rgba(57, 150, 212, 0.4',
                borderRadius: '10px'
            });
            tile.append(tileOverlay);
            tile.on('mouseover', function () {
                tileOverlay.css({
                    backgroundColor: 'rgba(57, 150, 212, 0.7',
                    cursor: 'pointer'
                });
            });
            tile.on('mouseleave', function () {
                tileOverlay.css('backgroundColor', 'rgba(57, 150, 212, 0.4');
            });
        }
    }
};