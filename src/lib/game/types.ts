/**
 * Game screens/states
 */
export const Screens = {
	SETUP: "setup",
	TUTORIAL: "tutorial",
	ALIGNMENT: "alignment",
	PROMPT: "prompt",
	DRAWING: "drawing",
	VOTING: "voting",
	RESULTS: "results",
} as const;
export type Screen = (typeof Screens)[keyof typeof Screens];

/**
 * Card deck options
 */
export const Decks = {
	CORE: "Core Mix",
	CREATIVE: "Creative & Pop",
	TABOO: "Hypothetical & Taboo (17+)",
} as const;
export type Deck = (typeof Decks)[keyof typeof Decks];

/**
 * Player definition
 */
export type Player = {
	id: string;
	name: string;
	avatar?: string;
	score?: number;
};

/**
 * Game settings
 */
export type Configuration = {
	players: Player[];
	cardDecks: Deck[];
	drawingTimeSeconds: number;
};

/**
 * Game state
 */
export type State = {
	currentScreen: Screen;
	settings: Configuration;
	currentRound?: number;
	totalRounds?: number;
	promptCard?: string;
};
