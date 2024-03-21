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
        this.canvas.onmousedown = (e) => {
            this.handleDragStart(e);
        };
        this.canvas.onmouseup = (e) => {
            this.handleDragEnd(e);
        };
        this.canvas.onmouseout = (e) => {
            this.mapDrawer.redraw(true);
        }
    }

    handleMouseMove(e) {
        if (this.dragStart) {
            let { x, y } = this.getMousePos(e);
            let offsetX = x - this.dragStart.x;
            let offsetY = y - this.dragStart.y;
            this.mapDrawer.move(offsetX, offsetY);
            this.dragStart = { x, y };
            this.mapDrawer.redraw();
        } else {
            // only hovering
            const tile = this.mapDrawer.getTileAtMousePosition(e);
            this.mapDrawer.redraw(true);
            if (tile !== null) {
                let { x, y, size } = this.mapDrawer.getTileCoordinates(tile);
                let hoverText = `(${tile.x}, ${tile.y}) - ${tile.type}`;
                if (tile.building) {
                    hoverText += ` - ${tile.building.type}`;
                }
                this.mapDrawer.canvasDrawer.drawRect(x, y, size, size, 'rgba(255, 255, 255, 0.5)');
                this.mapDrawer.drawTextbox(hoverText, x, y);
            }
        }
    }

    handleMouseScroll(e) {
        e.preventDefault();
        let delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        let { x: mouseX, y: mouseY } = this.getMousePos(e);
        if (delta < 0) {
            this.mapDrawer.zoomOut(mouseX, mouseY);
        } else {
            this.mapDrawer.zoomIn(mouseX, mouseY);
        }
        this.mapDrawer.redraw();
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