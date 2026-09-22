import {
  Wallet as WalletIcon,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";

export default function Wallet() {
  return (
    <div className="page">

      <div className="page-header">

        <div>
          <h1>Wallet</h1>

          <p>
            Manage your Coins and TON wallet.
          </p>
        </div>

        <WalletIcon size={28} />

      </div>

      <div className="wallet-balance">

        <span>Total Balance</span>

        <h2>0</h2>

        <p>COINS</p>

      </div>

      <div className="wallet-actions">

        <button>
          <ArrowDownToLine size={19} />
          Deposit
        </button>

        <button>
          <ArrowUpFromLine size={19} />
          Withdraw
        </button>

      </div>

      <div className="ton-card">

        <div className="ton-logo">
          💎
        </div>

        <div>
          <h3>TON Wallet</h3>

          <p>
            Connect your TON wallet
            for blockchain transactions.
          </p>
        </div>

        <button>
          Connect
        </button>

      </div>

      <div className="transactions">

        <h3>Recent Transactions</h3>

        <div className="empty-transaction">
          No transactions yet.
        </div>

      </div>

    </div>
  );
}