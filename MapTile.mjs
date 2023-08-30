export class MapTile {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.texture = null;
    }

    addTexture(texture) {
        this.texture = texture;
    }
}