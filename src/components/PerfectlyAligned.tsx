import React from "react";
import styles from "./PerfectlyAligned.module.scss";
import { useGameState } from "@/hooks/useGameState";
import * as Game from "@/lib/game/types";
import GameSetup from "./GameSetup";
import LobbySetup from "./LobbySetup";

const PerfectlyAligned: React.FC = () => {
	const {
		gameState,
		navigateTo,
		addPlayer,
		removePlayer,
		toggleCardDeck,
		setDrawingTime,
		startGame,
		showTutorial,
	} = useGameState();

	// Render the appropriate screen based on current game state
	const renderCurrentScreen = () => {
		switch (gameState.currentScreen) {
			case Game.Screen.SETUP:
				return (
					<GameSetup onShowTutorial={showTutorial}>
						<LobbySetup
							onSetPlayerCount={(count) => {
								// This is a simplified version - in a real implementation,
								// we'd need to add/remove players to match the count
								const currentPlayers = gameState.settings.players;
								if (count > currentPlayers.length) {
									for (let i = currentPlayers.length; i < count; i++) {
										addPlayer(`Player ${i + 1}`);
									}
								} else if (count < currentPlayers.length) {
									const playersToRemove = currentPlayers.slice(count);
									playersToRemove.forEach((player) => removePlayer(player.id));
								}
							}}
							onToggleCardDeck={toggleCardDeck}
							onEnterPlayerNames={() => {
								// This would open a modal or navigate to a name entry screen
								console.log("Enter player names clicked");
							}}
							selectedCardDecks={gameState.settings.cardDecks}
						/>
					</GameSetup>
				);
			case Game.Screen.TUTORIAL:
				return (
					<div>
						<h1>Tutorial Screen (Placeholder)</h1>
						<button onClick={() => navigateTo(Game.Screen.SETUP)}>
							Back to Setup
						</button>
					</div>
				);
			case Game.Screen.DRAWING:
				return <div>Drawing Screen (Placeholder)</div>;
			case Game.Screen.VOTING:
				return <div>Voting Screen (Placeholder)</div>;
			case Game.Screen.RESULTS:
				return <div>Results Screen (Placeholder)</div>;
			default:
				return <div>Unknown Screen</div>;
		}
	};

	return <div className={styles.gameContainer}>{renderCurrentScreen()}</div>;
};

export default PerfectlyAligned;
