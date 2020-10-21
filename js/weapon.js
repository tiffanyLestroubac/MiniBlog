class Weapon {
    constructor(name, strength, imgName, frenchName) {
        this.name = name;
        this.strength = strength;
        this.imgName = imgName;
        this.HTMLElement = jQuery('<div>');
        this.frenchName = frenchName;
    }
};