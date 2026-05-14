// Day 10 — Functional Programming


// EXERCISES with SOLUTIONS:----


// 1. implement curry(fn)
//    - takes any function with any number of arguments
//    - returns a curried version
//    - curry(add)(1)(2)(3) works if add takes 3 args
//    - curry(add)(1, 2)(3) also works — partial application

const curry = fn => {
    const curried = (...args) => {
        if (args.length >= fn.length) {
            return fn(...args);
        }
        return (...nextArgs) => {
            const combinedArgs = [...args, ...nextArgs];
            return curried(...combinedArgs);
        }
    }
    return curried;
}

// Example:
const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);

curriedAdd(1)(2)(3)    // 6
curriedAdd(1, 2)(3)    // 6
curriedAdd(1)(2, 3)    // 6
curriedAdd(1, 2, 3)    // 6


// 2. build a pure data pipeline using pipe() that:
//    - takes an array of sensor readings:
const readings = [
  { id: 1, type: "temp", value: 98.6, unit: "F", active: true },
  { id: 2, type: "pressure", value: 120, unit: "PSI", active: true },
  { id: 3, type: "temp", value: 32, unit: "F", active: false },
  { id: 4, type: "temp", value: 212, unit: "F", active: true },
  { id: 5, type: "pressure", value: 80, unit: "PSI", active: true },
];
//    - keeps only active readings
//    - keeps only temperature type
//    - converts F to C: (F - 32) * 5/9, round to 1 decimal
//    - returns { id, value, unit: "C" }
//    - sorts by value ascending
//    All steps must be pure functions composed with pipe()

const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);

const filter = predicate => array => array.filter(predicate);
const map = fn => array => array.map(fn);
const getActives = filter(reading => reading.active);
const getTemp = filter(reading => reading.type === "temp");
const convertToCelsius = map(reading => {
    const value = Number(((reading.value - 32) * 5/9).toFixed(1));
    return {
        id: reading.id,
        value,
        unit: "C"
    }
});
const sortByValues = array => [...array].sort((a, b) => a.value - b.value);

const pipeline = pipe(getActives, getTemp, convertToCelsius, sortByValues);

pipeline(readings);


// 3. implement Maybe.of, .map(), .getOrElse()
//    then use it to safely extract a nested value:
// const data = { user: { profile: { city: "Accra" } } };
//    extract city safely — if any level is missing return "Unknown"

class Maybe {
    constructor(value) {
        this.value = value;
    }

    static of(value) {
        return new Maybe(value);
    }

    isNothing() {
        return this.value === null || this.value === undefined;
    }

    map(fn) {
        return this.isNothing() ? this : Maybe.of(fn(this.value));
    }

    getOrElse(defaultValue) {
        return this.isNothing() ? defaultValue : this.value;
    }
}

const data = { user: { profile: { city: "Accra" } } }

const city = Maybe.of(data)
    .map(d => d.user)
    .map(user => user.profile)
    .map(profile => profile.city)
    .getOrElse("Unknown");

// Test Maybe with broken data to confirm it works:
Maybe.of(null).map(d => d.user).getOrElse("Unknown");           // "Unknown"
Maybe.of({ user: null }).map(d => d.user).map(u => u.profile).getOrElse("Unknown"); // "Unknown"