import { GameMaster, GameMasterError } from "./GameMaster";
import { withMobXTestSetup } from "@/lib/test/mobx-test-setup";
import * as GameTypes from "./types";

describe("GameMaster", () => {
	// Apply MobX test configuration for all tests in this block
	withMobXTestSetup();

	describe("constructor", () => {
		it("should initialize with default players", () => {
			const gameMaster = new GameMaster();
			expect(gameMaster.players.length).toEqual(
				GameMaster.PLAYER_COUNT.DEFAULT
			);
		});

		it("should initialize with the CORE deck", () => {
			const gameMaster = new GameMaster();
			expect(gameMaster.cardDecks).toContain(GameTypes.Decks.CORE);
		});
	});

	describe("addPlayer", () => {
		it("should add a new player with the specified name", () => {
			const gameMaster = new GameMaster();
			const initialCount = gameMaster.players.length;
			const playerName = "Test Player";

			gameMaster.addPlayer(playerName);

			expect(gameMaster.players.length).toBe(initialCount + 1);
			expect(gameMaster.players[gameMaster.players.length - 1].name).toBe(
				playerName
			);
		});

		it("should throw GameMasterError when exceeding maximum player limit", () => {
			const gameMaster = new GameMaster();
			// Fill to maximum
			while (gameMaster.players.length < GameMaster.PLAYER_COUNT.MAX) {
				gameMaster.addPlayer("Extra Player");
			}

			expect(() => gameMaster.addPlayer("One Too Many")).toThrow(
				GameMasterError.MESSAGE.PLAYER_MAX_REACHED
			);
		});
	});

	describe("removePlayer", () => {
		it("should remove the last player when no id is provided", () => {
			const gameMaster = new GameMaster();
			// If we're at the minimum player count, add one more player
			while (gameMaster.players.length <= GameMaster.PLAYER_COUNT.MIN) {
				gameMaster.addPlayer("Extra Player");
			}

			// Now we should be above the minimum number of players
			const countBeforeRemove = gameMaster.players.length;
			expect(countBeforeRemove).toBeGreaterThan(GameMaster.PLAYER_COUNT.MIN);

			const lastPlayer = gameMaster.players[countBeforeRemove - 1];

			// Remove without specifying an ID
			gameMaster.removePlayer();

			expect(gameMaster.players.length).toBe(countBeforeRemove - 1);
			// Make sure the last player was removed
			expect(
				gameMaster.players.find((p) => p.id === lastPlayer.id)
			).toBeUndefined();
		});

		it("should remove a specific player by id", () => {
			const gameMaster = new GameMaster();
			// Add a player to remove
			gameMaster.addPlayer("Player to remove");
			const initialCount = gameMaster.players.length;
			const playerToRemove = gameMaster.players[initialCount - 1];

			// Remove by ID
			gameMaster.removePlayer(playerToRemove.id);

			expect(gameMaster.players.length).toBe(initialCount - 1);
			expect(
				gameMaster.players.find((p) => p.id === playerToRemove.id)
			).toBeUndefined();
		});

		it("should throw GameMasterError when trying to remove players below minimum count", () => {
			const gameMaster = new GameMaster();
			// Ensure we're at minimum count
			while (gameMaster.players.length > GameMaster.PLAYER_COUNT.MIN) {
				gameMaster.removePlayer();
			}

			expect(() => gameMaster.removePlayer()).toThrow(
				GameMasterError.MESSAGE.PLAYER_MIN_REACHED
			);
		});
	});

	describe("toggleCardDeck", () => {
		it("should toggle a deck off when it exists", () => {
			const gameMaster = new GameMaster();
			// Ensure CORE deck is present
			expect(gameMaster.cardDecks).toContain(GameTypes.Decks.CORE);

			// Add another deck to make sure we can safely remove CORE
			gameMaster.toggleCardDeck(GameTypes.Decks.CREATIVE);

			// Toggle CORE off
			gameMaster.toggleCardDeck(GameTypes.Decks.CORE);

			expect(gameMaster.cardDecks).not.toContain(GameTypes.Decks.CORE);
		});

		it("should toggle a deck on when it does not exist", () => {
			const gameMaster = new GameMaster();
			// Ensure the CREATIVE deck is not initially included
			if (gameMaster.cardDecks.includes(GameTypes.Decks.CREATIVE)) {
				gameMaster.toggleCardDeck(GameTypes.Decks.CREATIVE);
			}
			expect(gameMaster.cardDecks).not.toContain(GameTypes.Decks.CREATIVE);

			// Toggle it on
			gameMaster.toggleCardDeck(GameTypes.Decks.CREATIVE);

			expect(gameMaster.cardDecks).toContain(GameTypes.Decks.CREATIVE);
		});

		it("should not allow removing the last deck", () => {
			const gameMaster = new GameMaster();
			// Make sure we only have one deck
			gameMaster.cardDecks = [GameTypes.Decks.CORE];

			// Try to toggle off the only deck
			gameMaster.toggleCardDeck(GameTypes.Decks.CORE);

			// It should still be there
			expect(gameMaster.cardDecks).toContain(GameTypes.Decks.CORE);
		});
	});

	describe("setDrawingTime", () => {
		it("should set drawing time when within allowed range", () => {
			const gameMaster = new GameMaster();
			const newTime = 45;
			gameMaster.setDrawingTime(newTime);
			expect(gameMaster.drawingTimeSeconds).toBe(newTime);
		});

		it("should not set drawing time below minimum", () => {
			const gameMaster = new GameMaster();
			const originalTime = gameMaster.drawingTimeSeconds;
			gameMaster.setDrawingTime(GameMaster.DRAWING_TIME.MIN - 1);
			expect(gameMaster.drawingTimeSeconds).toBe(originalTime);
		});

		it("should not set drawing time above maximum", () => {
			const gameMaster = new GameMaster();
			const originalTime = gameMaster.drawingTimeSeconds;
			gameMaster.setDrawingTime(GameMaster.DRAWING_TIME.MAX + 1);
			expect(gameMaster.drawingTimeSeconds).toBe(originalTime);
		});
	});

	describe("startGame", () => {
		it("should start the game when minimum player count is met", () => {
			const gameMaster = new GameMaster();
			// Ensure we have the minimum number of players
			while (gameMaster.players.length < GameMaster.PLAYER_COUNT.MIN) {
				gameMaster.addPlayer();
			}

			expect(gameMaster.startGame()).toBe(true);
			expect(gameMaster.gameInProgress).toBe(true);
			expect(gameMaster.currentRound).toBe(1);
		});

		it("should throw GameMasterError when starting game with fewer than minimum players", () => {
			const gameMaster = new GameMaster();
			// Set players below minimum
			gameMaster.players = [];

			expect(() => gameMaster.startGame()).toThrow(
				GameMasterError.MESSAGE.NOT_ENOUGH_PLAYERS
			);
		});
	});

	describe("endGame", () => {
		it("should reset game state variables", () => {
			const gameMaster = new GameMaster();
			// Start a game first
			while (gameMaster.players.length < GameMaster.PLAYER_COUNT.MIN) {
				gameMaster.addPlayer();
			}
			gameMaster.startGame();

			gameMaster.endGame();

			expect(gameMaster.gameInProgress).toBe(false);
			expect(gameMaster.currentRound).toBeUndefined();
			expect(gameMaster.totalRounds).toBeUndefined();
			expect(gameMaster.promptCard).toBeUndefined();
		});
	});
});
