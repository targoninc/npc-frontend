export class Message {
    /**
     * Creates a new Message object
     * @param type {string}
     * @param data {*}
     * @returns {Message}
     */
    constructor(type, data) {
        this.type = type;
        this.data = data;
        return this;
    }

    static fromString(json) {
        const obj = JSON.parse(json);
        return new Message(obj.type, obj.data);
    }

    toString() {
        return JSON.stringify(this);
    }
}