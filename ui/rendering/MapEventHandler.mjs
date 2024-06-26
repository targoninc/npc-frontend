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
        this.canvas.onmousedown = (e) => {
            this.handleDragStart(e);
        };
        this.canvas.onmouseup = (e) => {
            this.handleDragEnd(e);
        };
        this.canvas.onmouseout = (e) => {
            this.mapDrawer.redraw();
        };
        this.canvas.onwheel = (e) => {
            e.preventDefault();
            if (e.deltaY > 0) {
                this.mapDrawer.zoomIn();
            } else {
                this.mapDrawer.zoomOut();
            }
        };
    }

    handleMouseMove(e) {
        if (this.dragStart) {
            let { x, y } = this.getMousePos(e);
            let offsetX = x - this.dragStart.x;
            let offsetY = y - this.dragStart.y;
            this.mapDrawer.move(-offsetX, -offsetY);
            this.dragStart = { x, y };
        } else {
            return;
            // only hovering
            const tile = this.mapDrawer.getTileAtMousePosition(e);
            this.mapDrawer.redraw();
            if (tile !== null) {
                let { x, y, size } = this.mapDrawer.getTileCoordinates(tile);
                this.mapDrawer.renderer.drawRect(x, y, size, size, 'rgba(255, 255, 255, 0.25)');
                x += size;
                let hoverText = `${tile.type}`;
                let tileTextCoords = this.mapDrawer.drawTextbox(hoverText, x, y);
                hoverText = `Height: ${tile.height}`;
                tileTextCoords = this.mapDrawer.drawTextbox(hoverText, tileTextCoords.x, tileTextCoords.y + tileTextCoords.height, 26, 13);
                hoverText = `Coordinates: ${tile.x}, ${tile.y}`;
                tileTextCoords = this.mapDrawer.drawTextbox(hoverText, tileTextCoords.x, tileTextCoords.y + tileTextCoords.height, 26, 13);
                if (tile.building) {
                    hoverText = `Building: ${tile.building.type}`;
                    this.mapDrawer.drawTextbox(hoverText, tileTextCoords.x, tileTextCoords.y + tileTextCoords.height, 26, 13);
                }
            }
        }
    }

    handleDragStart(e) {
        this.dragStart = this.getMousePos(e);
    }

    handleDragEnd(e) {
        this.dragStart = null;
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
}