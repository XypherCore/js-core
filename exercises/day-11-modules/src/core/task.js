// createTask(name, priority, dueDate) → task object
// validateTask(task) → true/false
// isOverdue(task) → true/false
// filterByPriority(tasks, priority) → filtered array
// sortByPriority(tasks) → sorted array

import { generateId } from "../utils/id.js";

export function createTask(name, priority, dueDate) {
    return {
        id: generateId(),
        name,
        priority,
        dueDate,
        completed: false
    };
}

export function validateTask(task) {
    return Boolean(
        task &&
        typeof task.id !== "undefined" &&
        typeof task.name === "string" &&
        typeof task.priority === "string" &&
        !Number.isNaN(Date.parse(task.dueDate)) &&
        typeof task.completed === "boolean"
    );
}

export function isOverdue(task) {
    return Boolean(
        task.dueDate &&
        !task.completed &&
        new Date(task.dueDate) < new Date()
    );
}

export function filterByPriority(tasks, priority) {
    return tasks.filter((task) => task.priority === priority);
}

export function sortByPriority(tasks) {
    const priorityOrder = { high: 1, medium: 2, low: 3 };

    return [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}