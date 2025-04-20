/**
 * Timer Module
 *
 * Manages the sketch timer functionality, including starting, stopping, resetting,
 * and updating the UI.
 *
 * @module timer
 */

import { playSound } from "./audio.js";
import { logError } from "./logger.js";

/**
 * Timer interval reference
 * @type {number|null}
 */
let timerInterval = null;

/**
 * Total seconds remaining on the timer
 * @type {number}
 */
let timerTotalSeconds = 90; // Default to 1:30

/**
 * Whether the timer is currently running
 * @type {boolean}
 */
let timerRunning = false;

/**
 * Default timer duration in seconds
 * @type {number}
 */
const DEFAULT_TIMER_DURATION = 90;

/**
 * Event callbacks for timer events
 * @type {Object.<string, Function[]>}
 */
const eventCallbacks = {
	start: [],
	tick: [],
	end: [],
	reset: [],
};

/**
 * Formats seconds into MM:SS format
 * @param {number} totalSeconds - Total seconds to format
 * @returns {string} - Formatted time string
 */
export function formatTime(totalSeconds) {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes.toString().padStart(2, "0")}:${seconds
		.toString()
		.padStart(2, "0")}`;
}

/**
 * Sets the timer duration in seconds
 * @param {number} seconds - New timer duration in seconds
 */
export function setTimerDuration(seconds) {
	if (timerRunning) {
		logError("Cannot change timer duration while timer is running");
		return;
	}

	timerTotalSeconds = Math.max(1, Math.floor(seconds));
	triggerEvent("reset", timerTotalSeconds);
}

/**
 * Starts the timer
 * @returns {boolean} - Whether the timer was successfully started
 */
export function startTimer() {
	if (timerRunning) return false;

	timerRunning = true;

	// Clear any existing interval just to be safe
	if (timerInterval !== null) {
		clearInterval(timerInterval);
	}

	// Start the interval
	timerInterval = setInterval(() => {
		timerTotalSeconds--;

		// Update UI
		triggerEvent("tick", timerTotalSeconds);

		// Check if timer has ended
		if (timerTotalSeconds <= 0) {
			stopTimer(true);
			playSound("timer_end");
			triggerEvent("end");
		}
	}, 1000);

	triggerEvent("start", timerTotalSeconds);
	return true;
}

/**
 * Stops the timer
 * @param {boolean} complete - Whether the timer completed naturally (true) or was manually stopped (false)
 * @returns {boolean} - Whether the timer was successfully stopped
 */
export function stopTimer(complete = false) {
	if (!timerRunning) return false;

	clearInterval(timerInterval);
	timerInterval = null;
	timerRunning = false;

	triggerEvent("end", { complete, timeRemaining: timerTotalSeconds });
	return true;
}

/**
 * Resets the timer to its initial duration
 * @param {number|null} duration - Optional new duration in seconds
 * @returns {boolean} - Whether the timer was successfully reset
 */
export function resetTimer(duration = null) {
	if (timerRunning) {
		stopTimer(false);
	}

	if (duration !== null && typeof duration === "number") {
		timerTotalSeconds = Math.max(1, Math.floor(duration));
	} else {
		timerTotalSeconds = DEFAULT_TIMER_DURATION;
	}

	triggerEvent("reset", timerTotalSeconds);
	return true;
}

/**
 * Checks if the timer is currently running
 * @returns {boolean} - Whether the timer is running
 */
export function isTimerRunning() {
	return timerRunning;
}

/**
 * Gets the current time remaining on the timer
 * @returns {number} - Seconds remaining
 */
export function getTimeRemaining() {
	return timerTotalSeconds;
}

/**
 * Adds an event listener for timer events
 * @param {string} event - Event to listen for ('start', 'tick', 'end', 'reset')
 * @param {Function} callback - Function to call when the event occurs
 */
export function addTimerEventListener(event, callback) {
	if (!eventCallbacks[event]) {
		eventCallbacks[event] = [];
	}

	eventCallbacks[event].push(callback);
}

/**
 * Removes an event listener
 * @param {string} event - Event to remove listener from
 * @param {Function} callback - Callback function to remove
 * @returns {boolean} - Whether the listener was found and removed
 */
export function removeTimerEventListener(event, callback) {
	if (!eventCallbacks[event]) return false;

	const index = eventCallbacks[event].indexOf(callback);
	if (index === -1) return false;

	eventCallbacks[event].splice(index, 1);
	return true;
}

/**
 * Triggers a timer event
 * @param {string} event - Event to trigger
 * @param {any} data - Data to pass to the callbacks
 * @private
 */
function triggerEvent(event, data) {
	if (!eventCallbacks[event]) return;

	for (const callback of eventCallbacks[event]) {
		try {
			callback(data);
		} catch (error) {
			logError(`Error in timer ${event} callback: ${error.message}`);
		}
	}
}
