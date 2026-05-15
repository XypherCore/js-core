// 1. import createTask, sortByPriority, isOverdue from core/task.js
// 2. import loadTasks, saveTasks from services/storage.js
// 3. import startAutoSave from services/scheduler.js

import { createTask, sortByPriority, isOverdue } from "./src/core/task.js";
import { loadTasks, saveTasks } from "./src/services/storage.js";
import { startAutoSave } from "./src/services/scheduler.js";

// 4. async function main():
//    - load existing tasks
//    - create 3 tasks with mixed priorities and due dates
//      (at least one overdue)
//    - log sorted tasks
//    - log overdue tasks
//    - start auto-save
//    - after 12 seconds, stop auto-save and log "Scheduler stopped"

async function main() {
    const tasks = await loadTasks();

    const task1 = createTask("Learn modules", "high", "2029-05-20");
    const task2 = createTask("Clean notes", "low", "2029-05-18");
    const task3 = createTask("Submit project", "medium", "2026-05-01");

    tasks.push(task1, task2, task3);
    await saveTasks(tasks);
    
    console.log(sortByPriority(tasks));
    console.log(tasks.filter(isOverdue));

    const stop = startAutoSave(() => tasks);

    setTimeout(() => {
        stop();
        console.log("Scheduler stopped")
    }, 12000)
}

// 5. call main()
main();