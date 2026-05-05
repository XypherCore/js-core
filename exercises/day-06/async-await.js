// Day 6 — Async/Await & Real Error Handling


function simulateFetch(data, delay, shouldFail = false) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            shouldFail
            ? reject(new Error("Network error"))
            : resolve(data);
        }, delay);
    })
}

// 1. fetchDashboard(userId)
//    Fetch these three things IN PARALLEL using async/await:
//    - user:          { id: userId, name: "Agent " + userId }  after 400ms
//    - stats:         { visits: 100, conversions: 42 }          after 600ms
//    - notifications: [{ msg: "System online" }]                after 200ms
//    Return { user, stats, notifications }
//    If anything fails, return { error: err.message }

async function fetchDashboard(userId) {
    try {
        const [user, stats, notifications] = await Promise.all([
            simulateFetch({id: userId, name: "Agent " + userId}, 400),
            simulateFetch({visits: 100, conversions: 42}, 600),
            simulateFetch([{msg: "System online"}], 200)
        ]);
        return {user, stats, notifications};
    } catch (err) {
        return {error: err.message};
    }
}



// 2. robustFetch(fn, maxAttempts)
//    - Retries fn up to maxAttempts times
//    - Waits 300ms between attempts (no need for backoff here)
//    - Logs "Attempt X failed" on each failure
//    - Returns the result if any attempt succeeds
//    - Throws the last error if all attempts fail
//    Use async/await and try/catch — no .then()

async function robustFetch(fn, maxAttempts) {
    for (let i = 0; i < maxAttempts; i++) {
        try {
            return await fn();
        } catch (err) {
            const isLastAttempt = i === maxAttempts - 1;
            if (isLastAttempt) throw err;
            console.log(`Attempt ${i + 1} failed`);
            const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
            await delay(300);
        }
    }
}