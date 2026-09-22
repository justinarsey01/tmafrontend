import {
  User,
  Users,
  BarChart3,
  Settings,
  Copy,
} from "lucide-react";

export default function Profile() {
  return (
    <div className="page">

      <div className="profile-header">

        <div className="profile-avatar">
          <User size={35} />
        </div>

        <div>
          <h2>Telegram User</h2>
          <p>@username</p>
        </div>

      </div>

      <div className="profile-stats">

        <div>
          <strong>0</strong>
          <span>Earned</span>
        </div>

        <div>
          <strong>0</strong>
          <span>Spent</span>
        </div>

        <div>
          <strong>0</strong>
          <span>Referrals</span>
        </div>

      </div>

      <div className="referral-card">

        <div>
          <h3>Invite Friends</h3>

          <p>
            Invite friends and earn Coins
            when they join.
          </p>
        </div>

        <button>
          <Copy size={17} />
          Copy
        </button>

      </div>

      <div className="profile-option">
        <Users size={20} />
        <span>My Referrals</span>
      </div>

      <div className="profile-option">
        <BarChart3 size={20} />
        <span>Statistics</span>
      </div>

      <div className="profile-option">
        <Settings size={20} />
        <span>Settings</span>
      </div>

    </div>
  );
}