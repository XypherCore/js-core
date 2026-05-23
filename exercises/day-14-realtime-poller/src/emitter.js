export class EventEmitter {
    constructor() {
        this.listeners = new Map();
    }

    on(event, listener) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(listener);
        return this;
    }

    off(event, listener) {
        if (!this.listeners.has(event)) return this;
        const filtered = this.listeners.get(event).filter(l => l !== listener);
        this.listeners.set(event, filtered);
        return this;
    }

    emit(event, ...args) {
        if (!this.listeners.has(event)) return this;
        this.listeners.get(event).forEach(listener => listener(...args));
        return this;
    }

    once(event, listener) {
        const wrapper = (...args) => {
            listener(...args);
            this.off(event, wrapper);
        };
        return this.on(event, wrapper);
    }

    removeAllListeners(event) {
        if (event) {
            this.listeners.delete(event)
        } else {
            this.listeners.clear();
        }
        return this;
    }
}