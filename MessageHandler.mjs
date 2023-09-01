import {Message} from "./Message.mjs";
import {DataHandler} from "./DataHandler.mjs";

export class MessageHandler {
    constructor(host, port) {
        this.ws = new WebSocket(`ws://${host}:${port}`);
        this.ws.onmessage = this.handleMessage.bind(this);
        this.ws.onopen = this.sendWorldRequest.bind(this);
    }

    sendWorldRequest() {
        const message = new Message('worldRequest', null);
        this.send(message);
    }

    send(message) {
        this.ws.send(message.pack());
    }

    handleMessage(event) {
        const message = Message.unpack(event.data);
        console.log(`Received message: ${message.type}`);

        switch (message.type) {
            case 'response':
                document.getElementById('response').textContent = message.data;
                break;
            case 'worldResponse':
                DataHandler.loadWorld(message.data);
                break;
            case 'error':
                console.error(message.data);
                break;
            // Handle other message types as needed
        }
    }
}