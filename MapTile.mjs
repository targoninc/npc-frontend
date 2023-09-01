export class MapTile {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.texture = null;
        this.color = null;
        this.size = 10;
    }

    setSize(size) {
        this.size = size;
    }

    setColor(color) {
        this.color = color;
    }

    addTexture(texture) {
        this.texture = texture;
    }
}