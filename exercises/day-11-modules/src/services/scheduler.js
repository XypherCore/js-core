import { saveTasks } from "./storage.js";
import { AUTO_SAVE_INTERVAL } from "../config/index.js";

// startAutoSave(getTasks, interval)
// - calls saveTasks every interval ms
// - getTasks is a function that returns the current tasks array
// - returns a stop function that cancels the interval when called

export function startAutoSave(getTasks, interval = AUTO_SAVE_INTERVAL) {
    const intervalId = setInterval(() => {
       saveTasks(getTasks());
    }, interval);

    return function stop() {
        clearInterval(intervalId);
    };
}