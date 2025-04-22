import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import styles from "./PerfectlyAligned.module.scss";
import * as Game from "@/lib/game/types";
import { useGameMaster } from "@/hooks/GameMasterContext";
import { GameSetup } from "./GameSetup";
import { LobbySetup } from "./LobbySetup";

/**
 * Main game component that manages UI state (screens) and renders different views.
 * It observes the GameMaster instance for changes to core game state.
 */
const PerfectlyAlignedComponent: React.FC = () => {
	// Get the GameMaster instance from context
	const gameMaster = useGameMaster();

	// UI state managed by React
	const [currentScreen, setCurrentScreen] = useState<Game.Screen>(
		Game.Screens.SETUP
	);

	// Screen navigation functions
	const navigateTo = (screen: Game.Screen) => {
		setCurrentScreen(screen);
	};

	const handleShowTutorial = () => {
		navigateTo(Game.Screens.TUTORIAL);
	};

	const handleStartGame = () => {
		if (gameMaster.startGame()) {
			navigateTo(Game.Screens.DRAWING);
		}
	};

	// Render the appropriate screen based on current UI state
	const renderCurrentScreen = () => {
		switch (currentScreen) {
			case Game.Screens.SETUP:
				return (
					<GameSetup onShowTutorial={handleShowTutorial}>
						<LobbySetup
							onEnterPlayerNames={() => {
								// TODO: Make a component for managing player names/avatars in LobbySetup instead.
								console.log("Enter player names clicked");
							}}
							onStartGame={handleStartGame}
						/>
					</GameSetup>
				);
			case Game.Screens.TUTORIAL:
				return (
					<div>
						<h1>Tutorial Screen (Placeholder)</h1>
						<button onClick={() => navigateTo(Game.Screens.SETUP)}>
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
				console.error(`Unhandled screen: ${currentScreen}`);
				return <div>Unknown Screen</div>;
		}
	};

	return <div className={styles.gameContainer}>{renderCurrentScreen()}</div>;
};

// Wrap the component with observer to make it reactive to MobX state changes
export const PerfectlyAligned = observer(PerfectlyAlignedComponent);
