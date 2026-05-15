// just export a function that returns a unique id
// you've been using Date.now() for this already

let counter = 0;
export function generateId() {
    return `${Date.now()}-${counter++}`;
}