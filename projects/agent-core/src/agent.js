// Core Agent class — extends EventEmitter
//
// constructor(options)
//   options: {
//     name: string,
//     perception: created via createPerception(),
//     decisions: created via createDecisionEngine(),
//     actions: created via createActionRegistry(),
//     memory: created via createMemory(),
//     logger: created via createLogger()
//   }
//
// start()
//   starts perception layer
//   on each perception reading:
//     updates memory with latest reading
//     runs decision engine
//     executes matched actions
//     emits "cycle" with { perception, decisions, actions }
//   emits "started"
//
// stop()
//   stops perception
//   emits "stopped"
//
// getStatus()
//   returns {
//     name,
//     uptime,
//     cycles,
//     memorySnapshot,
//     activeDecisions
//   }

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

export class Agent extends EventEmitter {
    constructor(options = {}) {
        super();

        this.name = options.name ?? "agent";
        this.perception = options.perception;
        this.decisions = options.decisions;
        this.actions = options.actions;
        this.memory = options.memory;
        this.logger = options.logger;

        this.startedAt = null;
        this.cycles = 0;
        this.activeDecisions = [];
        this.unsubscribeReading = null;
        this.unsubscribeError = null;
        this.running = false;
    }

    start() {
        if (this.running) {
            return this;
        }

        this.running = true;
        this.startedAt = Date.now();

        this.unsubscribeReading = this.perception.on("reading", (reading) => {
            this.runCycle(reading);
        });

        this.unsubscribeError = this.perception.on("error", (error) => {
            this.logger?.error?.("Perception error", error);
            this.emit("error", error);
        });

        this.perception.start();

        this.logger?.info?.(`${this.name} started`);
        this.emit("started", this.getStatus());

        return this;
    }

    stop() {
        if (!this.running) {
            return this;
        }

        this.perception.stop();

        this.unsubscribeReading?.();
        this.unsubscribeError?.();

        this.unsubscribeReading = null;
        this.unsubscribeError = null;
        this.running = false;
        this.activeDecisions = [];

        this.logger?.info?.(`${this.name} stopped`);
        this.emit("stopped", this.getStatus());

        return this;
    }

    async runCycle(reading) {
        try {
            this.memory.set(reading.sourceId, reading);

            const decisions = this.decisions.evaluate(
                this.perception,
                this.memory
            );

            this.activeDecisions = decisions;

            const actionResults = [];

            for (const decision of decisions) {
                try {
                    const result = await this.actions.execute(
                        decision.action,
                        decision.context,
                        this.memory
                    );

                    actionResults.push({
                        action: decision.action,
                        decision,
                        result
                    });
                } catch (error) {
                    const failure = {
                        action: decision.action,
                        decision,
                        error
                    };

                    actionResults.push(failure);
                    this.emit("error", failure);
                }
            }

            this.cycles += 1;

            this.emit("cycle", {
                perception: reading,
                decisions,
                actions: actionResults
            });
        } catch (error) {
            this.logger?.error?.("Agent cycle failed", error);
            this.emit("error", error);
        }
    }

    getStatus() {
        return {
            name: this.name,
            uptime: this.startedAt ? Date.now() - this.startedAt : 0,
            cycles: this.cycles,
            memorySnapshot: this.memory.getAll(),
            activeDecisions: [...this.activeDecisions]
        };
    }
}

export default Agent;