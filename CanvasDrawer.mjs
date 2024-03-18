export class MapDrawer {
    constructor(canvas, size) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = size;
        this.canvas.height = size;

        this.textures = {
            water: this.getImage("water"),
            forest: this.getImage("forest"),
            volcano: [
                this.getImage("volcano_1"),
                this.getImage("volcano_2"),
            ],
            desert: [
                this.getImage("desert_1"),
                this.getImage("desert_2"),
            ],
            swamp: [
                this.getImage("swamp_1"),
                this.getImage("swamp_2"),
            ],
            valley: [
                this.getImage("valley_1"),
                this.getImage("valley_2"),
            ]
        };

        this.loadingImages = 0;
    }

    getImage(url) {
        const image = document.createElement('img');
        image.src = "./images/" + url + ".gif";
        return image;
    }

    /**
     *
     * @param map {Array<MapTile>}
     * @param allowCache
     */
    drawMap(map, allowCache = false) {
        if (allowCache && this.cachedMap) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.putImageData(this.cachedMap, 0, 0);
            return;
        }
        this.map = map;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawTiles();
        this.cacheMap();
    }

    cacheMap() {
        const interval = setInterval(() => {
            if (this.loadingImages === 0) {
                this.cachedMap = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
                console.log("Map cached");
                clearInterval(interval);
            } else {
                console.log(`Waiting for ${this.loadingImages} images to load...`);
            }
        }, 100);
    }

    drawTiles() {
        this.preloadTextures(() => {
            this.map.tiles.forEach(tile => {
                this.drawTile(tile);
            });
            const minHeight = Math.min(...this.map.tiles.map(tile => tile.height));
            const maxHeight = Math.max(...this.map.tiles.map(tile => tile.height));
            this.map.tiles.forEach(tile => {
                this.drawTileHeight(tile, minHeight, maxHeight);
            });
        });
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

    getWidthFactor() {
        return this.canvas.width / this.map.resolution;
    }

    getHeightFactor() {
        return this.canvas.height / this.map.resolution;
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

    drawTileHeight(tile, minHeight, maxHeight) {
        let height = tile.height ?? 0;
        height = (height - minHeight) / (maxHeight - minHeight);
        height = this.getSteppedHeight(height, 10);
        const color = 255 * height;
        const alpha = Math.abs(height - 0.5);
        this.drawRect(tile.x * this.getWidthFactor(), tile.y * this.getHeightFactor(), tile.size * this.getWidthFactor(), tile.size * this.getHeightFactor(), `rgba(${color}, ${color}, ${color}, ${alpha})`);
    }

    getSteppedHeight(height, steps) {
        return Math.floor(height * steps) / steps;
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

    drawText(x, y, text, color, fontSize = 52) {
        this.ctx.fillStyle = color;
        this.ctx.font = fontSize + "px Arial";
        this.ctx.fillText(text, x, y);
    }

    getTileAt(x, y) {
        for (let i = 0; i < this.map.tiles.length; i++) {
            let tile = this.map.tiles[i];
            if (tile.x === x && tile.y === y) {
                return tile;
            }
        }
        return null;
    }

    getTileAtPosition(x, y) {
        let tileSize = Math.min(this.canvas.width, this.canvas.height) / this.map.resolution;
        tileSize = (Math.min(this.canvas.clientWidth, this.canvas.clientHeight) / Math.min(this.canvas.width, this.canvas.height)) * tileSize;
        const tileX = Math.floor(x / tileSize);
        const tileY = Math.floor(y / tileSize);
        return this.getTileAt(tileX, tileY);
    }

    getTileAtMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        return this.getTileAtPosition(x, y);
    }

    initEvents() {
        let rendering = false;
        this.canvas.onmousemove = (e) => {
            if (!rendering) {
                rendering = true;
                requestAnimationFrame(() => {
                    this.handleMouseMove(e);
                    rendering = false;
                });
            }
        }
    }

    handleMouseMove(e) {
        const tile = this.getTileAtMousePosition(e);
        if (tile !== null) {
            this.drawMap(this.map, true);
            this.drawRect(tile.x * this.getWidthFactor(), tile.y * this.getHeightFactor(), tile.size * this.getWidthFactor(), tile.size * this.getHeightFactor(), 'rgba(255, 255, 255, 0.5)');
            const hoverText = `(${tile.x}, ${tile.y}) - ${tile.type}`;
            const fontSize = 52;
            const margin = fontSize * .5;
            this.drawRect(tile.x * this.getWidthFactor() - margin, tile.y * this.getHeightFactor() - fontSize - (.5 * margin), hoverText.length * (fontSize * .5) + (2 * margin), fontSize + (2 * margin), 'rgba(0, 0, 0, 0.5)');
            this.drawText(tile.x * this.getWidthFactor(), tile.y * this.getHeightFactor(), hoverText, 'white', fontSize);
        } else {
            this.drawMap(this.map, true);
        }
    }
}