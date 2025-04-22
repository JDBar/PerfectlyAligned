import { configure, _resetGlobalState } from "mobx";

/**
 * Configure MobX for testing environment
 * Based on recommendations from: https://mobx.js.org/configuration.html#linting-options
 */
export function setupMobXForTesting() {
	// Disable error boundaries to allow errors to propagate in tests
	configure({
		disableErrorBoundaries: true,
		// Additional testing-friendly configurations
		enforceActions: "never", // Allow state changes without actions during tests
		safeDescriptors: false, // Make properties configurable/writable for easier mocking
		// Disable warnings about reading observables outside of reactions
		observableRequiresReaction: false,
		// Prevent warnings about computeds without observers
		computedRequiresReaction: false,
		// Prevent warnings about reactions without observables
		reactionRequiresObservable: false,
	});
}

/**
 * Reset MobX's global state after each test
 * Should be called in afterEach
 */
export function resetMobXForTesting() {
	_resetGlobalState();
}

/**
 * Helper to set up MobX test hooks in a Jest describe block
 * Usage:
 *
 * describe('My MobX tests', () => {
 *   withMobXTestSetup();
 *
 *   it('should test something', () => {
 *     // Your test code
 *   });
 * });
 */
export function withMobXTestSetup() {
	beforeEach(() => {
		setupMobXForTesting();
	});

	afterEach(() => {
		resetMobXForTesting();
	});
}
