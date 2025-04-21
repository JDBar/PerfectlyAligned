import React from "react";
import styles from "./LobbySetup.module.scss";
import * as Game from "@/lib/game/types";

/**
 * Props for the LobbySetup component
 */
interface LobbySetupProps {
	minPlayers: number;
	maxPlayers: number;
	defaultPlayers: number;
	players: Game.Player[];
	onAddPlayer: () => void;
	onRemovePlayer: () => void;
	onToggleCardDeck: (deck: Game.Deck) => void;
	onEnterPlayerNames: () => void;
	selectedCardDecks: Game.Deck[];
}

/**
 * LobbySetup component for configuring players and card decks
 */
export const LobbySetup: React.FC<LobbySetupProps> = ({
	minPlayers,
	maxPlayers,
	players,
	onAddPlayer,
	onRemovePlayer,
	onToggleCardDeck,
	onEnterPlayerNames,
	selectedCardDecks,
}) => {
	const playerCount = players.length;

	const isDeckSelected = (deck: Game.Deck): boolean => {
		return selectedCardDecks.includes(deck);
	};

	return (
		<div className={styles.container}>
			<h3 className={styles.title}>Customize Your Card Options!!</h3>

			<div className={styles.playerCount}>
				<span className={styles.playerCountText}>
					Players Ready? ({minPlayers}-{maxPlayers})
				</span>
				<button
					className={styles.numberButton}
					onClick={onRemovePlayer}
					disabled={playerCount <= minPlayers}
				>
					-
				</button>
				<button className={`${styles.numberButton} ${styles.active}`}>
					{playerCount}
				</button>
				<button
					className={styles.numberButton}
					onClick={onAddPlayer}
					disabled={playerCount >= maxPlayers}
				>
					+
				</button>
			</div>

			<button className={styles.enterButton} onClick={onEnterPlayerNames}>
				Enter Player Names
			</button>

			<div className={styles.cardOptions}>
				<h4 className={styles.cardOptionsTitle}>
					Customize Your Card Options!!
				</h4>

				<div
					className={`${styles.deckOption} ${
						isDeckSelected(Game.Decks.CORE) ? styles.active : ""
					}`}
					onClick={() => onToggleCardDeck(Game.Decks.CORE)}
				>
					{Game.Decks.CORE}
				</div>

				<div
					className={`${styles.deckOption} ${styles.creative} ${
						isDeckSelected(Game.Decks.CREATIVE) ? styles.active : ""
					}`}
					onClick={() => onToggleCardDeck(Game.Decks.CREATIVE)}
				>
					{Game.Decks.CREATIVE}
				</div>

				<div
					className={`${styles.deckOption} ${styles.taboo} ${
						isDeckSelected(Game.Decks.TABOO) ? styles.active : ""
					}`}
					onClick={() => onToggleCardDeck(Game.Decks.TABOO)}
				>
					{Game.Decks.TABOO}
				</div>
			</div>
		</div>
	);
};
