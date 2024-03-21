import {CanvasDrawer} from "./CanvasDrawer.mjs";

export class MapDrawer {
    constructor(canvas, size) {
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
        this.canvasDrawer = new CanvasDrawer(canvas, size, this.textures);
        this.canvas = canvas;
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

    getBuildingOnTile(tile) {
        return this.map.buildings.find(building => building.coordinates.x === tile.x && building.coordinates.y === tile.y);
    }

    getTileAtMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const tile = this.getTileAtPosition(x, y);
        if (tile) {
            tile.building = this.getBuildingOnTile(tile);
        }
        return tile;
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
            let technicalX = tile.x * this.getWidthFactor();
            let technicalY = tile.y * this.getHeightFactor();
            let tileSize = tile.size * this.getWidthFactor();
            let hoverText = `(${tile.x}, ${tile.y}) - ${tile.type}`;
            if (tile.building) {
                hoverText += ` - ${tile.building.type}`;
            }
            const fontSize = 52;
            const margin = fontSize * .5;
            this.canvasDrawer.drawRect(technicalX, technicalY, tileSize, tileSize, 'rgba(255, 255, 255, 0.5)');
            let textY = technicalY - fontSize;
            if (textY < .5 * margin) {
                textY = .5 * margin;
            }
            let textX = technicalX;
            if (textX < margin) {
                textX = margin;
            }
            let textWidth = hoverText.length * (fontSize * .5) + (2 * margin);
            if (textX + textWidth > this.canvas.width) {
                textX = this.canvas.width - textWidth - margin;
            }
            this.canvasDrawer.drawRect(textX - margin, textY - (.5 * margin), textWidth, fontSize + (2 * margin), 'rgba(0, 0, 0, 0.5)');
            this.canvasDrawer.drawText(textX, textY + fontSize, hoverText, 'white', fontSize);
        } else {
            this.drawMap(this.map, true);
        }
    }

    /**
     *
     * @param buildings
     */
    drawBuildings(buildings) {
        const maxSize = Math.max(...buildings.map(b => b.size));
        buildings.forEach(building => {
            this.drawBuilding(building, maxSize);
        });
    }

    drawBuilding(building, maxSize) {
        const x = building.coordinates.x * this.getWidthFactor();
        const y = building.coordinates.y * this.getHeightFactor();
        const relativeSize = building.size / maxSize;
        const width = relativeSize * this.getWidthFactor();
        const height = relativeSize * this.getHeightFactor();
        const inset = ((1 * this.getWidthFactor()) - width) / 2;
        const colorDeviation = (relativeSize * relativeSize) * 60;
        this.canvasDrawer.drawRect(x + inset, y + inset, width, height, `rgba(${90 + colorDeviation},47,${30 + colorDeviation},1)`);
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
            this.canvasDrawer.drawTexturedRect(tile.x * this.getWidthFactor(), tile.y * this.getHeightFactor(), tile.size * this.getWidthFactor(), tile.size * this.getHeightFactor(), texture);
        } else {
            this.canvasDrawer.drawRect(tile.x * this.getWidthFactor(), tile.y * this.getHeightFactor(), tile.size * this.getWidthFactor(), tile.size * this.getHeightFactor(), tile.color);
        }
    }

    drawTileHeight(tile, minHeight, maxHeight) {
        let height = tile.height ?? 0;
        height = (height - minHeight) / (maxHeight - minHeight);
        height = this.canvasDrawer.getSteppedHeight(height, 10);
        const color = 255 * height;
        const alpha = Math.abs(height - 0.5);
        this.canvasDrawer.drawRect(tile.x * this.getWidthFactor(), tile.y * this.getHeightFactor(), tile.size * this.getWidthFactor(), tile.size * this.getHeightFactor(), `rgba(${color}, ${color}, ${color}, ${alpha})`);
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
            this.canvasDrawer.redrawWithImage(this.cachedMap);
            return;
        }
        this.map = map;
        this.canvasDrawer.clear();
        this.drawTiles();
    }

    cacheMap() {
        this.cachedMap = this.canvasDrawer.getAsImage();
        console.log("Cached map");
    }

    drawTiles() {
        this.canvasDrawer.preloadTextures(() => {
            this.map.tiles.forEach(tile => {
                this.drawTile(tile);
            });
            const minHeight = Math.min(...this.map.tiles.map(tile => tile.height));
            const maxHeight = Math.max(...this.map.tiles.map(tile => tile.height));
            this.map.tiles.forEach(tile => {
                this.drawTileHeight(tile, minHeight, maxHeight);
            });
            this.drawBuildings(this.map.buildings);
            this.cacheMap();
        });
    }
}