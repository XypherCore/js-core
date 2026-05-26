// Day 16 — Advanced Async Patterns & Real-Time Systems


// 1. CircuitBreaker class
//    - failureThreshold: 3
//    - cooldownMs: 5000
//    - states: closed, open, half-open

class CircuitBreaker {
    constructor(fn, options = {}) {
        this.fn = fn;
        this.failureThreshold = options.failureThreshold || 3;
        this.cooldownMs = options.cooldownMs || 5000;
        this.state = "closed"; // closed = normal, open = tripped, half-open = testing
        this.failures = 0;
        this.lastFailure = null;
    }

    async call(...args) {
        if (this.state === "open") {
            const elapsed = Date.now() - this.lastFailure;
            if (elapsed < this.cooldownMs) {
                throw new Error("Circuit open — service unavailable");
            }
            this.state = "half-open"; // try once
        }

        try {
            const result = await this.fn(...args);
            this.onSuccess();
            return result;
        } catch (err) {
            this.onFailure();
            throw err;
        }
    }

    onSuccess() {
        this.failures = 0;
        this.state = "closed";
    }

    onFailure() {
        this.failures++;
        this.lastFailure = Date.now();
        if (this.failures >= this.failureThreshold) {
            this.state = "open";
            console.log("Circuit tripped — too many failures");
        }
    }

    getState() {
        return { state: this.state, failures: this.failures };
    }
}


// 2. StateMachine for an agent with states:
//    idle → initializing → monitoring → alerting → idle
//    Transitions:
//    - idle:         { initialize: "initializing" }
//    - initializing: { complete: "monitoring", fail: "idle" }
//    - monitoring:   { alert: "alerting", shutdown: "idle" }
//    - alerting:     { resolve: "monitoring", shutdown: "idle" }
//    onEnter hooks — log when entering each state

class StateMachine {
    constructor(config) {
        this.state = config.initial;
        this.transitions = config.transitions;
        this.onEnter = config.onEnter || {};
        this.onExit = config.onExit || {};
        this.listeners = [];
    }

    can(action) {
        return !!(this.transitions[this.state]?.[action]);
    }

    async dispatch(action, payload) {
        if (!this.can(action)) {
            throw new Error(`Cannot ${action} from state ${this.state}`);
        }

        const prevState = this.state;
        const nextState = this.transitions[this.state][action];

        if (this.onExit[prevState]) await this.onExit[prevState](payload);
        this.state = nextState;
        if (this.onEnter[nextState]) await this.onEnter[nextState](payload);

        this.listeners.forEach(fn => fn({ from: prevState, to: nextState, action, payload }));
        return this.state;
    }

    onChange(fn) {
        this.listeners.push(fn);
        return () => {
            this.listeners = this.listeners.filter(l => l !== fn);
        };
    }
}

const state = new StateMachine({
    initial: "idle",
    transitions: {
        idle: { initialize: "initializing" },
        initializing: { complete: "monitoring", fail: "idle" },
        monitoring: { alert: "alerting", shutdown: "idle" },
        alerting: { resolve: "monitoring", shutdown: "idle" }
    },
    onEnter: {
        idle: async () => console.log("entered idle"),
        initializing: async () => console.log("entered initializing"),
        monitoring: async () => console.log("entered monitoring"),
        alerting: async () => console.log("entered alerting")
    }
})


// 3. simulateDataSource(shouldFail)
//    - async function
//    - if shouldFail: throw new Error("Source unavailable")
//    - otherwise return { id: Date.now(), value: Math.random() * 100 }

async function simulateDataSource(shouldFail) {
    if (shouldFail) {
        throw new Error("Source unavailable");
    }
    return { id: Date.now(), value: Math.random() * 100 };
}


// 4. Wire it together:
//    - wrap simulateDataSource with CircuitBreaker
//    - create the agent StateMachine
//    - initialize the agent
//    - poll data every 1 second using setInterval
//    - each poll: call breaker.call(false) — or true to test failures
//    - if value > 80: dispatch "alert" to state machine
//    - if in alerting and value <= 80: dispatch "resolve"
//    - if circuit opens: dispatch "shutdown"
//    - run for 10 seconds then stop

const breaker = new CircuitBreaker(simulateDataSource);

await state.dispatch("initialize");
await state.dispatch("complete");

let callCount = 0;
const timer = setInterval(async () => {
    try {
        const shouldFail = callCount++ < 4;
        const data = await breaker.call(shouldFail);
        if (data.value > 80 && state.state === "monitoring") {
            await state.dispatch("alert");
        }
        if (data.value <= 80 && state.state === "alerting") {
            await state.dispatch("resolve");
        }
    } catch (err) {
        if (breaker.getState().state === "open" && state.can("shutdown")) {
            await state.dispatch("shutdown");
        }
    }
}, 1000);

setTimeout(() => {
    clearInterval(timer);
}, 10000);