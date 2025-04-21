import React, { ReactNode } from "react";
import styles from "./GameSetup.module.scss";

interface GameSetupProps {
	onShowTutorial: () => void;
	children?: ReactNode;
}

const GameSetup: React.FC<GameSetupProps> = ({ onShowTutorial, children }) => {
	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<h1 className={styles.title}>Perfectly Aligned</h1>
				<p className={styles.subtitle}>
					The creative drawing game for ethically dubious people!
				</p>
				<button className={styles.tutorialButton} onClick={onShowTutorial}>
					Show Tutorial
				</button>
			</header>

			<h2 className={styles.setupTitle}>Game Setup</h2>

			<div className={styles.playerSetup}>
				{children || <p>LobbySetup Component Placeholder</p>}
			</div>
		</div>
	);
};

export default GameSetup;
