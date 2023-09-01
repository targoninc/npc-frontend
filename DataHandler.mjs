import {DataLayer} from "./DataLayer.mjs";
import {MapDrawer} from "./CanvasDrawer.mjs";

export class DataHandler {
    static loadWorld() {
        const world = DataLayer.load('world');
        if (world) {
            const canvas = document.getElementById('map');
            const mapDrawer = new MapDrawer(canvas, 500);
            mapDrawer.drawMap(world.map);
        }
    }
}