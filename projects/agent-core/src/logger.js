import fs from "node:fs/promises";
import { watch } from "node:fs";

function formatMessage(message, details) {
    if (!details) {
        return message;
    }

    if (details instanceof Error) {
        return `${message}: ${details.message}`;
    }

    return `${message}: ${String(details)}`;
}

export function createLogger(logFile) {
    const logger = {
        async log(level, message) {
            const timestamp = new Date().toISOString();
            const line = `[${timestamp}] [${level}] ${message}\n`;

            await fs.appendFile(logFile, line);
            console.log(line.trim());
        },

        info(message, details) {
            return this.log("INFO", formatMessage(message, details));
        },

        warn(message, details) {
            return this.log("WARN", formatMessage(message, details));
        },

        error(message, details) {
            return this.log("ERROR", formatMessage(message, details));
        },

        async getLogs() {
            let content = "";

            try {
                content = await fs.readFile(logFile, "utf-8");
            } catch (error) {
                if (error.code === "ENOENT") {
                    return [];
                }

                throw error;
            }

            return content
                .split("\n")
                .filter((line) => line.trim() !== "")
                .map((line) => {
                    const parts = line.match(/^\[(.+)\] \[(.+)\] (.+)$/);

                    if (!parts) {
                        return null;
                    }

                    return {
                        timestamp: parts[1],
                        level: parts[2],
                        message: parts[3]
                    };
                })
                .filter((entry) => entry !== null);
        },

        async clearLogs() {
            await fs.writeFile(logFile, "");
        },

        watchLogs(onChange) {
            const watcher = watch(logFile, async () => {
                const logs = await logger.getLogs();
                const latest = logs[logs.length - 1];

                if (latest) {
                    onChange(latest);
                }
            });

            return watcher;
        }
    };

    return logger;
}

export default createLogger;
