/**
 * A way to "unit test" types... kind of.
 * If you expect the left-hand side to be the same as the right-hand side, this type should evaluate to true.
 * If you expect the left-hand side to be different from the right-hand side, this type should evaluate to false.
 * @example
 * ```ts
 * const _trueIsTrue: AssertIdentical<true, true> = true;
 * const _falseIsNotTrue: AssertIdentical<true, false> = false;
 * ```
 */
export type AssertIdentical<T, Expected> = [T] extends [Expected]
	? [Expected] extends [T]
		? true
		: false
	: false;
function _testAssertIdentical() {
	const _trueIsTrue: AssertIdentical<true, true> = true;
	const _falseIsNotTrue: AssertIdentical<true, false> = false;
	const _booleanIsNotTrue: AssertIdentical<boolean, true> = false;
	const _trueIsNotBoolean: AssertIdentical<true, boolean> = false;
}

/**
 * Enforces identity rule between the keys and values of an object, useful
 * for creating fake enums.
 *
 * @example
 * ```ts
 * const fakeEnum = identity({
 * 	FOO: "FOO",
 * 	BAR: "BAR",
 * 	BAZ: "BAZ",
 * } as const);
 * ```
 */
export function identity<T extends { [K in keyof T]: K }>(obj: T) {
	return obj as T;
}
function _testIdentity() {
	const _fakeEnum = identity({
		FOO: "FOO",
		BAR: "BAR",
		// @ts-expect-error - Type '"x"' is not assignable to type '"BAZ"'.
		BAZ: "x",
	});

	const _fakeEnum2 = identity({
		FOO: "FOO",
		BAR: "BAR",
		BAZ: "BAZ",
	});
}

/**
 * Creates a function that type-checks the keys of an object,
 * while preserving the inferred values of the object.
 *
 * @example
 * ```ts
 * const withFooBar = enforceKeys<"foo" | "bar">();
 * const validated = withFooBar({ foo: "foo", bar: 42 }); // { foo: string, bar: number }
 * const invalid = withFooBar({ baz: "baz" }); // Property 'baz' does not exist on type '{ foo: string; bar: number; }'.
 * const invalid2 = withFooBar({ foo: 1, bar: 2, baz: 3 }); // Type 'number' is not assignable to type 'never'.
 * ```
 */
export function enforceKeys<ReferenceKeys extends PropertyKey>() {
	return function <
		T extends Record<ReferenceKeys, unknown> &
			Record<Exclude<keyof T, ReferenceKeys>, never>
	>(obj: T): T {
		return obj;
	};
}
function _testEnforceKeys() {
	const withFooBar = enforceKeys<"foo" | "bar">();
	const _valid = withFooBar({ foo: "foo", bar: 42 }); // { foo: string, bar: number }
	const _isValid: AssertIdentical<typeof _valid, { foo: string; bar: number }> =
		true;
	const _valid2 = withFooBar({ foo: "foo", bar: 42 } as const);
	const _isValid2: AssertIdentical<typeof _valid2, { foo: "foo"; bar: 42 }> =
		true;
	// @ts-expect-error - Property 'bar' is missing in type '{ foo: string; }' but required in type '{ foo: string; bar: unknown; }'
	const _invalid = withFooBar({ foo: "foo" });
	// @ts-expect-error - Type 'number' is not assignable to type 'never'.
	const _invalid2 = withFooBar({ foo: 1, bar: 2, baz: 3 });
}
