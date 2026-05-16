// Day 12 — Event-Driven Programming

// Start by writing the EventEmitter base class, then build SensorNetwork.....

class EventEmitter {
    constructor() {
        this.listeners = new Map(); // event name → array of listeners
    }

    on(event, listener) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(listener);
        return this; // enable chaining
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
            this.off(event, wrapper); //remove after first call
        };
        return this.on(event, wrapper);
    }

    removeAllListeners(event) {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
        return this;
    }
}


// SensorNetwork extends your EventEmitter
// 
// Methods:
// - addSensor(id, type)
//     registers a sensor, emits "sensor:added"
//
// - readSensor(id)
//     simulates async reading (delay 200ms)
//     returns { id, type, value: random number, timestamp }
//     emits "sensor:reading" with the result
//     emits "sensor:alert" if value > 80
//
// - pollAll(intervalMs)
//     reads ALL sensors every intervalMs
//     returns a stop function
//
// - getStats()
//     returns { total, alertCount, lastReading }
//     alertCount tracks how many alert events fired

class SensorNetwork extends EventEmitter {
    constructor() {
        super();
        this.sensors = [];
        this.alertCount = 0;
        this.lastReading = null;
    }

    addSensor(id, type) {
        const sensor = { id, type };
        this.sensors.push(sensor);
        this.emit("sensor:added", sensor);
        return this;
    }

    async readSensor(id) {
        const sensor = this.sensors.find(sensor => sensor.id === id);

        if (!sensor) {
            throw new Error(`Sensor not found ${id}`);
        }

        await new Promise(resolve => setTimeout(resolve, 200));

        const value = Math.floor(Math.random() * 101) // Random number
        const reading = {
            id: sensor.id,
            type: sensor.type,
            value,
            timestamp: new Date()
        };

        this.lastReading = reading;
        this.emit("sensor:reading", reading);
        if (value > 80) {
            this.alertCount++;
            this.emit("sensor:alert", reading);
        }

        return reading;
    }

    pollAll(intervalMs) {
        const intervalId = setInterval(() => {
            this.sensors.forEach(sensor => {
                this.readSensor(sensor.id);
            });
        }, intervalMs);

        return () => {
            clearInterval(intervalId);
        };
    }

    getStats() {
        return {
            total: this.sensors.length,
            alertCount: this.alertCount,
            lastReading: this.lastReading
        };
    }
}


// Wire it up:
const network = new SensorNetwork();

network.on("sensor:added", ({ id, type }) =>
    console.log(`Sensor added: ${id} (${type})`)
);

network.on("sensor:reading", reading =>
    console.log(`Reading from ${reading.id}:`, reading.value)
);

network.on("sensor:alert", reading =>
    console.log(`ALERT — ${reading.id} value ${reading.value} exceeds threshold`)
);

network.addSensor("S1", "temperature");
network.addSensor("S2", "pressure");
network.addSensor("S3", "humidity");

const stop = network.pollAll(1000);

setTimeout(() => {
    stop();
    console.log("Stats:", network.getStats());
}, 5000);