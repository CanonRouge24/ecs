import { expect } from "types";


function assert (test) {
  return {
    failWith (message) {
      if (!test) {
        // TODO: navigate error stack message to get error location
        throw new Error(message);
      }
    }
  };
}

/* Chain an integer type test with bounds [a, b) */
function integer (value) {
  return {
    inRange (a, b) {
      // Assert arguments
      assert(expect([ a, b ]).all("integer")).failWith(
        `Bound for "inRange" not of type "integer": [${a}, ${b})`
      );

      return Number.isInteger(value) &&
             (0 <= a) && (value < b);
    }
  };
}

/**
 * Test whether something is a valid CSS style for color
 * One of the valid CSS color strings, CanvasPattern or
 * CanvasGradient
 *
 * @source https://stackoverflow.com/questions/48484767/javascript-check-if-string-is-valid-css-color
 */
class Color {
  static [Symbol.hasInstance] (value) {
      return (
        expect(value).is([ CanvasGradient, CanvasPattern ]) ||
        CSS.supports("color", value)
      );
  }
}

export { assert, integer, Color };
