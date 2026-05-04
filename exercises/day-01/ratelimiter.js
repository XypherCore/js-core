// DAY 1 - Scope, Closures & Execution Context

// Excercise ----
// Build a makeRateLimiter(maxCalls, perSeconds) function using closures.
// Rules:
// Returns a function that wraps any callback
// The wrapper tracks how many times it's been called in the current time window
// If calls exceed maxCalls within perSeconds, log "Rate limit exceeded" and don't execute the callback
// Otherwise execute the callback normally
// The window resets after perSeconds seconds


// Solution ----

function makeRateLimiter(maxCalls, perSeconds) {
    let count = 0;

    return function(callback) {
        if (count === 0) {
            setTimeout(() => {
                count = 0;
            }, perSeconds * 1000)
        }

        if (count < maxCalls) {
            count++;
            callback();
        } else {
            console.log("Rate limit exceeded")
        }
    }
}


const limited = makeRateLimiter(3, 5); // max 3 calls per 5 seconds

limited(() => console.log("call 1")); 
limited(() => console.log("call 2")); 
limited(() => console.log("call 3")); 
limited(() => console.log("call 4")); 
setTimeout(() => {
    limited(() => console.log("call 5"));
}, 5000);