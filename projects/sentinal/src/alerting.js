// Alert rules engine
//
// createAlertEngine(rules)
//   rules: array of {
//     name: string,
//     metric: "cpu" | "memory" | "network",
//     condition: fn(value) → boolean,
//     severity: "warning" | "critical",
//     cooldown: ms  ← don't re-alert same rule within cooldown period
//   }
//
// Returns:
//   evaluate(metric) → array of fired alerts
//     each alert: { rule, metric, firedAt }
//     respects cooldown — same rule won't fire again until cooldown passes
//
//   getActive() → array of currently active alerts
//
//   clear(ruleName) → manually clear an alert by rule name

export const defaultRules = [
    {
        name: "High CPU usage",
        metric: "cpu",
        condition: (value) => value >= 85,
        severity: "warning",
        cooldown: 30_000
    },
    {
        name: "Critical CPU usage",
        metric: "cpu",
        condition: (value) => value >= 95,
        severity: "critical",
        cooldown: 30_000
    },
    {
        name: "High memory usage",
        metric: "memory",
        condition: (value) => value >= 80,
        severity: "warning",
        cooldown: 30_000
    },
    {
        name: "Critical memory usage",
        metric: "memory",
        condition: (value) => value >= 92,
        severity: "critical",
        cooldown: 30_000
    },
    {
        name: "Network burst",
        metric: "network",
        condition: (value) => value >= 750,
        severity: "warning",
        cooldown: 15_000
    }
];

export function createAlertEngine(rules = defaultRules) {
    const activeAlerts = new Map();
    const lastFiredTimes = new Map();

    function evaluate(metric) {
        const firedAlerts = [];
        const now = Date.now();

        for (const rule of rules) {
            if (metric.type !== rule.metric) {
                continue;
            }

            const isTriggered = rule.condition(metric.value, metric);

            if (!isTriggered) {
                activeAlerts.delete(rule.name);
                continue;
            }

            const lastFiredTime = lastFiredTimes.get(rule.name) ?? 0;
            const canFire = now - lastFiredTime >= rule.cooldown;

            const alert = {
                rule,
                metric,
                firedAt: new Date(now).toISOString()
            };

            activeAlerts.set(rule.name, alert);

            if (!canFire) {
                continue;
            }

            lastFiredTimes.set(rule.name, now);
            firedAlerts.push(alert);
        }

        return firedAlerts;
    }

    function getActive() {
        return Array.from(activeAlerts.values());
    }

    function clear(ruleName) {
        return activeAlerts.delete(ruleName);
    }

    return {
        evaluate,
        getActive,
        clear
    };
}