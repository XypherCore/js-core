// Agent memory — persistent state store
//
// createMemory(initialState)
//   returns:
//     get(key)           — get value by key
//     set(key, value)    — set value, emit change
//     delete(key)        — delete key
//     getAll()           — return full state snapshot
//     subscribe(fn)      — called on every state change
//                          fn receives { key, value, previous }
//     history(key)       — array of past values for a key (last 10)
//     clear()            — reset to initial state

const HISTORY_LIMIT = 10;

const snapshot = (state) => ({ ...state });

function recordHistory(histories, key, value) {
    const values = histories.get(key) ?? [];

    values.push(value);

    if (values.length > HISTORY_LIMIT) {
        values.shift();
    }

    histories.set(key, values);
}

function notify(subscribers, change) {
    for (const subscriber of subscribers) {
        subscriber(change);
    }
}

export function createMemory(initialState = {}) {
    const initial = snapshot(initialState);
    let state = snapshot(initial);

    const subscribers = new Set();
    const histories = new Map();

    return {
        get(key) {
            return state[key];
        },

        set(key, value) {
            const previous = state[key];

            if (Object.prototype.hasOwnProperty.call(state, key)) {
                recordHistory(histories, key, previous);
            }

            state = {
                ...state,
                [key]: value
            };

            notify(subscribers, { key, value, previous });

            return value;
        },

        delete(key) {
            if (!Object.prototype.hasOwnProperty.call(state, key)) {
                return false;
            }

            const previous = state[key];

            recordHistory(histories, key, previous);

            const nextState = snapshot(state);
            delete nextState[key];
            state = nextState;

            notify(subscribers, {
                key,
                value: undefined,
                previous
            });

            return true;
        },

        getAll() {
            return snapshot(state);
        },

        subscribe(fn) {
            subscribers.add(fn);

            return () => {
                subscribers.delete(fn);
            };
        },

        history(key) {
            return [...(histories.get(key) ?? [])];
        },

        clear() {
            const previous = snapshot(state);

            state = snapshot(initial);
            histories.clear();

            notify(subscribers, {
                key: null,
                value: snapshot(state),
                previous
            });

            return snapshot(state);
        }
    };
}

export default createMemory;