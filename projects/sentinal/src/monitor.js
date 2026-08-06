// Core monitor — extends EventEmitter
//
// class Monitor extends EventEmitter
//
// constructor(options)
//   options: {
//     interval: ms between polls,
//     metrics: array of metric functions,
//     alertEngine: created via createAlertEngine()
//   }
//
// start()
//   polls all metric functions every interval
//   for each reading:
//     emits "metric" with the reading
//     runs through alert engine
//     emits "alert" for each fired alert
//   returns this
//
// stop()
//   stops polling
//   emits "stopped"
//   returns this
//
// getSnapshot()
//   returns current state:
//   {
//     uptime: ms since start,
//     totalReadings: number,
//     activeAlerts: array,
//     latest: { cpu, memory, network }  ← most recent reading per type
//   }

import { createAlertEngine } from "./alerting.js";
import { cpuMetric, memoryMetric, networkMetric } from "./metrics.js";


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


export class Monitor extends EventEmitter {
    constructor(options = {}) {
        super();

        this.interval = options.interval ?? 1000;
        this.metrics = options.metrics ?? [
            cpuMetric,
            memoryMetric,
            networkMetric
        ];
        this.alertEngine = options.alertEngine ?? createAlertEngine();

        this.timer = null;
        this.startedAt = null;
        this.totalReadings = 0;
        this.latest = {};
    }

    start() {
        if (this.timer) {
            return this;
        }

        this.startedAt = Date.now();

        this.timer = setInterval(() => {
            for (const metricFn of this.metrics) {
                const metric = metricFn();

                this.totalReadings += 1;
                this.latest[metric.type] = metric;

                this.emit("metric", metric);

                const alerts = this.alertEngine.evaluate(metric);

                for (const alert of alerts) {
                    this.emit("alert", alert);
                }
            }
        }, this.interval);

        return this;
    }

    stop() {
        if (!this.timer) {
            return this;
        }

        clearInterval(this.timer);
        this.timer = null;

        this.emit("stopped");

        return this;
    }

    getSnapshot() {
        const uptime = this.startedAt ? Date.now() - this.startedAt : 0;

        return {
            uptime,
            totalReadings: this.totalReadings,
            activeAlerts: this.alertEngine.getActive(),
            latest: this.latest
        };
    }
}