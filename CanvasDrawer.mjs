export class MapDrawer {
    constructor(canvas, size) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = size;
        this.canvas.height = size;

        this.textures = {
            water: this.getImage("water"),
            forest: this.getImage("forest"),
            desert: [
                this.getImage("desert_1"),
                this.getImage("desert_2"),
            ],
            swamp: [
                this.getImage("swamp_1"),
                this.getImage("swamp_2"),
            ]
        }
    }

    getImage(url) {
        const image = document.createElement('img');
        image.src = "./images/" + url + ".gif";
        return image;
    }

    /**
     *
     * @param map {Array<MapTile>}
     */
    drawMap(map) {
        this.tiles = map;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawTiles();
    }

    drawTiles() {
        this.tiles.forEach(tile => {
            this.drawTile(tile);
        });
    }

    getWidthFactor() {
        return this.canvas.width / 200;
    }

    getHeightFactor() {
        return this.canvas.height / 200;
    }

    drawTile(tile) {
        const tileTextures = this.textures[tile.type];
        if (tileTextures !== undefined) {
            let texture;
            if (tileTextures.constructor === Array) {
                texture = tileTextures[Math.floor(Math.random() * tileTextures.length)];
            } else {
                texture = this.textures[tile.type];
            }
            this.drawTexturedRect(tile.x * this.getWidthFactor(), tile.y * this.getHeightFactor(), tile.size * this.getWidthFactor(), tile.size * this.getHeightFactor(), texture);
        } else {
            this.drawRect(tile.x * this.getWidthFactor(), tile.y * this.getHeightFactor(), tile.size * this.getWidthFactor(), tile.size * this.getHeightFactor(), tile.color);
        }
    }

    /**
     * Draws a rectangle with a texture
     * @param x {number}
     * @param y {number}
     * @param width {number}
     * @param height {number}
     * @param texture {CanvasImageSource}
     */
    drawTexturedRect(x, y, width, height, texture) {
        texture.addEventListener('load', () => {
            this.ctx.drawImage(texture, x, y, width, height);
        }, { once: true });
    }

    /**
     * Draws a rectangle with a color
     * @param x
     * @param y
     * @param width
     * @param height
     * @param color
     */
    drawRect(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }
}