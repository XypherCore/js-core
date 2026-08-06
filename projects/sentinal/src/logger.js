// Same as Day 13

import fs from "node:fs/promises";
import { watch } from "node:fs"

export function createLogger(logFile) {
    return {
        async log(level, message) {
            const timestamp = new Date().toISOString();
            const line = `[${timestamp}] [${level}] ${message}\n`;
            await fs.appendFile(logFile, line);
            console.log(line.trim());
        },

        async getLogs() {
            const content = await fs.readFile(logFile, "utf-8");
            return content
                .split("\n")
                .filter(line => line.trim() !== "")
                .map(line => {
                    const parts = line.match(/^\[(.+)\] \[(.+)\] (.+)$/);
                    if (!parts) return null;

                    return {
                        timestamp: parts[1],
                        level: parts[2],
                        message: parts[3]
                    }
                })
                .filter(entry => entry !== null)
        },

        async clearLogs() {
            await fs.writeFile(logFile, "");
        },

        watchLogs(onChange) {
            const watcher = watch(logFile, async () => {
                const logs = await this.getLogs();
                const latest = logs[logs.length - 1];
                if (latest) onChange(latest);
            });

            return watcher;
        }
    }
}