// Day 7 — Review + Mini Project

// Features:
// - Add a task with a name, priority, and optional due date
// - List all tasks sorted by priority
// - Complete a task by id
// - Delete a task by id
// - Get overdue tasks (due date passed)
// - Auto-save tasks to a JSON file every 30 seconds (setInterval)
// - Load tasks from that file on startup (simulate with a Promise)

// Technical requirements:
// - TaskManager class built on a prototype (no class keyword)
// - Private state via closure — tasks array not directly accessible
// - All file operations simulated with async/await + delay()
// - Proper error handling — try/catch on all async operations
// - No var anywhere


// SOLUTION----

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const TaskManager = (function () {
    const privateData = new WeakMap();
    let tempFile = [];

    function TaskManager() {
        privateData.set(this, {
            tasks: [],
        })
    }

    TaskManager.prototype.addTask = function (name, priority, dueDate) {
        const data = privateData.get(this);

        const task = {
            id: Date.now() + data.tasks.length,
            name,
            priority,
            dueDate,
            completed: false
        };

        data.tasks.push(task);
        return task;
    }

    TaskManager.prototype.getTasks = function () {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        const data = privateData.get(this);
        return [...data.tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }

    TaskManager.prototype.getTask = function(id) {
        const data = privateData.get(this);
        return data.tasks.find(t => t.id === id);
    }

    TaskManager.prototype.completeTask = function (id) {
        const data = privateData.get(this);
        const task = data.tasks.find(t => t.id === id);
        if (task) task.completed = true;
    }

    TaskManager.prototype.deleteTask = function (id) {
        const data = privateData.get(this);
        data.tasks = data.tasks.filter(t => t.id !== id);
    }

    TaskManager.prototype.getOverdue = function () {
        const data = privateData.get(this);
        return data.tasks.filter(t => {
            return t.dueDate && !t.completed && new Date(t.dueDate) < new Date();
        });
    }

    TaskManager.prototype.loadTasks = async function () {
        try {
            await delay(500);
            const savedTasks = [...tempFile];
            const data = privateData.get(this);
            data.tasks = savedTasks;
            return [...data.tasks];
        } catch (err) {
            console.log("failed to load tasks:", err.message);
            return [];
        }
    }

    TaskManager.prototype.saveTasks = async function () {
        try {
            const data = privateData.get(this);
            await delay(300);
            tempFile = [...data.tasks];
            console.log("Tasks saved")
        } catch (err) {
            console.log(err.message);
        }
    }

    return TaskManager;
})();

const manager = new TaskManager();

async function start() {
    await manager.loadTasks();

    const prototypeTask = manager.addTask("Review prototypes", "high", "2026-05-10");
    const overdueTask = manager.addTask("Clean up old notes", "medium", "2025-01-01");
    const asyncTask = manager.addTask("Practice async await", "low", "2026-05-20");

    manager.completeTask(asyncTask.id);
    manager.deleteTask(prototypeTask.id);

    console.log("All tasks:", manager.getTasks());
    console.log("Overdue tasks:", manager.getOverdue());
    console.log("One task:", manager.getTask(overdueTask.id));

    setInterval(() => {
        manager.saveTasks();
    }, 30000);
}

start();