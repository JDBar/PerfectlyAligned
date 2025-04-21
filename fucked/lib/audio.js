/**
 * Audio Module
 *
 * Handles loading and playing audio assets safely with error handling.
 *
 * @module audio
 */

import { logError, logWarning } from "../lib/logger.js";

/**
 * Map of loaded audio objects
 * @type {Object.<string, Audio>}
 */
const audioMap = {};

/**
 * Base path for audio files
 * @type {string}
 */
let audioBasePath = "/assets/audio/";

/**
 * Whether audio is currently muted
 * @type {boolean}
 */
let muted = false;

/**
 * Loads sound data from JSON
 * @param {string} url - URL to the sounds.json file
 * @returns {Promise<boolean>} - Promise that resolves to true if loading was successful
 */
export async function loadSounds(url) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch sounds data: ${response.status} ${response.statusText}`
			);
		}

		const data = await response.json();

		// Update base path if provided
		if (data.basePath) {
			audioBasePath = data.basePath;
		}

		// Initialize Audio objects for each sound
		if (data.sounds && Array.isArray(data.sounds)) {
			data.sounds.forEach((sound) => {
				if (sound.id && sound.filename) {
					audioMap[sound.id] = new Audio(`${audioBasePath}${sound.filename}`);
					audioMap[sound.id].preload = "auto";
				}
			});
		}

		return true;
	} catch (error) {
		logError(`Error loading sounds: ${error.message}`);
		return false;
	}
}

/**
 * Plays a sound by its ID
 * @param {string} soundId - ID of the sound to play
 * @returns {Promise<void>} - Promise that resolves when the sound starts playing or rejects if it fails
 */
export async function playSound(soundId) {
	if (muted) return;

	try {
		const sound = audioMap[soundId];
		if (!sound) {
			logWarning(`Sound not found: ${soundId}`);
			return;
		}

		// Reset to beginning if already playing
		sound.currentTime = 0;

		// Play and handle errors
		await sound.play();
	} catch (error) {
		logError(`Error playing sound ${soundId}: ${error.message}`);
	}
}

/**
 * Mutes or unmutes all sounds
 * @param {boolean} value - Whether to mute (true) or unmute (false)
 */
export function setMuted(value) {
	muted = Boolean(value);
}

/**
 * Checks if audio is currently muted
 * @returns {boolean} - Whether audio is muted
 */
export function isMuted() {
	return muted;
}

/**
 * Preloads all sounds to ensure they're cached
 * @returns {Promise<void>} - Promise that resolves when all sounds are loaded
 */
export async function preloadAllSounds() {
	const preloadPromises = Object.values(audioMap).map((audio) => {
		return new Promise((resolve) => {
			audio.addEventListener("canplaythrough", resolve, { once: true });
			audio.load();
		});
	});

	await Promise.all(preloadPromises);
}

/**
 * Plays a sequence of sounds with a delay between them
 * @param {string[]} soundIds - Array of sound IDs to play in sequence
 * @param {number} delayMs - Milliseconds to wait between sounds
 * @returns {Promise<void>} - Promise that resolves when all sounds have played
 */
export async function playSoundSequence(soundIds, delayMs = 500) {
	if (muted) return;

	for (const soundId of soundIds) {
		await playSound(soundId);
		await new Promise((resolve) => setTimeout(resolve, delayMs));
	}
}
