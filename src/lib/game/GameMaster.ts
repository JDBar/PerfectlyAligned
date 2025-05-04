import { makeAutoObservable } from "mobx";
import { configure } from "mobx";
import { v4 as uuidv4 } from "uuid";
import * as Game from "@/lib/game/types";
import { identity, enforceKeys } from "@/lib/type-utils";

configure({
	enforceActions: "always",
	computedRequiresReaction: true,
	observableRequiresReaction: true,
	// reactionRequiresObservable: true,
});

/**
 * Manages the core game state and logic for Perfectly Aligned.
 * UI-specific state (like current screen) is managed by React components.
 */
export class GameMaster {
	static readonly PLAYER_COUNT = {
		MIN: 3,
		MAX: 8,
		DEFAULT: 3,
	} as const;

	static readonly DRAWING_TIME = {
		DEFAULT: 60,
		MIN: 30,
		MAX: 180,
	} as const;

	// --- Observable State ---
	players: Game.Player[] = [];
	cardDecks: Game.Deck[] = [Game.Decks.CORE];
	drawingTimeSeconds: number = GameMaster.DRAWING_TIME.DEFAULT;
	currentRound: number | undefined = undefined;
	totalRounds: number | undefined = undefined;
	promptCard: string | undefined = undefined;
	gameInProgress: boolean = false;

	constructor() {
		makeAutoObservable(this, undefined, {
			autoBind: true,
			deep: true,
		});
		this.initializeDefaultPlayers();
	}

	// --- Computed Values ---
	get gameSettings(): Game.Configuration {
		return {
			players: this.players,
			cardDecks: this.cardDecks,
			drawingTimeSeconds: this.drawingTimeSeconds,
		};
	}

	// --- Actions ---
	initializeDefaultPlayers() {
		// Start with a default number of players
		for (let i = 0; i < GameMaster.PLAYER_COUNT.DEFAULT; i++) {
			this.addPlayer();
		}
	}

	addPlayer(name?: string, avatar?: string) {
		// Prevent adding more players than the max limit
		if (this.players.length >= GameMaster.PLAYER_COUNT.MAX) {
			throw new GameMasterError(GameMasterError.CODE.PLAYER_MAX_REACHED);
		}
		const newPlayer: Game.Player = {
			id: uuidv4(),
			name: name || `Player ${this.players.length + 1}`,
			avatar,
			score: 0,
		};
		this.players.push(newPlayer);
	}

	removePlayer(playerId?: string) {
		// Prevent removing players below the min limit
		if (this.players.length <= GameMaster.PLAYER_COUNT.MIN) {
			throw new GameMasterError(GameMasterError.CODE.PLAYER_MIN_REACHED);
		}

		if (!playerId && this.players.length > 0) {
			// If no ID provided, remove the last player
			this.players.pop();
		} else if (playerId) {
			this.players = this.players.filter((p) => p.id !== playerId);
		}
	}

	toggleCardDeck(deck: Game.Deck) {
		const index = this.cardDecks.indexOf(deck);
		if (index > -1) {
			// Ensure at least one deck is always selected
			if (this.cardDecks.length > 1) {
				this.cardDecks.splice(index, 1);
			}
		} else {
			this.cardDecks.push(deck);
		}
	}

	setDrawingTime(seconds: number) {
		if (
			seconds >= GameMaster.DRAWING_TIME.MIN &&
			seconds <= GameMaster.DRAWING_TIME.MAX
		) {
			this.drawingTimeSeconds = seconds;
		}
	}

	startGame() {
		// Ensure minimum player count is met
		if (this.players.length < GameMaster.PLAYER_COUNT.MIN) {
			throw new GameMasterError(GameMasterError.CODE.NOT_ENOUGH_PLAYERS);
		}

		this.gameInProgress = true;
		this.currentRound = 1;
		this.totalRounds = this.players.length;
		// TODO: Add logic to select and set the first promptCard
		console.log("Starting game...");
		return true;
	}

	endGame() {
		this.gameInProgress = false;
		this.currentRound = undefined;
		this.totalRounds = undefined;
		this.promptCard = undefined;
	}
}

export class GameMasterError extends Error {
	static readonly CODE = identity({
		PLAYER_MIN_REACHED: "PLAYER_MIN_REACHED",
		PLAYER_MAX_REACHED: "PLAYER_MAX_REACHED",
		NOT_ENOUGH_PLAYERS: "NOT_ENOUGH_PLAYERS",
	} as const);

	static readonly MESSAGE = enforceKeys<keyof typeof GameMasterError.CODE>()({
		PLAYER_MIN_REACHED: "Cannot remove more players, minimum limit reached.",
		PLAYER_MAX_REACHED: "Cannot add more players, maximum limit reached.",
		NOT_ENOUGH_PLAYERS: "Cannot start game with fewer than minimum players.",
	} as const);

	readonly code: keyof typeof GameMasterError.CODE;

	constructor(errorCode: keyof typeof GameMasterError.CODE) {
		super(GameMasterError.MESSAGE[errorCode]);
		this.name = "GameMasterError";
		this.code = errorCode;
	}
}
