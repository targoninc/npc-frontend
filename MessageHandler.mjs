import {Message} from "./Message.mjs";

export class MessageHandler {
    constructor(host, port) {
        this.ws = new WebSocket(`ws://${host}:${port}`);
        this.ws.onmessage = this.handleMessage.bind(this);
    }

    send(message) {
        this.ws.send(message.toString());
    }

    handleMessage(event) {
        const message = Message.fromString(event.data);

        switch (message.type) {
            case 'response':
                document.getElementById('response').textContent = message.data;
                break;
            case 'error':
                console.error(message.data);
                break;
            // Handle other message types as needed
        }
    }
}