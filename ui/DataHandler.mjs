import {MapDrawer} from "./rendering/MapDrawer.mjs";

export class DataHandler {
    static loadWorld(world) {
        const canvas = document.getElementById('map');
        const mapDrawer = new MapDrawer(canvas, 3000);
        console.log("Drawing map...");
        mapDrawer.drawMap(world.map);
    }
}
