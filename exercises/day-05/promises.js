// Day 5 — Promises, Deep

// Simulate network call
function simulateFetch(data, delay, shouldFail = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      shouldFail
        ? reject(new Error("Network error"))
        : resolve(data);
    }, delay);
  });
}

// 1. fetchUserProfile(id)
// - if id < 1, reject immediately with "Invalid ID"
// - otherwise fetch a user object after 500ms: { id, name: "Agent " + id }
// - then fetch their permissions after 300ms: { userId: id, level: "admin" }
// - resolve with { user, permissions }

function fetchUserProfile(id) {
    if (id < 1) return Promise.reject("Invalid ID");

    return simulateFetch({id, name: "Agent " + id}, 500)
        .then(user => {
            return simulateFetch({userId: id, level: "admin"}, 300)
                .then(permissions => ({user, permissions}));
        });
}


// 2. fetchWithFallback(primaryUrl, fallbackUrl)
// - try primaryUrl first (simulate with simulateFetch)
// - if it fails, try fallbackUrl instead
// - if both fail, reject with "All sources failed"

function fetchWithFallback(primaryUrl, fallbackUrl) {
    return simulateFetch(primaryUrl)
        .catch(() => {
            return simulateFetch(fallbackUrl)
                .catch(() => {
                    return Promise.reject("All sources failed");
                })
        })
}


// 3. fetchAll(ids)
// - takes an array of ids
// - fetches all profiles in parallel
// - returns array of results, even if some fail
//   (failed ones should have { error: err.message } instead)

function fetchAll(ids) {
    return Promise.all(
        ids.map(id => 
            fetchUserProfile(id).catch(err => ({error: err.message}))
        )
    );
}