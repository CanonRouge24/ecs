> Initial Commit Version on 8/1/2024 is a submission for TCO 2024 Challenge 3


# Simple Entity-Component-System

Makes up about a third of the desired final product that should potentially
be a little game engine, hopefully in particular for 2D tile-based puzzle games.

## Neat JavaScript Tricks / About the Code

The code is written with both features and syntactic
sugar from ES6+:

1. `class` syntax, to it's fullest extent (public and private methods and
   properties, static initializer blocks, inheritance, etc.)

2. Use of well-known symbols [`hasInstance` and `toPrimitive`, mostly] to modify the behaviors of classes.

3. Arrow function/lamba function usage

4. Deliberate use of `Map`s and `Set`s for performance gains

5. Array and object destructuring

6. Template strings

7. `Reflect.construct`, an alternative to `Function#apply` and `Function#call`

8. JavaScript's built-in `module` file organization structure — where every file
   can be its own library! (not really an accurate description)

<hr>
<br>

Putting that all aside, there are several cool code tricks (gimmicks, to an
extent) scattered throughout the code.

Take a look through:

* `index.html` for `type="importmap"` scripts, which let you provide handly
  aliases for your module files not unlike those you might find in any package
  manager.

* `ECS.mjs` for the use of the well-known `Symbol.hasInstance` alongside JS
  classes to create "pseudo-types", which helps greatly when you want to test or
  assert a value's "type" in your code. No more lengthy if-statement
  conditionals!

* `ECS.mjs`, containing classes that can't be instantiated directly (at least,
  not without JavaScript trickery and misdirection — the goal is to help ensure
  a consistent set of guidelines as to how to use the code, while helping to
  mitigate simple forgetfulness of said guidelines). Also, use of `new.target`,
  a "meta-property" according to MDN.

* `ECS.mjs` for the use of binary `BigInt`s be the data structure behind `Signature`
  as a bitfield/bitset/flag array and pseudo-operator overloading (we can
  repurpose the bitwise and equality operators with their "intended" purpose on
  `BigInt`s in order to achieve this)
  * Check out `SystemManager.entitySignatureChanged` for this in practice ;)

* `ECS.mjs` for having the `Signature` class also `extend Array`, making it so
  that the index dereference operator works alongside the more safe `.set` and
  `.reset`

* And last but not least, `ECS.mjs` also makes use of the optional chaining
  operator `?.` in order to check whether an object is actually a class object
  that is the sub-class of another (`class B extends A`, `B?.prototype
  instanceof A`)

* Take a peek at `Helper.mjs` to see how simply we can implement the method
  chaining used in `assert` and `integer`.

* `Helper.mjs` also includes use of `CSS.supports` to help with determining
  whether a given string is a legal value for canvas fill styles.

* In `Types.mjs`, there's four primitive pseudo-types `integer`, `char`, `null`,
  and `array` for use with `expect`

* Everywhere `assert` is used, there's a  "mark" with the optional chaining
  operator that has no effect on the code's behavior but is useful for
  indicating which instances of `assert` are utilized me for debugging or for
  the end user to assist with proper usage. `temporary` ones will be removed
  for the user-dev version, and `interface` ones will be removed for the
  user-production version

## What Next?

* The current status quo of writing code with the ECS module includes a lot of
  boilerplate registering components and systems and setting signatures. Ideally
  I'd write a parser for a file format to allow a data driven format where the
  data, default values, behavior, signatures, and classes can all be defined
  simply in one place. The boilerplate and code would then be generated.

  * Ideally a priority ordering for the execution of the systems would also be
    implemented, because they have to happen sequentially one way or another.

* Provide default implementations of commonly used components and systems?

  * Transform, Drawable, RigidBody?

  * Physics? (2D)Renderer?

  * Systems have Component dependencies. Can Systems have System dependencies?
    (And is that the same thing as just having a priority ordering? Is there
    any reason to have a dependency that executes AFTERwards?)
    Can Components have System dependencies?

<hr>
<br>

### TODO:

|                  |                                                           |
|------------------|-----------------------------------------------------------|
| <center> &#9745; | Find out whether there's anywhere `expect` can be used, perhaps with `assert` or if-statements
| <center> &#9744; | Write the rest of this README, continuing from `Helper.mjs`
| <center> &#9745; | Comment the code as necessary
