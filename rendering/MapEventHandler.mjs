export class MapEventHandler {
    constructor(mapDrawer, canvas) {
        this.mapDrawer = mapDrawer;
        this.canvas = canvas;
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        let rendering = false;
        this.canvas.onmousemove = (e) => {
            if (!rendering) {
                rendering = true;
                requestAnimationFrame(() => {
                    this.handleMouseMove(e);
                    rendering = false;
                });
            }
        };
        this.canvas.onwheel = (e) => {
            if (!rendering) {
                rendering = true;
                requestAnimationFrame(() => {
                    this.handleMouseScroll(e);
                    rendering = false;
                });
            }
        };
    }

    handleMouseMove(e) {
        const tile = this.mapDrawer.getTileAtMousePosition(e);
        this.mapDrawer.redraw();
        if (tile !== null) {
            let technicalX = tile.x * this.mapDrawer.getWidthFactor();
            let technicalY = tile.y * this.mapDrawer.getHeightFactor();
            let tileSize = tile.size * this.mapDrawer.getWidthFactor();
            let hoverText = `(${tile.x}, ${tile.y}) - ${tile.type}`;
            if (tile.building) {
                hoverText += ` - ${tile.building.type}`;
            }
            this.mapDrawer.canvasDrawer.drawRect(technicalX, technicalY, tileSize, tileSize, 'rgba(255, 255, 255, 0.5)');
            this.mapDrawer.drawTextbox(hoverText, technicalX, technicalY);
        }
    }

    handleMouseScroll(e) {
        e.preventDefault();
        let delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        if (delta < 0) {
            this.mapDrawer.zoomOut();
        } else {
            this.mapDrawer.zoomIn();
        }
        this.mapDrawer.redraw();
    }
}