
import {
  Wallet as WalletIcon,
  ArrowDownToLine,
  ArrowUpFromLine,
  Coins,
  ShieldCheck,
} from "lucide-react";

type WalletProps = {
  balance: number;
};

export default function Wallet({
  balance,
}: WalletProps) {
  const totalBalance = Math.max(
    0,
    Math.floor(balance)
  );

  return (
    <main className="page">

      {/* =========================
          HEADER
      ========================== */}
      <div className="page-header">

        <div>
          <h1>Wallet</h1>

          <p>
            Manage your Coins and TON wallet.
          </p>
        </div>

        <div className="wallet-header-icon">
          <WalletIcon size={28} />
        </div>

      </div>

      {/* =========================
          TOTAL COIN BALANCE
      ========================== */}
      <section className="wallet-balance">

        <div className="wallet-balance-top">
          <span>Total Balance</span>

          <Coins size={24} />
        </div>

        <h2>
          {totalBalance.toLocaleString()}
        </h2>

        <p>COINS</p>

        <div className="wallet-balance-footer">
          <ShieldCheck size={14} />

          <span>
            Your balance is securely managed
          </span>
        </div>

      </section>

      {/* =========================
          WALLET ACTIONS
      ========================== */}
      <div className="wallet-actions">

        <button
          type="button"
          disabled
        >
          <ArrowDownToLine size={19} />

          Deposit

          <span>Coming soon</span>
        </button>

        <button
          type="button"
          disabled
        >
          <ArrowUpFromLine size={19} />

          Withdraw

          <span>Coming soon</span>
        </button>

      </div>

      {/* =========================
          TON WALLET
      ========================== */}
      <section className="ton-card">

        <div className="ton-logo">
          💎
        </div>

        <div className="ton-content">

          <h3>
            TON Wallet
          </h3>

          <p>
            Connect your TON wallet
            for blockchain transactions.
          </p>

        </div>

        <button
          type="button"
          className="ton-connect-button"
        >
          Connect
        </button>

      </section>

      {/* =========================
          TRANSACTIONS
      ========================== */}
      <section className="transactions">

        <div className="transactions-header">
          <h3>
            Recent Transactions
          </h3>

          <span>
            {totalBalance.toLocaleString()} Coins
          </span>
        </div>

        <div className="empty-transaction">

          <Coins size={22} />

          <p>
            No transactions yet.
          </p>

          <span>
            Your mining and wallet transactions
            will appear here.
          </span>

        </div>

      </section>

    </main>
  );
}
