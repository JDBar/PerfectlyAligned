import type { Metadata } from "next";
import "../styles/globals.scss";

export const metadata: Metadata = {
	title: "Perfectly Aligned",
	description: "The creative drawing game for ethically dubious people!",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
