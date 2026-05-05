// Day 4 — The Event Loop & Asynchronous JS Foundations

// Exercise ----

// Build a createScheduler() function using closures and the event loop:
  // Returns an object with two methods:
  // .schedule(fn, delay) — schedules fn to run after delay ms
  //                        returns an id so it can be cancelled
  // .cancel(id)          — cancels a scheduled task by id
  // .cancelAll()         — cancels all pending tasks


// Solution ----

function createScheduler() {
    const tasks = {};

    return {
        schedule(fn, delay) {
            const id = setTimeout(() => {
                fn();
                delete tasks[id];
            }, delay);

            tasks[id] = true;
            return id;
        },

        cancel(id) {
            if (tasks[id]) {
                clearTimeout(id);
                delete tasks[id];
            };
        },

        cancelAll() {
            for (const id in tasks) {
                clearTimeout(id);
                delete tasks[id];
            };
        }

    }
}

const scheduler = createScheduler();

const id1 = scheduler.schedule(() => console.log("task 1"), 1000);
const id2 = scheduler.schedule(() => console.log("task 2"), 2000);
const id3 = scheduler.schedule(() => console.log("task 3"), 3000);

scheduler.cancel(id2); // task 2 never runs
