import {MapEventHandler} from "./MapEventHandler.mjs";
import {NumberGenerator} from "../NumberGenerator.mjs";
import {ThreeJsDrawer} from "./ThreeJsDrawer.mjs";

export class MapDrawer {
    constructor(canvas) {
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
        this.renderer = new ThreeJsDrawer(canvas, this.textures);
        this.renderer.setOnTexturesLoaded(() => {
            this.redraw();
        });
        this.canvas = canvas;
        this.eventHandler = new MapEventHandler(this, canvas);
        this.eventHandler.initialize();
        this.mapSize = 3000;
        this.zoom = 1;
        this.zoomChange = 1.1;
        this.offset = {x: this.mapSize / 2, y: this.mapSize / 2};
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
        const tileX = x / this.getTileSize();
        const tileY = y / this.getTileSize();
        return this.getTileAt(Math.floor(tileX), Math.floor(tileY));
    }

    getBuildingOnTile(tile) {
        return this.map.buildings.find(building => building.coordinates.x === tile.x && building.coordinates.y === tile.y);
    }

    getTileAtMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        const canvasFactor = this.canvas.clientWidth / this.mapSize;
        x = (x / canvasFactor - (this.offset.x));
        y = (y / canvasFactor - (this.offset.y));
        const tile = this.getTileAtPosition(x, y);
        if (tile) {
            tile.building = this.getBuildingOnTile(tile);
        }
        return tile;
    }

    /**
     *
     * @param buildings
     * @param minHeight
     * @param maxHeight
     */
    drawBuildings(buildings, minHeight, maxHeight) {
        const maxSize = Math.max(...buildings.map(b => b.size));
        buildings.forEach(building => {
            this.drawBuilding(building, maxSize, minHeight, maxHeight);
        });
    }

    drawBuilding(building, maxSize, minHeight, maxHeight) {
        const {x, y} = this.getBuildingCoordinates(building);
        const relativeSize = building.size / maxSize;
        const size = relativeSize * this.getTileSize();
        const inset = ((1 * this.getTileSize()) - size) / 2;
        const tileAtPosition = this.getTileAtPosition(building.coordinates.x, building.coordinates.y);
        let relativeHeight = (tileAtPosition.height - minHeight) / (maxHeight - minHeight);
        relativeHeight *= 100;
        this.renderer.drawTexturedRect(x + inset, y + inset, size, size, this.textures.building, relativeHeight, false);
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
        if (textX + textWidth > this.mapSize) {
            textX = this.mapSize - textWidth - padding;
        }
        this.renderer.drawRect(textX - padding, textY - (.5 * padding), textWidth, fontSize + (2 * padding), 'rgba(0, 0, 0, 0.5)');
        this.renderer.drawText(textX, textY + fontSize, text, 'white', fontSize);
        return {x, y, width: textWidth, height: fontSize + (2 * padding)};
    }

    getTileSize() {
        return this.mapSize / this.map.resolution;
    }

    getTileCoordinates(tile) {
        return {
            x: tile.x * this.getTileSize(),
            y: tile.y * this.getTileSize(),
            size: tile.size * this.getTileSize()
        };
    }

    getBuildingCoordinates(building) {
        return {
            x: building.coordinates.x * this.getTileSize(),
            y: building.coordinates.y * this.getTileSize(),
            size: building.size * this.getTileSize()
        };
    }

    drawTile(tile, minHeight, maxHeight) {
        const tileTextures = this.textures[tile.type];
        const coords = this.getTileCoordinates(tile);
        const tileSeed = tile.x * 1000 + tile.y;
        let relativeHeight = (tile.height - minHeight) / (maxHeight - minHeight);
        relativeHeight *= 100;

        if (tileTextures !== undefined) {
            let texture;
            if (tileTextures.constructor === Array) {
                const textureIndex = NumberGenerator.random(0, tileTextures.length, tileSeed, true);
                texture = tileTextures[textureIndex];
            } else {
                texture = this.textures[tile.type];
            }
            this.renderer.drawTexturedRect(coords.x, coords.y, coords.size, coords.size, texture, relativeHeight);
        } else {
            this.renderer.drawRect(coords.x, coords.y, coords.size, coords.size, tile.color, relativeHeight);
        }
    }

    getImage(url) {
        const image = document.createElement('img');
        image.src = "./images/" + url + ".gif";
        return image;
    }

    move(x, y) {
        const canvasFactor = this.canvas.clientWidth / this.mapSize;
        x = (x / canvasFactor);
        y = (y / canvasFactor);
        this.offset.x += x;
        this.offset.y += y;
        this.renderer.updateCameraPosition(this.offset, this.zoom);
    }

    zoomIn() {
        this.zoom *= this.zoomChange;
        this.renderer.updateCameraPosition(this.offset, this.zoom);
    }

    zoomOut() {
        this.zoom /= this.zoomChange;
        this.renderer.updateCameraPosition(this.offset, this.zoom);
    }

    /**
     *
     * @param map {Array<MapTile>}
     */
    drawMap(map) {
        this.map = map;
        this.renderer.clear(this.offset, this.zoom);
        this.drawTiles();
    }

    redraw() {
        this.drawMap(this.map);
    }

    drawBackground() {
        this.renderer.drawRect(0, 0, this.mapSize, this.mapSize, 0xff0000, 1, false);
    }

    drawTiles() {
        this.renderer.cleanScene();
        //this.drawBackground();
        const minHeight = Math.min(...this.map.tiles.map(tile => tile.height));
        const maxHeight = Math.max(...this.map.tiles.map(tile => tile.height));
        this.map.tiles.forEach(tile => {
            this.drawTile(tile, minHeight, maxHeight);
        });
        this.drawBuildings(this.map.buildings, minHeight, maxHeight);
        this.renderer.softDisplay();
    }
}