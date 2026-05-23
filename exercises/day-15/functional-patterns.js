// Day 15 — Functional Programming Patterns in Real Systems

// 1. Implement Result class with:
//    success, failure, map, flatMap, getOrElse, tap

class Result {
    constructor(ok, value, error) {
        this.ok = ok;
        this.value = value;
        this.error = error;
    }

    static success(value) {
        return new Result(true, value, null);
    }

    static failure(error) {
        return new Result(false, null, error);
    }

    map(fn) {
        if (!this.ok) return this;
        try {
            return Result.success(fn(this.value));
        } catch (err) {
            return Result.failure(err.message);
        }
    }

    flatMap(fn) {
        if (!this.ok) return this;
        try {
            return fn(this.value);
        } catch (err) {
            return Result.failure(err.message);
        }
    }

    getOrElse(defaultValue) {
        return this.ok ? this.value : defaultValue;
    }

    tap(fn) {
        if (this.ok) fn(this.value);
        return this;
    }
}


// 2. Implement createStore(initialState, reducer)

function createStore(initialState, reducer) {
    let state = initialState;
    const listeners = [];

    return {
        getState() {
            return state;
        },

        dispatch(action) {
            state = reducer(state, action);
            listeners.forEach(fn => fn(state));
        },

        subscribe(fn) {
            listeners.push(fn);
            return () => {
                const idx = listeners.indexOf(fn);
                listeners.splice(idx, 1);
            };
        }
    };
}


// 3. Build an agentReducer that handles:
//    - "SENSOR_READING" — adds reading to state.readings
//                         sets state.status to "alert" if value > 90
//                         sets state.status to "normal" otherwise
//    - "RESET"          — clears readings, sets status to "idle"
//    - "SET_MODE"       — sets state.mode to action.payload

function agentReducer(state, action) {
    switch (action.type) {
        case "SENSOR_READING":
            return {
                ...state,
                readings: [...state.readings, action.payload],
                status: action.payload.value > 90 ? "alert" : "normal",
            };
        case "RESET":
            return {
                ...state,
                readings: [],
                status: "idle",
            };
        case "SET_MODE":
            return {
                ...state,
                mode: action.payload
            };
        default:
            return state;
    }
}


// 4. Build a processReading(reading) function using Result:
//    - validates reading has id and value (failure if not)
//    - checks value is a number (failure if not)
//    - normalizes value to 0-100 range: Math.min(100, Math.max(0, value))
//    - returns Result.success with normalized reading

const processReading = reading =>
    Result.success(reading)
        .map(r => { if (!r.id || r.value === undefined) throw new Error("missing id or value"); return r; })
        .map(r => { if (typeof r.value !== "number") throw new Error("value must be a number"); return r; })
        .map(r => ({ ...r, value: Math.min(100, Math.max(0, r.value)) }));


// 5. Wire it together:
//    - create store with initial state:
//      { readings: [], status: "idle", mode: "monitoring" }
//    - subscribe and log every state change
//    - process 5 readings through Result pipeline
//    - dispatch valid ones to store
//    - invalid ones log the error
//    - dispatch RESET after all readings
//    - dispatch SET_MODE "standby"

const store = createStore(
    { readings: [], status: "idle", mode: "monitoring" },
    agentReducer
);
store.subscribe(state => {
    console.log("State changed:", state);
});
const readings = [
    { id: "s1", value: 42 },
    { id: "s2", value: 95 },
    { id: "s3", value: -10 },
    { id: "s4", value: 120 },
    { id: "bad", value: "hot" },
];
readings.forEach(reading => {
    const result = processReading(reading);

    if (result.ok) {
        store.dispatch({
            type: "SENSOR_READING",
            payload: result.value
        });
    } else {
        console.log("Error:", result.error);
    }
});
store.dispatch({ type: "RESET" });
store.dispatch({ type: "SET_MODE", payload: "standby" });