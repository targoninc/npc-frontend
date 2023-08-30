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

    }

    getImage(url) {
        const img = new Image();
        img.src = url;
        return img;
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