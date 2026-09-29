import { useCallback, useState } from "react";
import { useAdsgram } from "../hooks/useAdsgram";
import { telegramLogin } from "../lib/api";

interface WatchAdButtonProps {
  setBalance: React.Dispatch<React.SetStateAction<number>>;
}

export default function WatchAdButton({
  setBalance,
}: WatchAdButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const blockId = String(
    import.meta.env.VITE_ADSGRAM_BLOCK_ID || "50872"
  );

  /*
   * Refresh the balance from the CoinEarn backend.
   *
   * We do NOT add 1,500 here.
   * The backend/Supabase is responsible for the reward.
   */
  const refreshBalanceAfterAd = useCallback(async () => {
    /*
     * AdsGram's server-side Reward URL can take a little
     * time to reach our backend.
     *
     * We check the backend several times instead of
     * immediately assuming the reward has already arrived.
     */
    const delays = [
      1500,
      2500,
      4000,
      6000,
    ];

    for (const delay of delays) {
      await new Promise((resolve) =>
        setTimeout(resolve, delay)
      );

      try {
        const result = await telegramLogin();

        if (
          result &&
          result.success &&
          Number.isFinite(Number(result.balance))
        ) {
          const newBalance = Number(result.balance);

          console.log(
            "💰 Updated CoinEarn balance:",
            newBalance
          );

          setBalance(newBalance);

          /*
           * We successfully received the latest
           * authoritative balance from the backend.
           */
          return;
        }
      } catch (error) {
        console.error(
          "Could not refresh balance after ad:",
          error
        );
      }
    }

    console.warn(
      "Ads completed, but the updated balance was not returned yet."
    );
  }, [setBalance]);

  /*
   * Called when AdsGram reports that the ad
   * was successfully completed.
   */
  const handleReward = useCallback(async () => {
    console.log(
      "✅ ADSGRAM REWARD RECEIVED"
    );

    setMessage(
      "✅ Ad completed! Confirming your reward..."
    );

    /*
     * DO NOT add 1,500 Coins here.
     *
     * The backend Reward URL is responsible for
     * crediting the user's Supabase wallet.
     */
    await refreshBalanceAfterAd();

    setLoading(false);

    setMessage(
      "🎉 Ad completed! Your reward has been processed."
    );
  }, [refreshBalanceAfterAd]);

  const handleError = useCallback(
    (error: unknown) => {
      console.error(
        "❌ ADSGRAM ERROR:",
        error
      );

      setLoading(false);

      if (
        error &&
        typeof error === "object"
      ) {
        console.error(
          "AdsGram error details:",
          JSON.stringify(
            error,
            null,
            2
          )
        );
      }

      setMessage(
        "❌ AdsGram could not display the ad."
      );
    },
    []
  );

  const showAd = useAdsgram({
    blockId,
    onReward: handleReward,
    onError: handleError,
  });

  const handleClick = async () => {
    console.log(
      "▶️ Watch Ad clicked"
    );

    setLoading(true);
    setMessage("");

    try {
      await showAd();
    } catch (error) {
      console.error(
        "AdsGram show error:",
        error
      );

      setLoading(false);

      setMessage(
        "❌ Could not show the advertisement."
      );
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
          cursor: loading
            ? "not-allowed"
            : "pointer",
        }}
      >
        {loading
          ? "Processing Reward..."
          : "🎁 Watch Ad"}
      </button>

      {message && (
        <p
          style={{
            marginTop: 12,
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}