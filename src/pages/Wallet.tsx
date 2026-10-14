
import { useEffect, useState } from "react";
import {
  getCryptoWalletBalances,
  type CryptoWalletBalances,
} from "../lib/api";
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

  const [crypto, setCrypto] =
    useState<CryptoWalletBalances>({
      USDTBSC: 0,
      USDTTRC20: 0,
      BTC: 0,
    });
  const [cryptoLoading, setCryptoLoading] =
    useState(true);
  const [cryptoError, setCryptoError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCrypto() {
      try {
        const wallet =
          await getCryptoWalletBalances();
        if (!cancelled) setCrypto(wallet);
      } catch (err) {
        if (!cancelled) {
          setCryptoError(
            err instanceof Error
              ? err.message
              : "Could not load crypto balances."
          );
        }
      } finally {
        if (!cancelled) setCryptoLoading(false);
      }
    }

    void loadCrypto();

    return () => {
      cancelled = true;
    };
  }, []);

  const cryptoRows = [
    { label: "USDT (BSC / BEP20)", value: crypto.USDTBSC, digits: 4 },
    { label: "USDT (TRC20)", value: crypto.USDTTRC20, digits: 4 },
    { label: "Bitcoin (BTC)", value: crypto.BTC, digits: 8 },
  ];

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
          CRYPTO BALANCES
      ========================== */}
      <section className="wallet-crypto-card">
        <h3>Crypto Balances</h3>

        {cryptoLoading ? (
          <p>Loading crypto balances…</p>
        ) : cryptoError ? (
          <p className="wallet-crypto-error">
            {cryptoError}
          </p>
        ) : (
          cryptoRows.map((row) => (
            <div
              key={row.label}
              className="wallet-crypto-row"
            >
              <span>{row.label}</span>
              <strong>
                {row.value.toLocaleString(
                  undefined,
                  { maximumFractionDigits: row.digits }
                )}
              </strong>
            </div>
          ))
        )}
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
