export class DataLayer {
    static get storageImplementation() {
        return localStorage;
    }

    static load(key) {
        const value = this.storageImplementation.getItem(key);
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    }

    static save(key, value) {
        if (value.constructor !== String) {
            value = JSON.stringify(value);
        }
        this.storageImplementation.setItem(key, value);
    }
}