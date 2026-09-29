import { useCallback, useState } from "react";
import { useAdsgram } from "../hooks/useAdsgram";

export default function WatchAdButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleReward = useCallback(() => {
    console.log("✅ ADSGRAM REWARD RECEIVED");

    setLoading(false);
    setMessage("✅ Ad completed successfully!");
  }, []);

  const handleError = useCallback((error: unknown) => {
    console.error("❌ ADSGRAM ERROR:", error);

    setLoading(false);

    try {
      console.error(
        "AdsGram error JSON:",
        JSON.stringify(error, null, 2)
      );
    } catch {
      console.error("Could not stringify AdsGram error");
    }

    setMessage(
      "AdsGram could not display an ad. Check the browser console."
    );
  }, []);

  const showAd = useAdsgram(handleReward, handleError);

  const handleClick = async () => {
    console.log("▶️ Watch Ad clicked");

    setMessage("");
    setLoading(true);

    try {
      await showAd();
    } catch (error) {
      console.error("❌ showAd failed:", error);
      setLoading(false);
    }
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