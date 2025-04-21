import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import * as Game from "@/lib/game/types";
import * as CONSTANTS from "@/lib/game/constants";

/**
 * Default game settings
 */
const DEFAULT_SETTINGS: Game.Configuration = {
	players: [
		{
			id: uuidv4(),
			name: "Player 1",
			avatar: "",
			score: 0,
		},
		{
			id: uuidv4(),
			name: "Player 2",
			avatar: "",
			score: 0,
		},
		{
			id: uuidv4(),
			name: "Player 3",
			avatar: "",
			score: 0,
		},
	],
	cardDecks: [Game.Decks.CORE],
	drawingTimeSeconds: CONSTANTS.DRAWING_TIME.DEFAULT,
};

/**
 * Initial game state
 */
const INITIAL_STATE: Game.State = {
	currentScreen: Game.Screens.SETUP,
	settings: DEFAULT_SETTINGS,
};

/**
 * Game Master hook that manages the game state and provides
 * methods to control the game flow
 */
export const useGameMaster = () => {
	const [gameState, setGameState] = useState<Game.State>(INITIAL_STATE);

	// Create the GameMaster object with all game control functions
	const GM = {
		...CONSTANTS,

		state: gameState,

		// Navigation between screens
		navigateTo: (screen: Game.Screen) => {
			setGameState((prev) => ({
				...prev,
				currentScreen: screen,
			}));
		},

		// Add a player
		addPlayer: (name?: string, avatar?: string) => {
			const newPlayer: Game.Player = {
				id: uuidv4(),
				name: name || `Player ${gameState.settings.players.length + 1}`,
				avatar,
				score: 0,
			};

			setGameState((prev) => ({
				...prev,
				settings: {
					...prev.settings,
					players: [...prev.settings.players, newPlayer],
				},
			}));
		},

		// Remove a player
		removePlayer: (playerId?: string) => {
			if (!playerId) {
				playerId =
					gameState.settings.players[gameState.settings.players.length - 1].id;
			}

			setGameState((prev) => ({
				...prev,
				settings: {
					...prev.settings,
					players: prev.settings.players.filter((p) => p.id !== playerId),
				},
			}));
		},

		// Toggle a card deck
		toggleCardDeck: (deck: Game.Deck) => {
			setGameState((prev) => {
				const currentDecks = prev.settings.cardDecks;
				const updatedDecks = currentDecks.includes(deck)
					? currentDecks.filter((d) => d !== deck)
					: [...currentDecks, deck];

				return {
					...prev,
					settings: {
						...prev.settings,
						cardDecks: updatedDecks,
					},
				};
			});
		},

		// Set drawing time
		setDrawingTime: (seconds: number) => {
			setGameState((prev) => ({
				...prev,
				settings: {
					...prev.settings,
					drawingTimeSeconds: seconds,
				},
			}));
		},

		// Start a new game
		startGame: () => {
			setGameState((prev) => ({
				...prev,
				currentScreen: Game.Screens.DRAWING,
				currentRound: 1,
				totalRounds: prev.settings.players.length,
			}));
		},

		// Show tutorial
		showTutorial: () => {
			GM.navigateTo(Game.Screens.TUTORIAL);
		},
	};

	return GM;
};
