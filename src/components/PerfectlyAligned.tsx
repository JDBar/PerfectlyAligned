import React from "react";
import styles from "./PerfectlyAligned.module.scss";
import { useGameMaster } from "@/hooks/useGameMaster";
import * as Game from "@/lib/game/types";
import { GameSetup } from "./GameSetup";
import { LobbySetup } from "./LobbySetup";

/**
 * Main game component that manages the game state and renders different screens
 */
export const PerfectlyAligned: React.FC = () => {
	const GM = useGameMaster();

	// Render the appropriate screen based on current game state
	const renderCurrentScreen = () => {
		switch (GM.state.currentScreen) {
			case Game.Screens.SETUP:
				return (
					<GameSetup onShowTutorial={GM.showTutorial}>
						<LobbySetup
							minPlayers={GM.PLAYER_COUNT.MIN}
							maxPlayers={GM.PLAYER_COUNT.MAX}
							defaultPlayers={GM.PLAYER_COUNT.DEFAULT}
							players={GM.state.settings.players}
							onAddPlayer={GM.addPlayer}
							onRemovePlayer={GM.removePlayer}
							onToggleCardDeck={GM.toggleCardDeck}
							onEnterPlayerNames={() => {
								// This would open a modal or navigate to a name entry screen
								console.log("Enter player names clicked");
							}}
							selectedCardDecks={GM.state.settings.cardDecks}
						/>
					</GameSetup>
				);
			case Game.Screens.TUTORIAL:
				return (
					<div>
						<h1>Tutorial Screen (Placeholder)</h1>
						<button onClick={() => GM.navigateTo(Game.Screens.SETUP)}>
							Back to Setup
						</button>
					</div>
				);
			case Game.Screens.DRAWING:
				return <div>Drawing Screen (Placeholder)</div>;
			case Game.Screens.VOTING:
				return <div>Voting Screen (Placeholder)</div>;
			case Game.Screens.RESULTS:
				return <div>Results Screen (Placeholder)</div>;
			default:
				return <div>Unknown Screen</div>;
		}
	};

	return <div className={styles.gameContainer}>{renderCurrentScreen()}</div>;
};

export default PerfectlyAligned;
