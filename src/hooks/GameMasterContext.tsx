import React, { createContext, useContext, ReactNode } from "react";
import { GameMaster } from "../lib/game/GameMaster";

// Create a singleton instance of GameMaster
const gameMasterInstance = new GameMaster();

// Create the context
const GameMasterContext = createContext<GameMaster | null>(null);

/**
 * Provider component that makes the GameMaster instance available to all children
 */
// eslint-disable-next-line mobx/missing-observer
export const GameMasterProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	return (
		<GameMasterContext.Provider value={gameMasterInstance}>
			{children}
		</GameMasterContext.Provider>
	);
};

/**
 * Hook to use the GameMaster instance from context
 * @throws Error if used outside of a GameMasterProvider
 */
export const useGameMaster = (): GameMaster => {
	const context = useContext(GameMasterContext);
	if (context === null) {
		throw new Error("useGameMaster must be used within a GameMasterProvider");
	}
	return context;
};

// Export the singleton instance for direct use where needed
export { gameMasterInstance };
