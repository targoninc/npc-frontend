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
            ]
        };
        this.canvasDrawer = new CanvasDrawer(canvas, size, this.textures);
        this.canvas = canvas;
        this.eventHandler = new MapEventHandler(this, canvas);
        this.eventHandler.initialize();
        this.zoom = 1;
        this.offset = {x: 0, y: 0};
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
        let baseTileSize = Math.min(this.canvas.width, this.canvas.height) / this.map.resolution;
        let tileSize = (Math.min(this.canvas.clientWidth, this.canvas.clientHeight) / Math.min(this.canvas.width, this.canvas.height)) * baseTileSize / this.zoom;
        const tileX = Math.floor(x / tileSize) - Math.floor(this.offset.x / baseTileSize / this.zoom);
        const tileY = Math.floor(y / tileSize) - Math.floor(this.offset.y / baseTileSize / this.zoom);
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
        const width = relativeSize * this.getWidthFactor();
        const height = relativeSize * this.getHeightFactor();
        const inset = ((1 * this.getWidthFactor()) - width) / 2;
        const colorDeviation = (relativeSize * relativeSize) * 60;
        this.canvasDrawer.drawRect(x + inset, y + inset, width, height, `rgba(${90 + colorDeviation},47,${30 + colorDeviation},1)`);
    }

    drawTextbox(text, x, y) {
        const fontSize = 52;
        const margin = fontSize * .5;
        let textY = y - fontSize;
        if (textY < .5 * margin) {
            textY = .5 * margin;
        }
        let textX = x;
        if (textX < margin) {
            textX = margin;
        }
        let textWidth = text.length * (fontSize * .5) + (2 * margin);
        if (textX + textWidth > this.canvas.width) {
            textX = this.canvas.width - textWidth - margin;
        }
        this.canvasDrawer.drawRect(textX - margin, textY - (.5 * margin), textWidth, fontSize + (2 * margin), 'rgba(0, 0, 0, 0.5)');
        this.canvasDrawer.drawText(textX, textY + fontSize, text, 'white', fontSize);
    }

    getWidthFactor() {
        return this.canvas.width / this.map.resolution;
    }

    getHeightFactor() {
        return this.canvas.height / this.map.resolution;
    }

    getTileCoordinates(tile) {
        return {
            x: (tile.x * this.getWidthFactor() + (this.offset.x / this.zoom)) / this.zoom,
            y: (tile.y * this.getHeightFactor() + (this.offset.y / this.zoom)) / this.zoom,
            size: tile.size * this.getWidthFactor() / this.zoom
        };
    }

    getBuildingCoordinates(building) {
        return {
            x: (building.coordinates.x * this.getWidthFactor() + (this.offset.x / this.zoom)) / this.zoom,
            y: (building.coordinates.y * this.getHeightFactor() + (this.offset.y / this.zoom)) / this.zoom,
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
        this.offset.x += x;
        this.offset.y += y;
    }

    zoomOut() {
        this.zoom = Math.min(1, this.zoom * 1.1);
        if (this.zoom === 1) {
            this.offset = {x: 0, y: 0};
        }
        this.drawMap(this.map, false);
    }

    zoomIn() {
        this.zoom = Math.max(.1, this.zoom / 1.1);
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
        console.log("Cached map");
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

    drawTilesInternal() {
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