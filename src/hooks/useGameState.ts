import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import * as Game from "@/lib/game/types";

// Default game settings
const DEFAULT_SETTINGS: Game.Configuration = {
	players: [],
	cardDecks: [Game.Deck.CORE],
	drawingTimeSeconds: 60,
};

// Initial game state
const INITIAL_STATE: Game.GameState = {
	currentScreen: Game.Screen.SETUP,
	settings: DEFAULT_SETTINGS,
};

export const useGameState = () => {
	const [gameState, setGameState] = useState<Game.GameState>(INITIAL_STATE);

	// Navigation between screens
	const navigateTo = (screen: Game.Screens) => {
		setGameState((prev) => ({
			...prev,
			currentScreen: screen,
		}));
	};

	// Add a player
	const addPlayer = (name: string, avatar?: string) => {
		const newPlayer: Game.Player = {
			id: uuidv4(),
			name,
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
	};

	// Remove a player
	const removePlayer = (playerId: string) => {
		setGameState((prev) => ({
			...prev,
			settings: {
				...prev.settings,
				players: prev.settings.players.filter((p) => p.id !== playerId),
			},
		}));
	};

	// Toggle a card deck
	const toggleCardDeck = (deck: Game.Decks) => {
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
	};

	// Set drawing time
	const setDrawingTime = (seconds: number) => {
		setGameState((prev) => ({
			...prev,
			settings: {
				...prev.settings,
				drawingTimeSeconds: seconds,
			},
		}));
	};

	// Start a new game
	const startGame = () => {
		setGameState((prev) => ({
			...prev,
			currentScreen: Game.Screen.DRAWING,
			currentRound: 1,
			totalRounds: prev.settings.players.length,
		}));
	};

	// Show tutorial
	const showTutorial = () => {
		navigateTo(Game.Screen.TUTORIAL);
	};

	return {
		gameState,
		navigateTo,
		addPlayer,
		removePlayer,
		toggleCardDeck,
		setDrawingTime,
		startGame,
		showTutorial,
	};
};
