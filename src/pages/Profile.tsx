
import {
  useState,
  type ReactNode,
} from "react";

import {
  UserRound,
  BadgeCheck,
  Copy,
  Check,
  Coins,
  TrendingUp,
  ShoppingBag,
  Users,
  Gift,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

interface ProfileUser {
  telegram_id?: string | number;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  photo_url?: string | null;
  referral_code?: string | null;
  total_earned?: number;
  total_spent?: number;
}

interface ProfileProps {
  user: ProfileUser | null;
}

export default function Profile({
  user,
}: ProfileProps) {
  const [copied, setCopied] =
    useState<string | null>(null);

  const fullName =
    [
      user?.first_name,
      user?.last_name,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Telegram User";

  const initials =
    (
      user?.first_name?.charAt(0) ||
      user?.username?.charAt(0) ||
      "U"
    ).toUpperCase();

  const totalEarned =
    Number(user?.total_earned ?? 0);

  const totalSpent =
    Number(user?.total_spent ?? 0);

  async function copyValue(
    value: string | number | null | undefined,
    type: string
  ) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        String(value)
      );

      setCopied(type);

      window.setTimeout(() => {
        setCopied(null);
      }, 1500);
    } catch (error) {
      console.error(
        "Could not copy:",
        error
      );
    }
  }

  return (
    <div className="page profile-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="page-header profile-page-header">

        <div>

          <p className="page-eyebrow">
            COINEARN ACCOUNT
          </p>

          <h1>
            Profile
          </h1>

          <p>
            Manage your CoinEarn account.
          </p>

        </div>

        <div className="profile-header-icon">
          <UserRound size={21} />
        </div>

      </div>


      {/* =========================================
          PROFILE HERO
      ========================================= */}

      <section className="profile-hero">

        <div className="profile-avatar-large">

          {user?.photo_url ? (
            <img
              src={user.photo_url}
              alt={fullName}
            />
          ) : (
            <span>
              {initials}
            </span>
          )}

        </div>


        <div className="profile-identity">

          <div className="profile-name-row">

            <h2>
              {fullName}
            </h2>

            <BadgeCheck
              size={18}
              className="verified-icon"
            />

          </div>

          {user?.username ? (
            <p>
              @{user.username}
            </p>
          ) : (
            <p>
              Telegram account
            </p>
          )}

          <div className="telegram-status">

            <span className="online-dot" />

            Connected to Telegram

          </div>

        </div>

      </section>


      {/* =========================================
          ACCOUNT STATS
      ========================================= */}

      <section className="profile-stats-grid">

        <StatCard
          icon={
            <TrendingUp size={19} />
          }
          label="Total Earned"
          value={totalEarned}
        />

        <StatCard
          icon={
            <ShoppingBag size={19} />
          }
          label="Total Spent"
          value={totalSpent}
        />

        <StatCard
          icon={
            <Users size={19} />
          }
          label="Referrals"
          value={0}
        />

      </section>


      {/* =========================================
          REFERRAL
      ========================================= */}

      <section className="profile-section">

        <div className="profile-section-heading">

          <div>

            <p>
              INVITE & EARN
            </p>

            <h3>
              Referral Program
            </h3>

          </div>

          <div className="profile-section-icon">
            <Gift size={18} />
          </div>

        </div>


        <div className="referral-card">

          <div className="referral-icon">
            <Users size={21} />
          </div>

          <div className="referral-content">

            <strong>
              Invite your friends
            </strong>

            <p>
              Share your referral code
              and earn Coins when friends
              join CoinEarn.
            </p>

          </div>

        </div>


        <div className="referral-code-box">

          <div>

            <span>
              Your referral code
            </span>

            <strong>
              {user?.referral_code ||
                "Not available"}
            </strong>

          </div>

          <button
            type="button"
            onClick={() =>
              copyValue(
                user?.referral_code,
                "referral"
              )
            }
            disabled={
              !user?.referral_code
            }
            aria-label="Copy referral code"
          >

            {copied === "referral" ? (
              <Check size={17} />
            ) : (
              <Copy size={17} />
            )}

          </button>

        </div>

      </section>


      {/* =========================================
          ACCOUNT INFORMATION
      ========================================= */}

      <section className="profile-section">

        <div className="profile-section-heading">

          <div>

            <p>
              ACCOUNT
            </p>

            <h3>
              Account Information
            </h3>

          </div>

        </div>


        <div className="profile-info-card">

          <ProfileRow
            label="Telegram ID"
            value={
              user?.telegram_id
                ? String(
                    user.telegram_id
                  )
                : "Not available"
            }
            icon={
              <UserRound size={17} />
            }
            copyable={
              Boolean(
                user?.telegram_id
              )
            }
            copied={
              copied ===
              "telegram"
            }
            onCopy={() =>
              copyValue(
                user?.telegram_id,
                "telegram"
              )
            }
          />


          <ProfileRow
            label="Username"
            value={
              user?.username
                ? `@${user.username}`
                : "Not available"
            }
            icon={
              <Users size={17} />
            }
          />


          <ProfileRow
            label="Account Status"
            value="Active"
            icon={
              <ShieldCheck
                size={17}
              />
            }
            status
          />

        </div>

      </section>


      {/* =========================================
          COIN ACTIVITY
      ========================================= */}

      <section className="profile-section">

        <div className="profile-section-heading">

          <div>

            <p>
              COINS
            </p>

            <h3>
              Coin Activity
            </h3>

          </div>

          <div className="profile-section-icon">
            <Coins size={18} />
          </div>

        </div>


        <div className="coin-activity-card">

          <ActivityRow
            icon={
              <TrendingUp size={18} />
            }
            label="Coins Earned"
            value={totalEarned}
            positive
          />

          <ActivityRow
            icon={
              <ShoppingBag size={18} />
            }
            label="Coins Spent"
            value={totalSpent}
          />

          <div className="coin-activity-divider" />

          <ActivityRow
            icon={
              <Coins size={18} />
            }
            label="Net Activity"
            value={
              totalEarned -
              totalSpent
            }
            highlight
          />

        </div>

      </section>


      {/* =========================================
          FOOTER
      ========================================= */}

      <div className="profile-security">

        <ShieldCheck size={16} />

        <span>
          Your Telegram identity is
          securely connected to CoinEarn.
        </span>

        <ChevronRight size={15} />

      </div>

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| Stat Card
|--------------------------------------------------------------------------
*/

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="profile-stat-card">

      <div className="profile-stat-icon">
        {icon}
      </div>

      <strong>
        {value.toLocaleString()}
      </strong>

      <span>
        {label}
      </span>

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| Profile Row
|--------------------------------------------------------------------------
*/

function ProfileRow({
  label,
  value,
  icon,
  copyable = false,
  copied = false,
  onCopy,
  status = false,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  copyable?: boolean;
  copied?: boolean;
  onCopy?: () => void;
  status?: boolean;
}) {
  return (
    <div className="profile-info-row">

      <div className="profile-info-left">

        <div className="profile-info-icon">
          {icon}
        </div>

        <div>
          <span>
            {label}
          </span>

          <strong>
            {value}
          </strong>
        </div>

      </div>


      {status && (
        <div className="profile-active-badge">
          <span />
          Active
        </div>
      )}


      {copyable && !status && (
        <button
          type="button"
          className="copy-button"
          onClick={onCopy}
          aria-label={`Copy ${label}`}
        >
          {copied ? (
            <Check size={16} />
          ) : (
            <Copy size={16} />
          )}
        </button>
      )}

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| Activity Row
|--------------------------------------------------------------------------
*/

function ActivityRow({
  icon,
  label,
  value,
  positive = false,
  highlight = false,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  positive?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`coin-activity-row ${
        highlight
          ? "highlight"
          : ""
      }`}
    >

      <div className="activity-left">

        <div className="activity-icon">
          {icon}
        </div>

        <span>
          {label}
        </span>

      </div>

      <strong
        className={
          positive
            ? "positive"
            : ""
        }
      >
        {value.toLocaleString()}
        {" "}
        <small>Coins</small>
      </strong>

    </div>
  );
}

