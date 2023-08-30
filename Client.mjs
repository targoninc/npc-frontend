import {MessageHandler} from "./MessageHandler.mjs";
import {Message} from "./Message.mjs";

const messageHandler = new MessageHandler("localhost", 3000);

window.sendMessage = () => {
    const inputElem = document.getElementById('inputMessage');
    const message = new Message('greeting', inputElem.value);
    messageHandler.send(message);
}
