/**
 * Game screens/states
 */
export const Screen = {
	SETUP: "setup",
	TUTORIAL: "tutorial",
	ALIGNMENT: "alignment",
	PROMPT: "prompt",
	DRAWING: "drawing",
	VOTING: "voting",
	RESULTS: "results",
} as const;
export type Screens = (typeof Screen)[keyof typeof Screen];

/**
 * Player definition
 */
export interface Player {
	id: string;
	name: string;
	avatar?: string;
	score?: number;
}

/**
 * Card deck options
 */
export const Deck = {
	CORE: "Core Mix",
	CREATIVE: "Creative & Pop",
	TABOO: "Hypothetical & Taboo (17+)",
} as const;
export type Decks = (typeof Deck)[keyof typeof Deck];

/**
 * Game settings
 */
export interface Configuration {
	players: Player[];
	cardDecks: Decks[];
	drawingTimeSeconds: number;
}

/**
 * Game state
 */
export interface GameState {
	currentScreen: Screens;
	settings: Configuration;
	currentRound?: number;
	totalRounds?: number;
	promptCard?: string;
}
