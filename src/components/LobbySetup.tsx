import React from "react";
import { observer } from "mobx-react-lite";
import styles from "./LobbySetup.module.scss";
import * as GameTypes from "@/lib/game/types";
import { useGameMaster } from "@/hooks/GameMasterContext";
import { GameMaster } from "@/lib/game/GameMaster";

/**
 * Props for the LobbySetup component
 */
interface LobbySetupProps {
	onEnterPlayerNames: () => void;
	onStartGame: () => void;
}

/**
 * LobbySetup component for configuring players and card decks
 */
export const LobbySetup: React.FC<LobbySetupProps> = observer(
	function LobbySetup({ onEnterPlayerNames, onStartGame }) {
		const gameMaster = useGameMaster();
		const playerCount = gameMaster.players.length;
		const { MIN: minPlayers, MAX: maxPlayers } = GameMaster.PLAYER_COUNT;

		const isDeckSelected = (deck: GameTypes.Deck): boolean => {
			return gameMaster.cardDecks.includes(deck);
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
						onClick={() => gameMaster.removePlayer()}
						disabled={playerCount <= minPlayers}
					>
						-
					</button>
					<button className={`${styles.numberButton} ${styles.active}`}>
						{playerCount}
					</button>
					<button
						className={styles.numberButton}
						onClick={() => gameMaster.addPlayer()}
						disabled={playerCount >= maxPlayers}
					>
						+
					</button>
				</div>

				<div className={styles.playerList}>
					{gameMaster.players.map((player, index) => (
						<div key={player.id} className={styles.playerItem}>
							<span className={styles.playerName}>
								{player.name || `Player ${index + 1}`}
							</span>
						</div>
					))}
				</div>

				<div className={styles.buttonGroup}>
					<button className={styles.enterButton} onClick={onEnterPlayerNames}>
						Enter Player Names
					</button>

					<button className={styles.startGameButton} onClick={onStartGame}>
						Start Game
					</button>
				</div>

				<div className={styles.cardOptions}>
					<h4 className={styles.cardOptionsTitle}>
						Customize Your Card Options!!
					</h4>

					<div
						className={`${styles.deckOption} ${
							isDeckSelected(GameTypes.Decks.CORE) ? styles.active : ""
						}`}
						onClick={() => gameMaster.toggleCardDeck(GameTypes.Decks.CORE)}
					>
						{GameTypes.Decks.CORE}
					</div>

					<div
						className={`${styles.deckOption} ${styles.creative} ${
							isDeckSelected(GameTypes.Decks.CREATIVE) ? styles.active : ""
						}`}
						onClick={() => gameMaster.toggleCardDeck(GameTypes.Decks.CREATIVE)}
					>
						{GameTypes.Decks.CREATIVE}
					</div>

					<div
						className={`${styles.deckOption} ${styles.taboo} ${
							isDeckSelected(GameTypes.Decks.TABOO) ? styles.active : ""
						}`}
						onClick={() => gameMaster.toggleCardDeck(GameTypes.Decks.TABOO)}
					>
						{GameTypes.Decks.TABOO}
					</div>
				</div>
			</div>
		);
	}
);
