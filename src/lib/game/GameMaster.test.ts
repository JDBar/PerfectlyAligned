import { GameMaster } from "./GameMaster";
import { withMobXTestSetup } from "../test/mobx-test-setup";
import * as GameTypes from "./types";

describe("GameMaster", () => {
	// Apply MobX test configuration for all tests in this block
	withMobXTestSetup();

	let gameMaster: GameMaster;

	beforeEach(() => {
		// Create a fresh instance for each test
		gameMaster = new GameMaster();
	});

	describe("Player management", () => {
		it("should initialize with default players", () => {
			// We expect the constructor to add some default number of players
			expect(gameMaster.players.length).toBeGreaterThan(0);
		});

		it("should add a new player", () => {
			const initialCount = gameMaster.players.length;
			const playerName = "Test Player";

			gameMaster.addPlayer(playerName);

			expect(gameMaster.players.length).toBe(initialCount + 1);
			expect(gameMaster.players[gameMaster.players.length - 1].name).toBe(
				playerName
			);
		});

		it("should remove the last player when no id is provided", () => {
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
	});

	describe("Card deck management", () => {
		it("should initialize with the CORE deck", () => {
			expect(gameMaster.cardDecks).toContain(GameTypes.Decks.CORE);
		});

		it("should toggle a deck off when it exists", () => {
			// Ensure CORE deck is present
			expect(gameMaster.cardDecks).toContain(GameTypes.Decks.CORE);

			// Add another deck to make sure we can safely remove CORE
			gameMaster.toggleCardDeck(GameTypes.Decks.CREATIVE);

			// Toggle CORE off
			gameMaster.toggleCardDeck(GameTypes.Decks.CORE);

			expect(gameMaster.cardDecks).not.toContain(GameTypes.Decks.CORE);
		});

		it("should toggle a deck on when it does not exist", () => {
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
			// Make sure we only have one deck
			gameMaster.cardDecks = [GameTypes.Decks.CORE];

			// Try to toggle off the only deck
			gameMaster.toggleCardDeck(GameTypes.Decks.CORE);

			// It should still be there
			expect(gameMaster.cardDecks).toContain(GameTypes.Decks.CORE);
		});
	});

	describe("Game state management", () => {
		it("should start the game when minimum player count is met", () => {
			// Ensure we have the minimum number of players
			while (gameMaster.players.length < GameMaster.PLAYER_COUNT.MIN) {
				gameMaster.addPlayer();
			}

			expect(gameMaster.startGame()).toBe(true);
			expect(gameMaster.gameInProgress).toBe(true);
			expect(gameMaster.currentRound).toBe(1);
		});

		it("should end the game", () => {
			// Start a game first
			while (gameMaster.players.length < GameMaster.PLAYER_COUNT.MIN) {
				gameMaster.addPlayer();
			}
			gameMaster.startGame();

			gameMaster.endGame();

			expect(gameMaster.gameInProgress).toBe(false);
			expect(gameMaster.currentRound).toBeUndefined();
			expect(gameMaster.totalRounds).toBeUndefined();
		});
	});
});
