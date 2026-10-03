
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

import {
  Gift,
  Play,
  Sparkles,
  Clock3,
  Loader2,
  CheckCircle2,
} from "lucide-react";


/*
|--------------------------------------------------------------------------
| ADVERTISEMENT CONFIGURATION
|--------------------------------------------------------------------------
|
| Change your advertisement details HERE.
|
| You do NOT need to edit the rest of the component.
|
*/

const AD_CONFIG = {

  /*
   * Advertisement image URL
   *
   * Example:
   *
   * "https://example.com/my-ad.jpg"
   */
  imageUrl:
    "https://dlfwaffhsiuodtxtxmti.supabase.co/storage/v1/object/public/Ads%20image/20261002_150209.jpg",


  /*
   * Advertiser / channel / company name
   */
  advertiserName:
    "ChannelFix Sponsored",


  /*
   * Main advertisement title
   */
  title:
    "Watch this sponsored advertisement",


  /*
   * Advertisement description
   */
  description:
    "Watch the advertisement and earn coins instantly after completion.",


  /*
   * Reward shown to the user
   */
  reward:
    1500,


  /*
   * Text displayed on the sponsored label
   */
  sponsoredLabel:
    "SPONSORED",


  /*
   * Small label above the advertisement title
   */
  adLabel:
    "ADVERTISEMENT",

};


/*
|--------------------------------------------------------------------------
| ADSGRAM CONFIGURATION
|--------------------------------------------------------------------------
*/

const ADSGRAM_BLOCK_ID = String(
  import.meta.env.VITE_ADSGRAM_BLOCK_ID ||
    "50872"
);


/*
|--------------------------------------------------------------------------
| PROPS
|--------------------------------------------------------------------------
*/

type WatchAdButtonProps = {
  setBalance: React.Dispatch<
    React.SetStateAction<number>
  >;
};


/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function WatchAdButton({
  setBalance,
}: WatchAdButtonProps) {

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [remainingSeconds, setRemainingSeconds] =
    useState(0);


  /*
  |--------------------------------------------------------------------------
  | LOAD COOLDOWN
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
  | LOAD COOLDOWN WHEN COMPONENT OPENS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    loadCooldown();

  }, [loadCooldown]);


  /*
  |--------------------------------------------------------------------------
  | COUNTDOWN
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
  | FORMAT COUNTDOWN
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
  | REWARD CALLBACK
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
         * Give AdsGram time to send the
         * Reward URL to the backend.
         */

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              2000
            )
        );


        /*
         * Refresh authoritative wallet balance.
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
         * Refresh server-side cooldown.
         */

        await loadCooldown();


        setMessage(
          `✅ Ad completed! +${AD_CONFIG.reward.toLocaleString()} Coins`
        );

      },
      [
        setBalance,
        loadCooldown,
      ]
    );


  /*
  |--------------------------------------------------------------------------
  | ADSGRAM ERROR
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


  /*
  |--------------------------------------------------------------------------
  | ADSGRAM
  |--------------------------------------------------------------------------
  */

  const showAd =
    useAdsgram({
      blockId: ADSGRAM_BLOCK_ID,
      onReward: handleReward,
      onError: handleError,
    });


  /*
  |--------------------------------------------------------------------------
  | WATCH AD
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
  | STATE
  |--------------------------------------------------------------------------
  */

  const cooldownActive =
    remainingSeconds > 0;


  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (

    <div className="watch-ad-wrapper">

      <style>{`

        /*
        |--------------------------------------------------------------------------
        | WRAPPER
        |--------------------------------------------------------------------------
        */

        .watch-ad-wrapper {
          width: 100%;
          box-sizing: border-box;
          padding: 8px 0 12px;
        }


        /*
        |--------------------------------------------------------------------------
        | AD CARD
        |--------------------------------------------------------------------------
        */

        .watch-ad-card {
          position: relative;
          width: 100%;

          overflow: hidden;

          border-radius: 18px;

          background:
            linear-gradient(
              145deg,
              #171717,
              #101010
            );

          border: 1px solid
            rgba(255,255,255,0.08);

          box-shadow:
            0 10px 30px
            rgba(0,0,0,0.22);
        }


        /*
        |--------------------------------------------------------------------------
        | IMAGE
        |--------------------------------------------------------------------------
        */

        .watch-ad-image {
          position: relative;

          width: 100%;
          height: 175px;

          overflow: hidden;

          background: #202020;
        }

        .watch-ad-image img {
          width: 100%;
          height: 100%;

          display: block;

          object-fit: cover;

          transform: scale(1.02);

          animation:
            watchAdImageZoom
            7s
            ease-in-out
            infinite alternate;
        }

        @keyframes watchAdImageZoom {

          0% {
            transform: scale(1.02);
          }

          100% {
            transform: scale(1.09);
          }

        }


        /*
        |--------------------------------------------------------------------------
        | IMAGE OVERLAY
        |--------------------------------------------------------------------------
        */

        .watch-ad-image::after {
          content: "";

          position: absolute;

          inset: 0;

          background:
            linear-gradient(
              to bottom,
              rgba(0,0,0,0.04),
              rgba(0,0,0,0.12) 40%,
              rgba(0,0,0,0.82)
            );

          pointer-events: none;
        }


        /*
        |--------------------------------------------------------------------------
        | SPONSORED LABEL
        |--------------------------------------------------------------------------
        */

        .watch-ad-sponsored {
          position: absolute;

          top: 12px;
          left: 12px;

          z-index: 3;

          display: inline-flex;
          align-items: center;
          gap: 5px;

          padding:
            5px 8px;

          border-radius: 7px;

          background:
            rgba(0,0,0,0.55);

          border: 1px solid
            rgba(255,255,255,0.12);

          backdrop-filter:
            blur(8px);

          color: #ffffff;

          font-size: 8px;
          font-weight: 800;

          letter-spacing: 0.7px;
        }


        /*
        |--------------------------------------------------------------------------
        | REWARD BADGE
        |--------------------------------------------------------------------------
        */

        .watch-ad-reward {
          position: absolute;

          top: 12px;
          right: 12px;

          z-index: 3;

          display: flex;
          align-items: center;
          gap: 5px;

          padding:
            6px 9px;

          border-radius: 8px;

          background:
            rgba(245,184,0,0.95);

          color: #111111;

          font-size: 10px;
          font-weight: 900;

          box-shadow:
            0 5px 18px
            rgba(245,184,0,0.25);

          animation:
            rewardPulse
            2s
            ease-in-out
            infinite;
        }

        @keyframes rewardPulse {

          0%,
          100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.04);
          }

        }


        /*
        |--------------------------------------------------------------------------
        | PLAY ICON
        |--------------------------------------------------------------------------
        */

        .watch-ad-play {
          position: absolute;

          left: 50%;
          top: 50%;

          z-index: 4;

          width: 52px;
          height: 52px;

          transform:
            translate(-50%, -50%);

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            rgba(255,255,255,0.94);

          color: #111111;

          box-shadow:
            0 8px 30px
            rgba(0,0,0,0.35);

          animation:
            playPulse
            2s
            ease-in-out
            infinite;
        }

        @keyframes playPulse {

          0%,
          100% {
            box-shadow:
              0 8px 30px
              rgba(0,0,0,0.35);
          }

          50% {
            box-shadow:
              0 8px 35px
              rgba(245,184,0,0.42);
          }

        }


        /*
        |--------------------------------------------------------------------------
        | CONTENT
        |--------------------------------------------------------------------------
        */

        .watch-ad-content {
          padding:
            14px
            14px
            13px;
        }

        .watch-ad-content-top {
          display: flex;
          align-items: center;
          gap: 7px;

          margin-bottom: 6px;
        }

        .watch-ad-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #f5b800;

          box-shadow:
            0 0 10px
            rgba(245,184,0,0.7);

          animation:
            adDotPulse
            1.5s
            ease-in-out
            infinite;
        }

        @keyframes adDotPulse {

          0%,
          100% {
            opacity: 0.5;
            transform: scale(0.8);
          }

          50% {
            opacity: 1;
            transform: scale(1.15);
          }

        }

        .watch-ad-label {
          color: #888888;

          font-size: 8px;
          font-weight: 800;

          letter-spacing: 1px;
        }


        /*
        |--------------------------------------------------------------------------
        | ADVERTISER
        |--------------------------------------------------------------------------
        */

        .watch-ad-advertiser {
          margin:
            0 0 4px;

          color: #bbbbbb;

          font-size: 10px;
          font-weight: 700;
        }


        /*
        |--------------------------------------------------------------------------
        | TITLE
        |--------------------------------------------------------------------------
        */

        .watch-ad-title {
          margin: 0;

          color: #ffffff;

          font-size: 16px;
          font-weight: 850;

          line-height: 1.25;
        }


        /*
        |--------------------------------------------------------------------------
        | DESCRIPTION
        |--------------------------------------------------------------------------
        */

        .watch-ad-description {
          margin:
            5px 0 0;

          color: #888888;

          font-size: 10px;

          line-height: 1.5;
        }


        /*
        |--------------------------------------------------------------------------
        | BOTTOM
        |--------------------------------------------------------------------------
        */

        .watch-ad-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 10px;

          padding:
            0 14px
            14px;
        }


        /*
        |--------------------------------------------------------------------------
        | EARNING
        |--------------------------------------------------------------------------
        */

        .watch-ad-earning {
          min-width: 0;
        }

        .watch-ad-earning-label {
          display: block;

          color: #777777;

          font-size: 8px;
          font-weight: 700;

          margin-bottom: 2px;
        }

        .watch-ad-earning-value {
          display: flex;
          align-items: center;
          gap: 4px;

          color: #f5b800;

          font-size: 12px;
          font-weight: 900;
        }


        /*
        |--------------------------------------------------------------------------
        | BUTTON
        |--------------------------------------------------------------------------
        */

        .watch-ad-button {
          position: relative;

          min-width: 135px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          padding:
            11px 15px;

          border: none;
          border-radius: 11px;

          background:
            linear-gradient(
              135deg,
              #f5b800,
              #ffc928
            );

          color: #111111;

          font-size: 11px;
          font-weight: 900;

          cursor: pointer;

          overflow: hidden;

          box-shadow:
            0 6px 18px
            rgba(245,184,0,0.18);

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            opacity 0.2s ease;
        }

        .watch-ad-button::before {
          content: "";

          position: absolute;

          top: 0;
          left: -100%;

          width: 70%;
          height: 100%;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,0.42),
              transparent
            );

          transform:
            skewX(-20deg);

          animation:
            buttonShine
            3.2s
            ease-in-out
            infinite;
        }

        @keyframes buttonShine {

          0% {
            left: -100%;
          }

          45%,
          100% {
            left: 150%;
          }

        }

        .watch-ad-button:hover:not(:disabled) {
          transform:
            translateY(-2px);

          box-shadow:
            0 9px 25px
            rgba(245,184,0,0.28);
        }

        .watch-ad-button:active:not(:disabled) {
          transform:
            scale(0.97);
        }

        .watch-ad-button:disabled {
          cursor: not-allowed;
          opacity: 0.58;
          box-shadow: none;
        }


        /*
        |--------------------------------------------------------------------------
        | LOADING SPINNER
        |--------------------------------------------------------------------------
        */

        .watch-ad-spin {
          animation:
            watchAdSpin
            1s
            linear
            infinite;
        }

        @keyframes watchAdSpin {

          from {
            transform:
              rotate(0deg);
          }

          to {
            transform:
              rotate(360deg);
          }

        }


        /*
        |--------------------------------------------------------------------------
        | COOLDOWN
        |--------------------------------------------------------------------------
        */

        .watch-ad-cooldown {
          display: flex;
          align-items: center;
          gap: 8px;

          margin:
            0 14px
            14px;

          padding:
            10px 11px;

          border-radius: 10px;

          background:
            rgba(255,255,255,0.035);

          border: 1px solid
            rgba(255,255,255,0.06);

          color: #888888;

          font-size: 9px;
        }

        .watch-ad-cooldown svg {
          flex-shrink: 0;

          color: #f5b800;
        }

        .watch-ad-cooldown strong {
          color: #ffffff;

          font-size: 10px;
        }


        /*
        |--------------------------------------------------------------------------
        | MESSAGE
        |--------------------------------------------------------------------------
        */

        .watch-ad-message {
          display: flex;
          align-items: center;
          justify-content: center;

          gap: 5px;

          padding:
            0 14px
            13px;

          text-align: center;

          color: #888888;

          font-size: 10px;
        }

        .watch-ad-message.success {
          color: #4ade80;
        }

        .watch-ad-message.error {
          color: #fca5a5;
        }


        /*
        |--------------------------------------------------------------------------
        | MOBILE
        |--------------------------------------------------------------------------
        */

        @media (max-width: 480px) {

          .watch-ad-image {
            height: 160px;
          }

          .watch-ad-content {
            padding:
              13px
              12px
              11px;
          }

          .watch-ad-title {
            font-size: 15px;
          }

          .watch-ad-bottom {
            padding:
              0 12px
              13px;
          }

          .watch-ad-button {
            min-width: 125px;

            padding:
              10px 12px;

            font-size: 10px;
          }

        }


        /*
        |--------------------------------------------------------------------------
        | SMALL PHONES
        |--------------------------------------------------------------------------
        */

        @media (max-width: 360px) {

          .watch-ad-image {
            height: 145px;
          }

          .watch-ad-bottom {
            flex-direction: column;
            align-items: stretch;
          }

          .watch-ad-button {
            width: 100%;
          }

          .watch-ad-earning {
            text-align: center;
          }

          .watch-ad-earning-value {
            justify-content: center;
          }

        }

      `}</style>


      {/* ================================================================
          AD CARD
      ================================================================ */}

      <div className="watch-ad-card">


        {/* ==============================================================
            IMAGE
        ============================================================== */}

        <div className="watch-ad-image">

          <img
            src={AD_CONFIG.imageUrl}
            alt={AD_CONFIG.title}
          />


          {/* SPONSORED */}

          <div className="watch-ad-sponsored">

            <Sparkles size={10} />

            {AD_CONFIG.sponsoredLabel}

          </div>


          {/* REWARD */}

          <div className="watch-ad-reward">

            <Gift size={11} />

            +{AD_CONFIG.reward.toLocaleString()}

          </div>


          {/* PLAY */}

          {!loading &&
            !cooldownActive && (

              <div className="watch-ad-play">

                <Play
                  size={21}
                  fill="currentColor"
                />

              </div>

            )}

        </div>


        {/* ==============================================================
            CONTENT
        ============================================================== */}

        <div className="watch-ad-content">

          <div className="watch-ad-content-top">

            <span className="watch-ad-dot" />

            <span className="watch-ad-label">

              {AD_CONFIG.adLabel}

            </span>

          </div>


          <div className="watch-ad-advertiser">

            {AD_CONFIG.advertiserName}

          </div>


          <h3 className="watch-ad-title">

            {AD_CONFIG.title}

          </h3>


          <p className="watch-ad-description">

            {AD_CONFIG.description}

          </p>

        </div>


        {/* ==============================================================
            ACTION
        ============================================================== */}

        <div className="watch-ad-bottom">


          {/* REWARD */}

          <div className="watch-ad-earning">

            <span className="watch-ad-earning-label">

              YOUR REWARD

            </span>

            <span className="watch-ad-earning-value">

              <Gift size={14} />

              +{AD_CONFIG.reward.toLocaleString()}
              {" "}
              Coins

            </span>

          </div>


          {/* BUTTON */}

          <button
            type="button"
            onClick={handleClick}
            disabled={
              loading ||
              cooldownActive
            }
            className="watch-ad-button"
          >

            {loading ? (

              <>

                <Loader2
                  size={15}
                  className="watch-ad-spin"
                />

                Loading Ad...

              </>

            ) : cooldownActive ? (

              <>

                <Clock3 size={15} />

                {formatTime(
                  remainingSeconds
                )}

              </>

            ) : (

              <>

                <Play
                  size={15}
                  fill="currentColor"
                />

                Watch Ad

              </>

            )}

          </button>

        </div>


        {/* ==============================================================
            COOLDOWN
        ============================================================== */}

        {cooldownActive && (

          <div className="watch-ad-cooldown">

            <Clock3 size={14} />

            <span>

              Next AdsGram reward available
              in{" "}

              <strong>
                {formatTime(
                  remainingSeconds
                )}
              </strong>

            </span>

          </div>

        )}


        {/* ==============================================================
            MESSAGE
        ============================================================== */}

        {message && (

          <div
            className={`watch-ad-message ${
              message.startsWith("✅")
                ? "success"
                : message.startsWith("❌")
                ? "error"
                : ""
            }`}
          >

            {message.startsWith("✅") && (
              <CheckCircle2 size={13} />
            )}

            {message}

          </div>

        )}

      </div>

    </div>
  );
}

