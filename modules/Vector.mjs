import { assert } from "helper";
import { expect } from "types";

class Vec2D {
  static #EPSILON = 1e-6;

  // Absolute value both x and y components
  static absolute (vec2d) {
    // Assert arguments
    assert(vec2d instanceof this).failWith(
      `Argument for "vec2d" not of type "Vec2D"`
    )?.interface;

    return new Vec2D(Math.abs(vec2d.x), Math.abs(vec2d.y));
  }

  // a + b
  static add (a, b) {
    // Assert arguments
    assert(
      expect([ a, b ]).all(Vec2D)
    ).failWith(
      `Argument for "Vec2D.add" not of type "Vec2D": ${a}, ${b}`
    )?.interface;

    return new Vec2D(a.x + b.x, a.y + b.y);
  }

  // a - b
  static sub (a, b) {
    // Assert arguments
    assert(
      expect([ a, b ]).all(Vec2D)
    ).failWith(
      `Argument for "Vec2D.sub" not of type "Vec2D": ${a}, ${b}`
    )?.interface;

    return new Vec2D(a.x - b.x, a.y - b.y);
  }

  // radians with respect to +x direction or i^ vector
  static angle (vec2d) {
    // Assert arguments
    assert(vec2d instanceof Vec2D).failWith(
      `Argument for "vec2d" not of type "Vec2D"`
    )?.interface;

    return Math.atan2(vec2d.y, vec2d.x);
  }

  // radians between a and b
  static angleBetween (a, b) {
    // Assert arguments
    assert(
      expect([ a, b ]).all(Vec2D)
    ).failWith(
      `Argument for "Vec2D.angleBetween" not of type "Vec2D": ${a}, ${b}`
    )?.interface;

    // Cache values
    const ax = a.x, ay = a.y, bx = b.x, by = b.y,
          sqrt = Math.sqrt,

      normalizer = sqrt(ax * ax + ay * ay) * sqrt(bx * bx + by * by);

    return Math.acos(ax * bx + ay * by) / normalizer;
  }

  // Helper method for a single number
  static #constrain (value, low, high) {
    return (value < low ) ? low : ((value > high) ? high : value);
  }

  // Constrain magnitude of vector to a certain range
  static constrain (vec2d, low, high) {
    // Assert arguments
    assert(vec2d instanceof Vec2D).failWith(
      `Argument for "vec2d" not of type "Vec2D"`
    )?.interface;

    assert(
      expect([ low, high ]).all("number")
    ).failWith(
      `Argument for "Vec2D.constrain" not of type "number": ${low}, ${high}`
    )?.interface;


    // Cache values
    const x = vec2d.x,
          y = vec2d.y,

          mag = Math.sqrt(x * x + y * y),
          scalar = this.constrain(mag, low, high) / mag;

    return new Vec2D(x * scalar, y * scalar);
  }

  static copy (vec2d) {
    // Assert arguments
    assert(vec2d instanceof Vec2D).failWith(
      `Argument for "vec2d" not of type "Vec2D"`
    )?.interface;

    return new Vec2D(vec2d.x, vec2d.y);
  }

  // Euclidean distance from tip of a to b
  static distance (a, b) {
    // Assert arguments
    assert(
      expect([ a, b ]).all(Vec2D)
    ).failWith(
      `Argument for "Vec2D.distance" not of type "Vec2D": ${a}, ${b}`
    )?.interface;

    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  // Euclidean distance squared (faster than `distance`)
  static distanceSquared (a, b) {
    // Assert arguments
    assert(
      expect([ a, b ]).all(Vec2D)
    ).failWith(
      `Argument for "Vec2D.distanceSquared" not of type "Vec2D": ${a}, ${b}`
    )?.interface;

    return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
  }

  // Create a vector from direction and magnitude
  static fromAngle (angle, magnitude) {
    // Assert arguments
    assert(
      expect([ angle, magnitude ]).all("number")
    ).failWith(
      `Argument for "Vec2D.fromAngle" not of type "number": ${angle}, ${magnitude}`
    )?.interface;

    return new Vec2D(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
  }

  // No use of epsilons, apparently
  static isNormalized (vec2d) {
    // Assert arguments
    assert(vec2d instanceof Vec2D).failWith(
      `Argument for "vec2d" instanceof "Vec2D"`
    )?.interface;

    return vec2d.x ** 2 + vec2d.y ** 2 === 1;
  }

  // Whether a and b are perpendicular to one another
  static isOrthogonal (a, b) {
    // Assert arguments
    assert(
      expect([ a, b ]).all(Vec2D)
    ).failWith(
      `Argument for "Vec2D.isOrthogonal" not of type "Vec2D": ${a}, ${b}`
    )?.interface;

    return (a.x * b.x + a.y * b.y) === 0
  }

  // Whether a and b face the same or opposite direction
  static isParallel (a, b) {
    // Assert arguments
    assert(
      expect([ a, b ]).all(Vec2D)
    ).failWith(
      `Argument for "Vec2D.isParallel" not of type "Vec2D": ${a}, ${b}`
    )?.interface;

    // Cache values
    const ax = a.x, ay = a.y, bx = b.x, by = b.y,
          sqrt = Math.sqrt,

          dot = (ax * bx + ay * by),
          productOfMagnitudes = (sqrt(ax * ax + ay * ay) * sqrt(bx * bx + by * by));

    return Math.abs(dot - productOfMagnitudes) <= EPSILON;
  }

  // Euclidean distance from tail to tip
  static magnitude (vec2d) {
    // Assert arguments
    assert(vec2d instanceof Vec2D).failWith(
      `Argument for "vec2d" not of type "Vec2D"`
    )?.interface;

    return Math.sqrt(vec2d.x * vec2d.x + vec2d.y * vec2d.y);
  }

  static magnitudeSquared (vec2d) {
    // Assert arguments
    assert(vec2d instanceof Vec2D).failWith(
      `Argument for "vec2d" not of type "Vec2D"`
    )?.interface;

    return vec2d.x ** 2 + vec2d.y ** 2;
  }

  // Rotate the vector 180° or π radians
  static negate (vec2d) {
    // Assert arguments
    assert(vec2d instanceof Vec2D).failWith(
      `Argument for "vec2d" not of type "Vec2D"`
    )?.interface;

    return new Vec2D(-vec2d.x, -vec2d.y);
  }

  static normalize (vec2d) {
    // Assert arguments
    assert(vec2d instanceof Vec2D).failWith(
      `Argument for "vec2d" not of type "Vec2d"`
    )?.interface;

    // Cache values
    const x = vec2d.x, y = vec2d.y,

          magnitude = Math.sqrt(x * x + y * y);

    return new Vec2D(x / magnitude, y / magnitude);
  }

  // Perpendicular compoment of a compared to direction of b
  static orthogonalProjection (a, b) {
    // Assert arguments
    assert(
      expect([ a, b ]).all(Vec2D)
    ).failWith(
      `Argument for "Vec2D.orthogonalProjection" not of type "Vec2D": ${a}, ${b}`
    )?.interface;

    // Cache values
    const ax = a.x, ay = a.y, bx = b.x, by = b.y,

          dot = ax * bx + ay * by,
          bMagnitude = Math.sqrt(bx * bx + by * by),
          scalar = dot / bMagnitude;

    return new Vec2D(ax - bx * scalar, ay - by * scalar);
  }

  // Parallel component of a compared to direction of b
  static projection (a, b) {
    // Assert arguments
    assert(
      expect([ a, b ]).all(Vec2D)
    ).failWith(
      `Argument for "Vec2D.projection" not of type "Vec2D": ${a}, ${b}`
    )?.interface;

    // Cache values
    const ax = a.x, ay = a.y, bx = b.x, by = b.y,

          dot = ax * bx + ay * by,
          scalar = dot / Math.sqrt(bx * bx + by * by);

    return new Vec2D(bx * scalar, by * scalar);
  }

  /* Generate a random vector in the square ring between low x low and
   * high x high side lengths
   */
  static random (low, high) {
    // Assert arguments
    assert(
      expect([ low, high ]).all("number")
    ).failWith(
      `Argument for "Vec2D.random" not of type "number": ${low}, ${high}`
    )?.interface;

    return new Vec2D(
      Math.random() * (high - low) + low,
      Math.random() * (high - low) + low
    );
  }

  // Take reciprocal of both x and y components
  static reciprocate (vec2d) {
    // Assert arguments
    assert(vec2d instanceof Vec2D).failWith(
      `Argument for "vec2d" not of type "Vec2D"`
    )?.interface;

    return new Vec2D(1 / vec2d.x, 1 / vec2d.y);
  }

  /* Reflect a across normal vector b \|/
   *                                  aba'
   * Get the projection of a onto b, double that, negate it, then add to a
   */
  static reflection (a, b) {
    // Assert arguments
    assert(
      expect([ a, b ]).all(Vec2D)
    ).failWith(
      `Argument for "Vec2D.reflection" not of type "Vec2D": ${a}, ${b}`
    )?.interface;

    // Cache values
    const ax = a.x, ay = a.y, bx = b.x, by = b.y,

          // Magnitude of projection
          dotMagnitude = (ax * bx + ay * by) / Math.sqrt(bx * bx + by * by),

          // Scalar for bx and by
          reflectionDisplacement = -2 * dotMagnitude;

          return new Vec2D(ax + reflectionDisplacement * bx , ay + reflectionDisplacement * by);
  }

  // Round the x and y components to the nearest integer
  static round (vec2d) {
    // Assert arguments
    assert(vec2d instanceof Vec2D).failWith(
      `Argument for "vec2d" not of type "Vec2D"`
    )?.interface;

    return new Vec2D(Math.round(vec2d.x), Math.round(vec2d.y));
  }

  // Multiply the magnitude by an integer
  static scale (vec2d, scale) {
    // Assert arguments
    assert(vec2d instanceof Vec2D).failWith(
      `Argument for "vec2d" not of type "Vec2D"`
    )?.interface;

    assert(expect(scale).is("number")).failWith(
      `Argument for "scale" not of type "number"`
    )?.interface;

    return new Vec2D(vec2d.x * scale, vec2d.y * scale);
  }

  // Calculate the slope with x and y
  static slope (vec2d) {
    // Assert arguments
    assert(vec2d instanceof Vec2D).failWith(
      `Argument for "vec2d" not of type "Vec2D"`
    )?.interface;

    return vec2d.y - vec2d.x;
  }

  // Convert to [ x, y ] pair
  static toArray (vec2d) {
    // Assert arguments
    assert(vec2d instanceof Vec2D).failWith(
      `Argument for "vec2d" not of type "Vec2D"`
    )?.interface;

    return [ vec2d.x, vec2d.y ];
  }


  static {
    Object.freeze(Vec2D)?.interface;
    Object.freeze(Vec2D.prototype);
  };


  x;
  y;


  constructor (x, y) {
    // Assert arguments
    assert(
      expect([ x, y ]).all("number")
    ).failWith(
      `Argument for "Vec2D#constructor" not of type "number": ${x}, ${y}`
    )?.interface;


    this.x = x;
    this.y = y;

    Object.freeze(this);
  }
}

export default Vec2D;
