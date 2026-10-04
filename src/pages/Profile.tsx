import {
  useState,
  type ReactNode,
} from "react";

import {
  UserRound,
  BadgeCheck,
  Copy,
  Check,
  TrendingUp,
  ShoppingBag,
  Users,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

import ReferralCard from "../components/ReferralCard";

interface ProfileUser {
  telegram_id?: string | number;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  photo_url?: string | null;
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

  /*
   * Number of friends invited. It is filled in by the
   * referral card below as soon as it has loaded.
   */
  const [invited, setInvited] =
    useState(0);

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
            ChannelFix ACCOUNT
          </p>

          <h1>
            Profile
          </h1>

          <p>
            Manage your ChannelFix account.
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

     {/* <section className="profile-stats-grid">

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
          value={invited}
        />

      </section>*/}


      {/* =========================================
          INVITE & EARN (real referral link)
      ========================================= */}

      <ReferralCard
        onLoaded={(info) =>
          setInvited(info.invited)
        }
      />


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
          FOOTER
      ========================================= */}

      <div className="profile-security">

        <ShieldCheck size={16} />

        <span>
          Your Telegram identity is
          securely connected to ChannelFix.
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
