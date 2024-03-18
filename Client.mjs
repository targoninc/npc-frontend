import {MessageHandler} from "./MessageHandler.mjs";
import {Message} from "./Message.mjs";
import {OverlayAdapter} from "./OverlayAdapter.mjs";

const messageHandler = new MessageHandler("localhost", 3456);

window.sendMessage = (type, data = null) => {
    const message = new Message(type, data);
    messageHandler.send(message);
}

OverlayAdapter.addRegenerateButton();
