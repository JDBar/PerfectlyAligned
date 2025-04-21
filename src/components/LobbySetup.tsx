import React, { useState } from "react";
import styles from "./LobbySetup.module.scss";
import { Deck } from "../lib/game/types";

interface LobbySetupProps {
	onSetPlayerCount: (count: number) => void;
	onToggleCardDeck: (deck: CardDeck) => void;
	onEnterPlayerNames: () => void;
	selectedCardDecks: CardDeck[];
}

const LobbySetup: React.FC<LobbySetupProps> = ({
	onSetPlayerCount,
	onToggleCardDeck,
	onEnterPlayerNames,
	selectedCardDecks,
}) => {
	const [playerCount, setPlayerCount] = useState(3);

	const handlePlayerCountChange = (count: number) => {
		if (count >= 2 && count <= 8) {
			setPlayerCount(count);
			onSetPlayerCount(count);
		}
	};

	return (
		<div className={styles.container}>
			<h3 className={styles.title}>Customize Your Card Options!!</h3>

			<div className={styles.playerCount}>
				<span className={styles.playerCountText}>Players Ready? (3-8)</span>
				<button
					className={styles.numberButton}
					onClick={() => handlePlayerCountChange(playerCount - 1)}
					disabled={playerCount <= 2}
				>
					-
				</button>
				<button className={`${styles.numberButton} ${styles.active}`}>
					{playerCount}
				</button>
				<button
					className={styles.numberButton}
					onClick={() => handlePlayerCountChange(playerCount + 1)}
					disabled={playerCount >= 8}
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
					className={styles.deckOption}
					onClick={() => onToggleCardDeck(Deck.CORE)}
				>
					{Deck.CORE}
				</div>

				<div
					className={`${styles.deckOption} ${styles.creative}`}
					onClick={() => onToggleCardDeck(Deck.CREATIVE)}
				>
					{Deck.CREATIVE}
				</div>

				<div
					className={`${styles.deckOption} ${styles.taboo}`}
					onClick={() => onToggleCardDeck(Deck.TABOO)}
				>
					{Deck.TABOO}
				</div>
			</div>
		</div>
	);
};

export default LobbySetup;
