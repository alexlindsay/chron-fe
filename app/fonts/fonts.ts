import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";

export const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-sans",
    display: "swap",
});

export const ibmPlexMono = IBM_Plex_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
    display: "swap",
    weight: ["400"]
});