import { useCallback, useState } from "react";
import { useAdsgram } from "../hooks/useAdsgram";

export default function WatchAdButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleReward = useCallback(() => {
    setLoading(false);
    setMessage("🎉 Ad completed successfully!");

    // IMPORTANT:
    // We are NOT adding Coins yet.
    // This is only an AdsGram test.
  }, []);

  const handleError = useCallback((error: unknown) => {
    console.error("AdsGram:", error);

    setLoading(false);

    if (error instanceof Error) {
      setMessage(error.message);
    } else {
      setMessage("Unable to show advertisement.");
    }
  }, []);

  const showAd = useAdsgram(handleReward, handleError);

  const handleClick = async () => {
    setMessage("");
    setLoading(true);

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