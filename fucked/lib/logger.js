/**
 * Logger Module
 *
 * Simple error logging and reporting for the game.
 * Provides consistent logging with clear error messages.
 *
 * @module logger
 */

/**
 * Log an error message to the console
 * @param {string} message - The error message to log
 */
export function logError(message) {
	console.error(`🔴 ERROR: ${message}`);
}

/**
 * Log a warning message to the console
 * @param {string} message - The warning message to log
 */
export function logWarning(message) {
	console.warn(`🟡 WARNING: ${message}`);
}

/**
 * Log an info message to the console (for debugging)
 * @param {string} message - The info message to log
 */
export function logInfo(message) {
	console.log(`🔵 INFO: ${message}`);
}

/**
 * Display an error message to the user in a specific element
 * @param {string} elementId - The ID of the element to display the error in
 * @param {string} message - The error message to display
 * @returns {boolean} - Whether the error message was successfully displayed
 */
export function displayError(elementId, message) {
	const element = document.getElementById(elementId);
	if (!element) {
		logError(`Couldn't find element #${elementId} to display error message`);
		return false;
	}

	element.textContent = message;
	element.style.display = "block";
	return true;
}

/**
 * Clear an error message from an element
 * @param {string} elementId - The ID of the element to clear
 * @returns {boolean} - Whether the error message was successfully cleared
 */
export function clearError(elementId) {
	const element = document.getElementById(elementId);
	if (!element) {
		logError(`Couldn't find element #${elementId} to clear error message`);
		return false;
	}

	element.textContent = "";
	element.style.display = "none";
	return true;
}

/**
 * Validates input to ensure it meets certain criteria
 * @param {any} value - The value to validate
 * @param {Function} validationFn - Function that returns true if valid
 * @param {string} errorMsg - Error message to log if invalid
 * @returns {boolean} - Whether the value is valid
 */
export function validate(value, validationFn, errorMsg) {
	if (!validationFn(value)) {
		logWarning(errorMsg);
		return false;
	}
	return true;
}
