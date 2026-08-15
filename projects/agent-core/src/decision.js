// Rule-based decision engine
//
// createDecisionEngine(rules)
//   rules: array of {
//     name: string,
//     condition: fn(perception, memory) → boolean,
//     action: string  ← action name to execute
//     priority: number ← higher fires first if multiple match
//     cooldown: ms
//   }
//
//   returns:
//     evaluate(perception, memory) → array of decisions
//       each decision: { rule, action, context }
//     getHistory()  → last 20 decisions|

const HISTORY_LIMIT = 20;

function snapshotPerception(perception) {
    if (perception && typeof perception.getLatest === "function") {
        return perception.getLatest();
    }

    return perception;
}

function snapshotMemory(memory) {
    if (memory && typeof memory.getAll === "function") {
        return memory.getAll();
    }

    return memory;
}

function remember(history, decisions) {
    history.push(...decisions);

    while (history.length > HISTORY_LIMIT) {
        history.shift();
    }
}

export function createDecisionEngine(rules = []) {
    const sortedRules = [...rules].sort((a, b) => {
        return (b.priority ?? 0) - (a.priority ?? 0);
    });

    const lastFired = new Map();
    const history = [];

    return {
        evaluate(perception, memory) {
            const now = Date.now();
            const decisions = [];

            for (const rule of sortedRules) {
                const cooldown = rule.cooldown ?? 0;
                const previousFire = lastFired.get(rule.name) ?? 0;
                const isCoolingDown = now - previousFire < cooldown;

                if (isCoolingDown) {
                    continue;
                }

                if (!rule.condition(perception, memory)) {
                    continue;
                }

                const decision = {
                    rule: rule.name,
                    action: rule.action,
                    context: {
                        perception: snapshotPerception(perception),
                        memory: snapshotMemory(memory),
                        timestamp: now
                    }
                };

                decisions.push(decision);
                lastFired.set(rule.name, now);
            }

            remember(history, decisions);

            return decisions;
        },

        getHistory() {
            return history.map((decision) => ({
                ...decision,
                context: {
                    ...decision.context
                }
            }));
        }
    };
}

export default createDecisionEngine;