import {signal} from "@targoninc/fjs";
import {GenericTemplates} from "./templates/GenericTemplates.mjs";

export class OverlayAdapter {
    static getOverlay() {
        return document.getElementById('overlay');
    }

    static removeProgressText() {
        const progressText = document.getElementById("progressText");
        if (progressText) {
            progressText.remove();
        }
    }

    static handleProgressUpdate(message) {
        const overlay = OverlayAdapter.getOverlay();
        const progressText = overlay.querySelector('#progressText');
        if (!progressText) {
            window.progress = {
                type: signal(message.data.type),
                progress: signal(message.data.progress),
                done: signal([])
            };
            overlay.appendChild(GenericTemplates.progressText(window.progress.type, window.progress.progress, window.progress.done));
        } else {
            if (message.data.type !== window.progress.type.value) {
                window.progress.done.value = window.progress.done.value.concat(window.progress.type.value);
            }
            window.progress.type.value = message.data.type;
            window.progress.progress.value = message.data.progress;
        }
    }

    static addRegenerateButton() {
        const overlay = OverlayAdapter.getOverlay();
        const regenerateButton = GenericTemplates.button('Regenerate World', () => {
            window.sendMessage('generateWorld');
        });
        overlay.appendChild(regenerateButton);
    }
}