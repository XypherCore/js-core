// ObjectPool from Day 20

export class ObjectPool {
    constructor(factory, reset, initialSize) {
        this.factory = factory;
        this.reset = reset;
        this.pool = Array.from({ length: initialSize }, factory);
        this._totalCreated = initialSize;
    }

    acquire() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        const obj = this.factory();
        this._totalCreated++;
        return obj;
    }

    release(obj) {
        this.reset(obj);
        this.pool.push(obj);
    }

    get size() {
        return this.pool.length;
    }

    get totalCreated() {
        return this._totalCreated;
    }
}