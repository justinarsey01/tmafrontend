
import { useCallback, useEffect, useState } from "react";
import TransactionHistory from "../components/TransactionHistory";
import {
  getCryptoWalletBalances,
  getCryptoDeposits,
  createCryptoDeposit,
  type CryptoAsset,
  type CryptoDeposit,
  type CryptoWalletBalances,
} from "../lib/api";
import {
  Wallet as WalletIcon,
  ArrowDownToLine,
  ArrowUpFromLine,
  Coins,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

function openExternal(url: string) {
  try {
    const webApp = (window as any).Telegram?.WebApp;
    if (webApp?.openLink) {
      webApp.openLink(url);
      return;
    }
  } catch {
    // fall through to window.open
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

function depositStatusLabel(deposit: CryptoDeposit) {
  if (deposit.credited) return "Credited";
  switch (deposit.status) {
    case "pending":
    case "waiting":
      return "Awaiting payment";
    case "confirming":
    case "confirmed":
    case "sending":
      return "Confirming";
    case "partially_paid":
      return "Partially paid";
    case "currency_mismatch":
      return "Needs review";
    case "expired":
      return "Expired";
    case "failed":
      return "Failed";
    case "refunded":
      return "Refunded";
    default:
      return deposit.status;
  }
}

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
  const [deposits, setDeposits] =
    useState<CryptoDeposit[]>([]);
  const [depositAsset, setDepositAsset] =
    useState<CryptoAsset>("USDT-BSC");
  const [depositAmount, setDepositAmount] =
    useState("");
  const [depositing, setDepositing] =
    useState(false);
  const [depositError, setDepositError] =
    useState<string | null>(null);

  const loadCrypto = useCallback(async () => {
    try {
      setCryptoError(null);
      const [wallet, list] = await Promise.all([
        getCryptoWalletBalances(),
        getCryptoDeposits().catch(() => []),
      ]);
      setCrypto(wallet);
      setDeposits(list);
    } catch (err) {
      setCryptoError(
        err instanceof Error
          ? err.message
          : "Could not load crypto balances."
      );
    } finally {
      setCryptoLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCrypto();

    // Refresh when the user comes back from the payment page.
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void loadCrypto();
      }
    };

    document.addEventListener(
      "visibilitychange",
      onVisible
    );

    return () =>
      document.removeEventListener(
        "visibilitychange",
        onVisible
      );
  }, [loadCrypto]);

  async function handleDeposit() {
    const amount = Number(depositAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setDepositError("Enter the amount in USD.");
      return;
    }

    try {
      setDepositing(true);
      setDepositError(null);

      const { invoiceUrl } =
        await createCryptoDeposit(
          depositAsset,
          amount
        );

      setDepositAmount("");
      openExternal(invoiceUrl);
      void loadCrypto();
    } catch (err) {
      setDepositError(
        err instanceof Error
          ? err.message
          : "Could not start the deposit."
      );
    } finally {
      setDepositing(false);
    }
  }

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
          CRYPTO BALANCES + DEPOSIT
      ========================== */}
      <section className="wallet-crypto-card">
        <div className="wallet-crypto-head">
          <h3>Crypto Balances</h3>

          <button
            type="button"
            className="wallet-crypto-refresh"
            onClick={() => void loadCrypto()}
            aria-label="Refresh crypto balances"
          >
            <RefreshCw size={14} />
          </button>
        </div>

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

        <div className="wallet-deposit">
          <h4>Deposit crypto</h4>

          <select
            value={depositAsset}
            onChange={(event) =>
              setDepositAsset(
                event.target.value as CryptoAsset
              )
            }
            disabled={depositing}
          >
            <option value="USDT-BSC">USDT (BSC / BEP20)</option>
            <option value="USDT-TRC20">USDT (TRC20)</option>
            <option value="BTC">Bitcoin (BTC)</option>
          </select>

          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={depositAmount}
            onChange={(event) =>
              setDepositAmount(event.target.value)
            }
            placeholder="Amount in USD, e.g. 10"
            disabled={depositing}
          />

          <button
            type="button"
            className="wallet-deposit-button"
            onClick={handleDeposit}
            disabled={depositing || !depositAmount}
          >
            {depositing
              ? "Creating payment…"
              : "Deposit"}
          </button>

          {depositError && (
            <p className="wallet-crypto-error">
              {depositError}
            </p>
          )}

          <small>
            Pay on the secure payment page. Your balance
            is credited automatically after the network
            confirms the payment.
          </small>
        </div>

        {deposits.length > 0 && (
          <div className="wallet-deposit-list">
            <h4>Recent deposits</h4>

            {deposits.map((deposit) => (
              <div
                key={deposit.orderId}
                className="wallet-deposit-item"
              >
                <span>
                  ${deposit.amountUsd.toLocaleString()}{" "}
                  · {deposit.asset}
                </span>
                <strong
                  className={
                    deposit.credited ? "ok" : ""
                  }
                >
                  {depositStatusLabel(deposit)}
                </strong>
              </div>
            ))}
          </div>
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
          HISTORY (coins, crypto, deposits)
      ========================== */}
      <TransactionHistory />

    </main>
  );
}
