/**
 * JavaScript Concept: Hoisting
 * -------------------------------------------------------------
 * Hoisting is the JavaScript engine's behavior of allocating memory for variable
 * and function declarations during the Creation Phase of the Execution Context,
 * before any code is executed.
 *
 * Key Distinctions:
 * 1. `var`:
 *    - Hoisted to the top of its function/global scope.
 *    - Initialized to `undefined`.
 *    - Accessing before declaration returns `undefined` (no ReferenceError).
 * 2. `let` and `const`:
 *    - Hoisted to the top of their block scope.
 *    - NOT initialized! They remain in the "Temporal Dead Zone" (TDZ)
 *      from block start until the actual declaration line.
 *    - Accessing before declaration throws a `ReferenceError`.
 * 3. Function Declarations (`function foo() {}`):
 *    - Entire function body is hoisted.
 *    - Can be invoked safely before their physical line in the file.
 * 4. Function Expressions & Arrow Functions (`const bar = () => {}`):
 *    - Variable name is hoisted according to its `var`/`let`/`const` rule,
 *      but the function definition is assigned only when code reaches that line.
 */

/**
 * Demonstrates function declaration hoisting vs function expression.
 */
export function demonstrateFunctionHoisting(): {
  declarationOutput: string;
  expressionOutput: string;
} {
  // 1. Invoking function declaration before its physical definition works!
  const declarationOutput = hoistedCalculation(10, 20);

  function hoistedCalculation(a: number, b: number): string {
    return `Calculated sum: ${a + b}`;
  }

  // 2. Function expression must be declared before invocation
  const nonHoistedCalculation = (a: number, b: number): string => {
    return `Calculated product: ${a * b}`;
  };

  const expressionOutput = nonHoistedCalculation(10, 20);

  return { declarationOutput, expressionOutput };
}

/**
 * Demonstrates the behavior of `var` hoisting returning undefined
 * versus `let`/`const` Temporal Dead Zone.
 */
export function demonstrateVarHoisting(): {
  valueBeforeAssignment: unknown;
  valueAfterAssignment: string;
} {
  // In JS engine, `var city` is hoisted and initialized as `undefined`.
  // Using an IIFE to simulate the exact hoisting behavior:
  const sim = (function () {
    // eslint-disable-next-line prefer-const
    var city: string | undefined;
    const before = city; // undefined
    city = 'Bengaluru Urban';
    const after = city;
    return { before, after };
  })();

  return {
    valueBeforeAssignment: sim.before,
    valueAfterAssignment: sim.after,
  };
}

/**
 * Demonstrates Temporal Dead Zone (TDZ) concept safely without crashing runtime.
 */
export function verifyTemporalDeadZone(): {
  tdzDescription: string;
  isTDZEnforced: boolean;
} {
  let threwReferenceError = false;

  try {
    // Evaluating an uninitialized variable in a nested eval or block
    const testFn = new Function('return uninitializedVar; let uninitializedVar = 10;');
    testFn();
  } catch (err) {
    if (err instanceof ReferenceError) {
      threwReferenceError = true;
    }
  }

  return {
    tdzDescription: 'let and const variables exist in Temporal Dead Zone from block start until declaration',
    isTDZEnforced: threwReferenceError,
  };
}
