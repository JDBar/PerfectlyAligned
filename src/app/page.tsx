"use client";

import { PerfectlyAligned } from "@/components/PerfectlyAligned";
import { GameMasterProvider } from "@/hooks/GameMasterContext";

/**
 * Home page component that renders the main game
 */
export default function Home() {
	return (
		<GameMasterProvider>
			<PerfectlyAligned />
		</GameMasterProvider>
	);
}
