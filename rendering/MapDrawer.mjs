import {CanvasDrawer} from "./CanvasDrawer.mjs";
import {MapEventHandler} from "./MapEventHandler.mjs";
import {NumberGenerator} from "../NumberGenerator.mjs";

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
            ],
            building: this.getImage("house"),
        };
        this.canvasDrawer = new CanvasDrawer(canvas, size, this.textures);
        this.canvas = canvas;
        this.eventHandler = new MapEventHandler(this, canvas);
        this.eventHandler.initialize();
        this.zoom = 1.2;
        this.zoomChange = 1.1;
        this.offset = {x: this.canvas.width * 0.1, y: this.canvas.height * 0.1};
        this.mapCaches = [];
        this.preloadDone = false;
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
        const tileX = x / this.getWidthFactor();
        const tileY = y / this.getHeightFactor();
        return this.getTileAt(Math.floor(tileX), Math.floor(tileY));
    }

    getBuildingOnTile(tile) {
        return this.map.buildings.find(building => building.coordinates.x === tile.x && building.coordinates.y === tile.y);
    }

    getTileAtMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        const canvasFactor = this.canvas.clientWidth / this.canvas.width;
        x = (x / canvasFactor - (this.offset.x)) * this.zoom;
        y = (y / canvasFactor - (this.offset.y)) * this.zoom;
        const tile = this.getTileAtPosition(x, y);
        if (tile) {
            tile.building = this.getBuildingOnTile(tile);
        }
        return tile;
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
        const {x, y} = this.getBuildingCoordinates(building);
        const relativeSize = building.size / maxSize;
        const width = relativeSize * this.getWidthFactor() / this.zoom;
        const height = relativeSize * this.getHeightFactor() / this.zoom;
        const inset = ((1 * this.getWidthFactor() / this.zoom) - width) / 2;
        this.canvasDrawer.drawTexturedRect(x + inset, y + inset, width, height, this.textures.building);
    }

    drawTextbox(text, x, y, fontSize = 52, padding = fontSize * .25) {
        let textY = y + .5 * padding;
        if (textY < .5 * padding) {
            textY = .5 * padding;
        }
        let textX = x + padding;
        if (textX < padding) {
            textX = padding;
        }
        let textWidth = text.length * (fontSize * .5) + (2 * padding);
        if (textX + textWidth > this.canvas.width) {
            textX = this.canvas.width - textWidth - padding;
        }
        this.canvasDrawer.drawRect(textX - padding, textY - (.5 * padding), textWidth, fontSize + (2 * padding), 'rgba(0, 0, 0, 0.5)');
        this.canvasDrawer.drawText(textX, textY + fontSize, text, 'white', fontSize);
        return {x, y, width: textWidth, height: fontSize + (2 * padding)};
    }

    getWidthFactor() {
        return this.canvas.width / this.map.resolution;
    }

    getHeightFactor() {
        return this.canvas.height / this.map.resolution;
    }

    getTileCoordinates(tile) {
        return {
            x: (tile.x * this.getWidthFactor() + (this.offset.x * this.zoom)) / this.zoom,
            y: (tile.y * this.getHeightFactor() + (this.offset.y * this.zoom)) / this.zoom,
            size: tile.size * this.getWidthFactor() / this.zoom
        };
    }

    getBuildingCoordinates(building) {
        return {
            x: (building.coordinates.x * this.getWidthFactor() + (this.offset.x * this.zoom)) / this.zoom,
            y: (building.coordinates.y * this.getHeightFactor() + (this.offset.y * this.zoom)) / this.zoom,
            size: building.size * this.getWidthFactor() / this.zoom
        };
    }

    drawTile(tile) {
        const tileTextures = this.textures[tile.type];
        const coords = this.getTileCoordinates(tile);
        const tileSeed = tile.x * 1000 + tile.y;

        if (tileTextures !== undefined) {
            let texture;
            if (tileTextures.constructor === Array) {
                const textureIndex = NumberGenerator.random(0, tileTextures.length, tileSeed, true);
                texture = tileTextures[textureIndex];
            } else {
                texture = this.textures[tile.type];
            }
            this.canvasDrawer.drawTexturedRect(coords.x, coords.y, coords.size, coords.size, texture);
        } else {
            this.canvasDrawer.drawRect(coords.x, coords.y, coords.size, coords.size, tile.color);
        }
    }

    drawTileHeight(tile, minHeight, maxHeight) {
        let height = tile.height ?? 0;
        height = (height - minHeight) / (maxHeight - minHeight);
        height = this.canvasDrawer.getSteppedHeight(height, 10);
        const color = 255 * height;
        const alpha = Math.abs(height - 0.5);
        const coords = this.getTileCoordinates(tile);
        this.canvasDrawer.drawRect(coords.x, coords.y, coords.size, coords.size, `rgba(${color}, ${color}, ${color}, ${alpha})`);
    }

    getImage(url) {
        const image = document.createElement('img');
        image.src = "./images/" + url + ".gif";
        return image;
    }

    getCache(zoom) {
        const cacheEntry = this.mapCaches.find(cache => cache.zoom === zoom);
        if (cacheEntry) {
            return cacheEntry.image;
        }
        return null;
    }

    setCache(zoom, image) {
        const existing = this.mapCaches.find(cache => cache.zoom === zoom);
        if (existing) {
            existing.image = image;
            return;
        }
        this.mapCaches.push({zoom, image});
    }

    move(x, y) {
        const canvasFactor = this.canvas.clientWidth / this.canvas.width;
        x = (x / canvasFactor);
        y = (y / canvasFactor);
        this.offset.x += x;
        this.offset.y += y;
    }

    zoomIn() {
        this.zoom = Math.max(.1, this.zoom / 1.1);
        this.offset.x -= this.canvas.width * 0.05 / this.zoom;
        this.offset.y -= this.canvas.height * 0.05 / this.zoom;
        this.drawMap(this.map, false);
    }

    zoomOut() {
        this.zoom = Math.min(10, this.zoom * this.zoomChange);
        this.offset.x += this.canvas.width * 0.05 / this.zoom;
        this.offset.y += this.canvas.height * 0.05 / this.zoom;
        this.drawMap(this.map, false);
    }

    /**
     *
     * @param map {Array<MapTile>}
     * @param allowCache
     */
    drawMap(map, allowCache = false) {
        if (allowCache && this.getCache(this.zoom)) {
            this.canvasDrawer.redrawWithImage(this.getCache(this.zoom), this.offset);
            return;
        }
        this.map = map;
        this.canvasDrawer.clear();
        this.drawTiles();
    }

    redraw(allowCache = false) {
        this.drawMap(this.map, allowCache);
    }

    cacheMap() {
        this.setCache(this.zoom, this.canvasDrawer.getAsImage());
    }

    drawTiles() {
        if (!this.preloadDone) {
            this.canvasDrawer.preloadTextures(() => {
                this.preloadDone = true;
                this.drawTilesInternal();
            });
        } else {
            this.drawTilesInternal();
        }
    }

    drawBackground() {
        const w = this.canvas.width / this.zoom;
        const h = this.canvas.height / this.zoom;
        this.canvasDrawer.drawRect(this.offset.x, this.offset.y, w, h, "red");
    }

    drawTilesInternal() {
        this.drawBackground();
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
    }
}