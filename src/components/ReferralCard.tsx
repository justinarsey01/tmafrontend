import { useEffect, useState } from "react";

import {
  Check,
  Copy,
  Share2,
  Users,
  Coins,
  Gift,
} from "lucide-react";

import {
  getReferralInfo,
  type ReferralInfo,
} from "../lib/api";


/*
|--------------------------------------------------------------------------
| COPY TEXT
|--------------------------------------------------------------------------
|
| navigator.clipboard is not always allowed inside Telegram's web view,
| so there is a fallback.
|
|--------------------------------------------------------------------------
*/

async function copyText(text: string): Promise<boolean> {

  try {

    if (navigator.clipboard?.writeText) {

      await navigator.clipboard.writeText(text);

      return true;

    }

  } catch {

    // Fall through to the fallback below.

  }

  try {

    const textarea =
      document.createElement("textarea");

    textarea.value = text;

    textarea.setAttribute("readonly", "");

    textarea.style.position = "fixed";

    textarea.style.opacity = "0";

    document.body.appendChild(textarea);

    textarea.select();

    const copied =
      document.execCommand("copy");

    document.body.removeChild(textarea);

    return copied;

  } catch {

    return false;

  }

}


/*
|--------------------------------------------------------------------------
| REFERRAL CARD
|--------------------------------------------------------------------------
*/

export default function ReferralCard() {

  const [
    info,
    setInfo,
  ] = useState<ReferralInfo | null>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    copied,
    setCopied,
  ] = useState(false);


  useEffect(() => {

    let cancelled = false;

    async function load() {

      try {

        const result =
          await getReferralInfo();

        if (!cancelled) {

          setInfo(result);

        }

      } catch (err) {

        console.error(
          "Could not load referral info:",
          err
        );

        if (!cancelled) {

          setError(
            err instanceof Error
              ? err.message
              : "Could not load your invite link"
          );

        }

      } finally {

        if (!cancelled) {

          setLoading(false);

        }

      }

    }

    load();

    return () => {

      cancelled = true;

    };

  }, []);


  async function handleCopy() {

    if (!info) {

      return;

    }

    const ok =
      await copyText(info.link);

    if (ok) {

      setCopied(true);

      window.setTimeout(() => {

        setCopied(false);

      }, 2000);

    } else {

      setError(
        "Could not copy automatically. Please copy the link manually."
      );

    }

  }


  function handleShare() {

    if (!info) {

      return;

    }

    const text =
      "Join me on CoinEarn and start earning coins! 🪙";

    const shareUrl =
      "https://t.me/share/url?url=" +
      encodeURIComponent(info.link) +
      "&text=" +
      encodeURIComponent(text);

    const webApp =
      (window as any).Telegram?.WebApp;

    if (webApp?.openTelegramLink) {

      webApp.openTelegramLink(shareUrl);

    } else {

      window.open(
        shareUrl,
        "_blank",
        "noopener,noreferrer"
      );

    }

  }


  return (

    <section className="referral-card">

      <style>{referralCss}</style>

      <div className="referral-top">

        <div className="referral-icon">

          <Users size={22} />

        </div>

        <div className="referral-heading">

          <strong>
            Invite & Earn
          </strong>

          <span>

            {info
              ? `Get ${info.referrerBonus.toLocaleString()} Coins for every friend who joins. They get ${info.referredBonus.toLocaleString()} Coins too.`
              : "Invite friends and grow your CoinEarn rewards."}

          </span>

        </div>

      </div>


      {loading ? (

        <div className="referral-skeleton" />

      ) : info ? (

        <>

          <div className="referral-link-box">

            <span className="referral-link-text">
              {info.link}
            </span>

          </div>


          <div className="referral-actions">

            <button
              type="button"
              className="referral-button referral-button-copy"
              onClick={handleCopy}
            >

              {copied ? (

                <>
                  <Check size={16} />
                  Copied
                </>

              ) : (

                <>
                  <Copy size={16} />
                  Copy link
                </>

              )}

            </button>

            <button
              type="button"
              className="referral-button referral-button-share"
              onClick={handleShare}
            >

              <Share2 size={16} />

              Share

            </button>

          </div>


          <div className="referral-stats">

            <div className="referral-stat">

              <Users size={16} />

              <div>

                <strong>
                  {info.invited.toLocaleString()}
                </strong>

                <span>
                  Friends invited
                </span>

              </div>

            </div>

            <div className="referral-stat">

              <Coins size={16} />

              <div>

                <strong>
                  +{info.totalEarned.toLocaleString()}
                </strong>

                <span>
                  Coins earned
                </span>

              </div>

            </div>

          </div>


          {info.friends.length > 0 && (

            <div className="referral-friends">

              <p>
                RECENT FRIENDS
              </p>

              {info.friends.map(
                (friend, index) => (

                  <div
                    key={`${friend.created_at}-${index}`}
                    className="referral-friend"
                  >

                    <div className="referral-friend-avatar">

                      {friend.name
                        .charAt(0)
                        .toUpperCase()}

                    </div>

                    <span className="referral-friend-name">
                      {friend.name}
                    </span>

                    <span className="referral-friend-bonus">

                      <Gift size={12} />

                      +{friend.bonus.toLocaleString()}

                    </span>

                  </div>

                )
              )}

            </div>

          )}

        </>

      ) : null}


      {error && (

        <div className="referral-error">
          {error}
        </div>

      )}

    </section>

  );

}


/*
|--------------------------------------------------------------------------
| STYLES
|--------------------------------------------------------------------------
*/

const referralCss = `

  .referral-card {
    margin: 0 0 16px;
    padding: 16px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.07);
    color: #ffffff;
  }


  .referral-top {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }


  .referral-icon {
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    border-radius: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(245, 184, 0, 0.12);
    color: #f5b800;
  }


  .referral-heading {
    min-width: 0;
  }


  .referral-heading strong {
    display: block;
    font-size: 15px;
    font-weight: 800;
  }


  .referral-heading span {
    display: block;
    margin-top: 3px;
    color: #9a9a9a;
    font-size: 11px;
    line-height: 1.5;
  }


  .referral-skeleton {
    height: 96px;
    margin-top: 14px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    animation: referralPulse 1.4s ease-in-out infinite;
  }


  @keyframes referralPulse {

    0%, 100% {
      opacity: 0.6;
    }

    50% {
      opacity: 1;
    }

  }


  .referral-link-box {
    margin-top: 14px;
    padding: 11px 12px;
    border-radius: 11px;
    background: rgba(0, 0, 0, 0.25);
    border: 1px dashed rgba(245, 184, 0, 0.35);
  }


  .referral-link-text {
    display: block;
    overflow: hidden;
    color: #f5b800;
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }


  .referral-actions {
    display: flex;
    gap: 8px;
    margin-top: 10px;
  }


  .referral-button {
    flex: 1;
    min-height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    border: none;
    border-radius: 11px;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
    transition: transform 0.2s ease;
  }


  .referral-button:hover {
    transform: translateY(-1px);
  }


  .referral-button-copy {
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
  }


  .referral-button-share {
    background: #f5b800;
    color: #111111;
  }


  .referral-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin-top: 12px;
  }


  .referral-stat {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 10px 11px;
    border-radius: 11px;
    background: rgba(255, 255, 255, 0.04);
    color: #f5b800;
  }


  .referral-stat strong {
    display: block;
    color: #ffffff;
    font-size: 14px;
    font-weight: 800;
  }


  .referral-stat span {
    display: block;
    margin-top: 1px;
    color: #8a8a8a;
    font-size: 9px;
  }


  .referral-friends {
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }


  .referral-friends p {
    margin: 0 0 8px;
    color: #777777;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 1px;
  }


  .referral-friend {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 6px 0;
  }


  .referral-friend-avatar {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(245, 184, 0, 0.14);
    color: #f5b800;
    font-size: 12px;
    font-weight: 800;
  }


  .referral-friend-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }


  .referral-friend-bonus {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #4ade80;
    font-size: 11px;
    font-weight: 800;
  }


  .referral-error {
    margin-top: 10px;
    padding: 9px 11px;
    border-radius: 9px;
    background: rgba(239, 68, 68, 0.1);
    color: #fca5a5;
    font-size: 11px;
  }

`;
