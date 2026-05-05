// Day 2 — this, Binding & Prototypes

// Exercise ----

// Build this without using the class keyword — prototypes only:

// Build a Vector2D constructor that:
// - Takes (x, y) and stores them
// - Has an add(other) method that returns a NEW Vector2D (x1+x2, y1+y2)
// - Has a scale(factor) method that returns a NEW Vector2D (x*factor, y*factor)
// - Has a magnitude() method that returns Math.sqrt(x*x + y*y)
// - Has a toString() method that returns "Vector(x, y)"


const Vector2D = function(x, y) {
    this.x = x;
    this.y = y;
}

Vector2D.prototype.add = function(other) {
    return new Vector2D (this.x + other.x, this.y + other.y);
}

Vector2D.prototype.scale = function(factor) {
    return new Vector2D(this.x * factor, this.y * factor);
}

Vector2D.prototype.magnitude = function() {
    return Math.sqrt(this.x*this.x + this.y*this.y);
}

Vector2D.prototype.toString = function() {
    return (`Vector(${this.x}, ${this.y})`)
}


// Expected usage:
const v1 = new Vector2D(3, 4);
const v2 = new Vector2D(1, 2);

console.log(v1.magnitude());     // 5
console.log(v1.add(v2).toString()); // "Vector(4, 6)"
console.log(v1.scale(2).toString()); // "Vector(6, 8)"
console.log(v1.toString());      // "Vector(3, 4)" — v1 unchanged