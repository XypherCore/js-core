import { delay } from "../utils/delay.js"
import { LOAD_DELAY, SAVE_DELAY } from "../config/index.js";

let storedTasks = [];

// loadTasks() — simulates reading from file
//   waits LOAD_DELAY ms, returns the stored tasks array

export async function loadTasks() {
    await delay(LOAD_DELAY);
    return [...storedTasks];
}

// saveTasks(tasks) — simulates writing to file
//   waits SAVE_DELAY ms, stores the tasks, logs "Tasks saved"

export async function saveTasks(tasks) {
    await delay(SAVE_DELAY);
    storedTasks = [...tasks];
    console.log("Tasks saved");
}