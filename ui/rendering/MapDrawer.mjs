import {MapEventHandler} from "./MapEventHandler.mjs";
import {NumberGenerator} from "../NumberGenerator.mjs";
import {ThreeJsDrawer} from "./ThreeJsDrawer.mjs";
import {Models} from "../models/Models.mjs";

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
            brick: this.getImage("brick"),
        };
        this.renderer = new ThreeJsDrawer(canvas, this.textures);
        this.renderer.setOnTexturesLoaded(() => {
            this.redraw();
        });
        this.canvas = canvas;
        this.eventHandler = new MapEventHandler(this, canvas);
        this.eventHandler.initialize();
        this.mapSize = 3000;
        this.heightModifier = 10;
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
     */
    drawBuildings(buildings) {
        buildings.forEach(building => {
            this.drawBuilding(building);
        });
    }

    drawBuilding(building) {
        const {x, y} = this.getBuildingCoordinates(building);
        const tileAtPosition = this.getTileAt(building.coordinates.x, building.coordinates.y);
        this.renderer.drawModelDefinition(Models.house, x, y, tileAtPosition.height * this.heightModifier, this.getTileSize() / 10);
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
            this.renderer.drawTexturedRect(coords.x, coords.y, coords.size, coords.size, texture, Math.max(.01, tile.height * this.heightModifier));
        } else {
            this.renderer.drawRect(coords.x, coords.y, coords.size, coords.size, tile.color, Math.max(.01, tile.height * this.heightModifier));
        }
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
        this.map.tiles.forEach(tile => {
            this.drawTile(tile);
        });
        this.drawBuildings(this.map.buildings);
        this.renderer.softDisplay();
    }
}