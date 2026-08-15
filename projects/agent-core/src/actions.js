// Action executors
//
// createActionRegistry()
//   returns:
//     register(name, fn)  — register an action handler
//     execute(name, context, memory) → Promise<result>
//     getRegistered()     — list of registered action names

export function createActionRegistry() {
    const actions = new Map();

    return {
        register(name, fn) {
            if (typeof name !== "string" || name.length === 0) {
                throw new TypeError("Action name must be a non-empty string");
            }

            if (typeof fn !== "function") {
                throw new TypeError("Action handler must be a function");
            }

            actions.set(name, fn);

            return () => {
                actions.delete(name);
            };
        },

        async execute(name, context = {}, memory) {
            if (!actions.has(name)) {
                throw new Error(`Unknown action: ${name}`);
            }

            const action = actions.get(name);

            return action(context, memory);
        },

        getRegistered() {
            return [...actions.keys()];
        }
    };
}

export default createActionRegistry;