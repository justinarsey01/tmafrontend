import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAdsgram } from "../hooks/useAdsgram";

import {
  getAdsgramRewardStatus,
  telegramLogin,
} from "../lib/api";

type WatchAdButtonProps = {
  setBalance: React.Dispatch<
    React.SetStateAction<number>
  >;
};

export default function WatchAdButton({
  setBalance,
}: WatchAdButtonProps) {

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [remainingSeconds, setRemainingSeconds] =
    useState(0);

  const blockId = String(
    import.meta.env.VITE_ADSGRAM_BLOCK_ID ||
      "50872"
  );

  /*
  |--------------------------------------------------------------------------
  | Load cooldown from backend
  |--------------------------------------------------------------------------
  */

  const loadCooldown = useCallback(
    async () => {
      try {
        const result =
          await getAdsgramRewardStatus();

        if (
          result?.success &&
          typeof result.remainingSeconds ===
            "number"
        ) {
          setRemainingSeconds(
            Math.max(
              0,
              result.remainingSeconds
            )
          );
        }

      } catch (error) {
        console.error(
          "Could not load AdsGram cooldown:",
          error
        );
      }
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | Load cooldown when component opens
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadCooldown();
  }, [loadCooldown]);

  /*
  |--------------------------------------------------------------------------
  | Countdown
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (remainingSeconds <= 0) {
      return;
    }

    const timer =
      window.setInterval(() => {
        setRemainingSeconds(
          (current) =>
            Math.max(
              0,
              current - 1
            )
        );
      }, 1000);

    return () => {
      window.clearInterval(timer);
    };

  }, [remainingSeconds]);

  /*
  |--------------------------------------------------------------------------
  | Format countdown
  |--------------------------------------------------------------------------
  */

  const formatTime = (
    totalSeconds: number
  ) => {

    const hours =
      Math.floor(
        totalSeconds / 3600
      );

    const minutes =
      Math.floor(
        (totalSeconds % 3600) / 60
      );

    const seconds =
      totalSeconds % 60;

    return `${hours}h ${String(
      minutes
    ).padStart(2, "0")}m ${String(
      seconds
    ).padStart(2, "0")}s`;
  };

  /*
  |--------------------------------------------------------------------------
  | Reward callback
  |--------------------------------------------------------------------------
  */

  const handleReward =
    useCallback(
      async () => {

        console.log(
          "✅ ADSGRAM REWARD RECEIVED"
        );

        setLoading(false);

        setMessage(
          "⏳ Processing your reward..."
        );

        /*
         * Give AdsGram a little time to
         * send the Reward URL to our backend.
         */
        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              2000
            )
        );

        /*
         * Refresh the authoritative wallet
         * balance from the backend.
         */
        try {

          const result =
            await telegramLogin();

          if (result?.success) {
            setBalance(
              result.balance
            );
          }

        } catch (error) {

          console.error(
            "Could not refresh balance:",
            error
          );
        }

        /*
         * Load the server-side cooldown.
         */
        await loadCooldown();

        setMessage(
          "✅ Ad completed! +1,500 Coins"
        );

      },
      [
        setBalance,
        loadCooldown,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | AdsGram error
  |--------------------------------------------------------------------------
  */

  const handleError =
    useCallback(
      (error: unknown) => {

        console.error(
          "❌ ADSGRAM ERROR:",
          error
        );

        setLoading(false);

        setMessage(
          "❌ AdsGram could not display the ad."
        );
      },
      []
    );

  const showAd =
    useAdsgram({
      blockId,
      onReward: handleReward,
      onError: handleError,
    });

  /*
  |--------------------------------------------------------------------------
  | Watch ad
  |--------------------------------------------------------------------------
  */

  const handleClick =
    async () => {

      if (remainingSeconds > 0) {
        return;
      }

      if (loading) {
        return;
      }

      console.log(
        "▶️ Watch Ad clicked"
      );

      setLoading(true);
      setMessage("");

      await showAd();
    };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  const cooldownActive =
    remainingSeconds > 0;

  return (
    <div
      style={{
        padding: 20,
      }}
    >

      <button
        onClick={handleClick}
        disabled={
          loading ||
          cooldownActive
        }
        style={{
          width: "100%",
          padding: "14px 20px",
          borderRadius: 12,
          border: "none",
          fontSize: 16,
          fontWeight: 600,
          cursor:
            loading ||
            cooldownActive
              ? "not-allowed"
              : "pointer",

          opacity:
            loading ||
            cooldownActive
              ? 0.6
              : 1,
        }}
      >

        {loading
          ? "Loading Ad..."
          : cooldownActive
          ? `⏳ ${formatTime(
              remainingSeconds
            )}`
          : "🎁 Watch Ad"}

      </button>

      {cooldownActive && (
        <p
          style={{
            marginTop: 10,
            textAlign: "center",
            fontSize: 13,
          }}
        >
          Next AdsGram reward available
          in {formatTime(
            remainingSeconds
          )}
        </p>
      )}

      {message && (
        <p
          style={{
            marginTop: 12,
            textAlign: "center",
          }}
        >
          {message}
        </p>
      )}

    </div>
  );
}