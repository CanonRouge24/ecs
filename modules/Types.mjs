import { assert } from "./Helper.mjs";


class Type {
  static SPECIAL_TYPEOF_TYPES = new Map(
    [
      [ "integer", value => Number.isInteger(value) ],
      [ "number", value => typeof value === "number" && !isNaN(value) ],
      [ "char", value => typeof value === "string" && value.length === 1 ],
      [ "null", value => value === null ],
      [ "array", value => Array.isArray(value) ],
      [ "NaN", value => isNaN(value) ]
    ]
  );

  static VALID_TYPEOF_TYPES = new Set(
    [
      "bigint", "string", "symbol", "object", "function", "undefined", "boolean",
    ].concat([...this.SPECIAL_TYPEOF_TYPES.keys()])
  );

  static [Symbol.hasInstance] (value) {
    return this.VALID_TYPEOF_TYPES.has(value) || typeof value === "function";
  }

  // Predicate for use with array callbacks
  static TYPE_CHECK_PREDICATE (type) {
    return type instanceof Type;
  }
}


function everyIndex (array, predicate) {
  // Assert arguments
  assert(array instanceof Array).failWith(
    `Argument for "array" not of type "Array"`
  )?.interface;

  assert(typeof predicate === "function").failWith(
    `Argument for "predicate" not of type "function"`
  )?.interface;

  const result = array.findIndex(
    element => !predicate(element)
  );

  const returnValue = Array(2);

  // One of the elements failed
  if (result > -1) {
    returnValue[0] = result;
    returnValue[1] = array[result];
    returnValue.passed = false;
    return returnValue;
  }

  // Passed!
  returnValue.passed = true;
  return returnValue;
}


// Helper method for the absolute minimum functionality of a single value to type comparison
function isOfType (value, type) {
  // Assert arguments
  assert(type instanceof Type).failWith(
    `Argument for "type" is neither a valid typeof string nor a function`
  )?.temporary;

  switch (true) {
    // Typeof string with special behavior
    case Type.SPECIAL_TYPEOF_TYPES.has(type):
      return (Type.SPECIAL_TYPEOF_TYPES.get(type))(value);

    // Default typeof string
    case Type.VALID_TYPEOF_TYPES.has(type):
      return typeof value === type;

    // Function class
    default:
      return value instanceof type;
  }
}


function expect (value) {
  return {
    is (types) {
      switch (true) {
        case types instanceof Array:
          // Assert arguments
          const allValidTypes = everyIndex(types, Type.TYPE_CHECK_PREDICATE);

          assert(allValidTypes.passed).failWith(
            `Argument for "types" contains invalid type ${allValidTypes[1]} at \
            index ${allValidTypes[0]}`
          )?.interface;

          // Perform test
          return types.some(type => isOfType(value, type));
          break;

        // Single type
        default:
          // Assert arguments
          assert(types instanceof Type).failWith(
            `Argument for "type" is neither a valid typeof string nor a function`
          )?.interface;

          // Perform test
          return isOfType(value, types);
      }
    },

    all (types) {
      switch (true) {
        case types instanceof Array:
          // Assert arguments
          const allValidTypes = everyIndex(types, Type.TYPE_CHECK_PREDICATE);

          assert(allValidTypes.passed).failWith(
            `Argument for "types" contains invalid type ${allValidTypes[1]} at \
            index ${allValidTypes[0]}`
          )?.interface;

          // Perform test
          const allOfTypes = everyIndex(
            // Array
            value,

            // Predicate
            value => types.some(
              type => isOfType(value, type)
            )
          );

          return allOfTypes.passed;

          // Single type
        default:
          // Assert arguments
          assert(types instanceof Type).failWith(
            `Argument for "type" is neither a valid typeof string nor a function`
          )?.interface;

          // Perform test
          return value.every(value => isOfType(value, types));
      }
    }
  };
}

export default expect;
