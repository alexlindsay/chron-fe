const ShareButton = () => {
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Temporal Tiles",
                    text: "I just played Temporal Tiles! Think you can beat it?",
                    url: "https://temporaltiles.com",
                });
                console.log("Thanks for sharing!");
            } catch (err: unknown) {
                if (err instanceof DOMException && err.name === "AbortError") {
                    // User cancelled the share; no need to log
                    return;
                }
            }
        } else {
            alert("Sharing not supported on this browser.");
        }
    };

    return (
        <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition"
            aria-label="Share result"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7M16 6l-4-4m0 0L8 6m4-4v12"
                />
            </svg>
        </button>
    )
}

export default ShareButton;