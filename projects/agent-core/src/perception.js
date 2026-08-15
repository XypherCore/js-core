// Perception layer — data ingestion
//
// createPerception(sources)
//   sources: array of {
//     id: string,
//     fn: async function that returns a reading,
//     interval: ms
//   }
//
//   returns:
//     start()     — begins polling all sources
//     stop()      — stops all polling
//     on(event, listener) — "reading" event with { sourceId, data, timestamp }
//                           "error" event with { sourceId, error }
//     getLatest() — map of sourceId → latest reading

const EVENTS = ["reading", "error"];

function emit(listeners, event, payload) {
    for (const listener of listeners.get(event)) {
        listener(payload);
    }
}

function latestSnapshot(latest) {
    return Object.fromEntries(
        [...latest.entries()].map(([sourceId, reading]) => [
            sourceId,
            { ...reading }
        ])
    );
}

export function createPerception(sources = []) {
    const latest = new Map();
    const listeners = new Map(EVENTS.map((event) => [event, new Set()]));
    const timers = new Map();
    const polling = new Set();

    async function poll(source) {
        if (polling.has(source.id)) {
            return;
        }

        polling.add(source.id);

        try {
            const data = await source.fn();
            const reading = {
                sourceId: source.id,
                data,
                timestamp: Date.now()
            };

            latest.set(source.id, reading);
            emit(listeners, "reading", reading);
        } catch (error) {
            emit(listeners, "error", {
                sourceId: source.id,
                error
            });
        } finally {
            polling.delete(source.id);
        }
    }

    return {
        start() {
            for (const source of sources) {
                if (timers.has(source.id)) {
                    continue;
                }

                poll(source);

                const timer = setInterval(() => {
                    poll(source);
                }, source.interval);

                timers.set(source.id, timer);
            }
        },

        stop() {
            for (const timer of timers.values()) {
                clearInterval(timer);
            }

            timers.clear();
        },

        on(event, listener) {
            if (!listeners.has(event)) {
                throw new Error(`Unknown perception event: ${event}`);
            }

            listeners.get(event).add(listener);

            return () => {
                listeners.get(event).delete(listener);
            };
        },

        getLatest() {
            return latestSnapshot(latest);
        }
    };
}

export default createPerception;