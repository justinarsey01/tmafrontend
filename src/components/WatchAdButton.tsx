import { useCallback, useState } from "react";
import { useAdsgram } from "../hooks/useAdsgram";

export default function WatchAdButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const blockId = String(
    import.meta.env.VITE_ADSGRAM_BLOCK_ID || "50872"
  );

  const handleReward = useCallback(() => {
    console.log("✅ ADSGRAM REWARD RECEIVED");

    setLoading(false);
    setMessage("✅ Ad completed successfully!");

    // DO NOT ADD COINS HERE YET.
    // We will connect this to the backend after
    // we confirm the ad works.
  }, []);

  const handleError = useCallback((error: unknown) => {
    console.error("❌ ADSGRAM ERROR:", error);

    setLoading(false);

    if (error && typeof error === "object") {
      console.error(
        "AdsGram error details:",
        JSON.stringify(error, null, 2)
      );
    }

    setMessage("❌ AdsGram could not display the ad.");
  }, []);

  const showAd = useAdsgram({
    blockId,
    onReward: handleReward,
    onError: handleError,
  });

  const handleClick = async () => {
    console.log("▶️ Watch Ad clicked");

    setLoading(true);
    setMessage("");

    await showAd();
  };

  return (
    <div style={{ padding: 20 }}>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          width: "100%",
          padding: "14px 20px",
          borderRadius: 12,
          border: "none",
          fontSize: 16,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Loading Ad..." : "🎁 Watch Ad"}
      </button>

      {message && (
        <p style={{ marginTop: 12 }}>
          {message}
        </p>
      )}
    </div>
  );
}