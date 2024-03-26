export class CanvasDrawer {
    constructor(canvas, size, textures = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = size;
        this.canvas.height = size;
        this.textures = textures;
    }

    preloadTextures(callback) {
        let resolved = 0;
        let toLoad = Object.entries(this.textures).length;
        for (let textureBatchName in this.textures) {
            let textureBatch = this.textures[textureBatchName];
            if (textureBatch.constructor === Array) {
                toLoad += textureBatch.length - 1;
                textureBatch.forEach((texture) => {
                    this.preloadTexture(texture, () => {
                        resolved++;
                        if (resolved === toLoad) {
                            callback();
                        }
                    });
                });
            } else {
                this.preloadTexture(textureBatch, () => {
                    resolved++;
                    if (resolved === toLoad) {
                        callback();
                    }
                });
            }
        }
    }

    preloadTexture(texture, callback) {
        texture.addEventListener('load', () => {
            callback();
        });
    }

    getSteppedHeight(height, steps) {
        return Math.floor(height * steps) / steps;
    }

    redrawWithImage(image, offset) {
        this.clear();
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.putImageData(image, offset.x, offset.y);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
        this.ctx.imageSmoothingEnabled = false;
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

    drawText(x, y, text, color, fontSize = 52) {
        this.ctx.fillStyle = color;
        this.ctx.font = fontSize + "px Arial";
        this.ctx.fillText(text, x, y);
    }

    getAsImage() {
        return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }
}