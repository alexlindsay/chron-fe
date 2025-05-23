import "./globals.css";
import type { Metadata } from "next";
import { spaceGrotesk, ibmPlexMono } from './fonts/fonts'

export const metadata: Metadata = {
    title: "Temporal Tiles",
    description: "Timeline Events Game!",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="en"
            className={`${spaceGrotesk.variable} ${ibmPlexMono.variable}`}
        >
            <body className="antialiased">{children}</body>
        </html>
    );
}
