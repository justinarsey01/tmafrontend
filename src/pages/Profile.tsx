
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

export default function Profile({ user }: ProfileProps) {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Profile</h1>
        <p>Your CoinEarn account</p>
      </div>

      <div className="card">
        <div className="profile-avatar">
          {user?.photo_url ? (
            <img
              src={user.photo_url}
              alt={user.first_name || "Telegram user"}
            />
          ) : (
            <span>
              {(user?.first_name?.charAt(0) || "U").toUpperCase()}
            </span>
          )}
        </div>

        <h2>
          {user?.first_name || "Telegram User"}{" "}
          {user?.last_name || ""}
        </h2>

        {user?.username && <p>@{user.username}</p>}
      </div>

      <div className="card">
        <h3>Account</h3>

        <div className="profile-row">
          <span>Telegram ID</span>
          <strong>{user?.telegram_id || "Not available"}</strong>
        </div>

        <div className="profile-row">
          <span>Referral Code</span>
          <strong>{user?.referral_code || "Not available"}</strong>
        </div>

        <div className="profile-row">
          <span>Total Earned</span>
          <strong>{user?.total_earned ?? 0} Coins</strong>
        </div>

        <div className="profile-row">
          <span>Total Spent</span>
          <strong>{user?.total_spent ?? 0} Coins</strong>
        </div>
      </div>
    </div>
  );
}
