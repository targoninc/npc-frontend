export class MapDrawer {
    constructor(canvas, size) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = size;
        this.canvas.height = size;
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

    drawTile(tile) {
        this.drawRect(tile.x, tile.y, tile.size, tile.size, tile.color);
        if (tile.texture) {
            this.drawTexturedRect(tile.x, tile.y, tile.size, tile.size, tile.texture);
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
        this.ctx.drawImage(texture, x, y, width, height);
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