
import { useCallback, useEffect, useState } from "react";
import TransactionHistory from "../components/TransactionHistory";
import {
  getCryptoWalletBalances,
  createCryptoDeposit,
} from "../lib/api";
import {
  Wallet as WalletIcon,
  ArrowDownToLine,
  ArrowUpFromLine,
  Coins,
  ShieldCheck,
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

  const [usdtBalance, setUsdtBalance] = useState(0);
  const [usdtError, setUsdtError] =
    useState<string | null>(null);
  const [showDeposit, setShowDeposit] =
    useState(false);
  const [depositAmount, setDepositAmount] =
    useState("");
  const [depositing, setDepositing] =
    useState(false);
  const [depositError, setDepositError] =
    useState<string | null>(null);

  const loadUsdt = useCallback(async () => {
    try {
      setUsdtError(null);
      const wallet =
        await getCryptoWalletBalances();
      setUsdtBalance(wallet.USDTBSC);
    } catch (err) {
      setUsdtError(
        err instanceof Error
          ? err.message
          : "Could not load your USDT balance."
      );
    }
  }, []);

  useEffect(() => {
    void loadUsdt();

    // Refresh when the user comes back from the payment page.
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void loadUsdt();
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
  }, [loadUsdt]);

  async function handleDeposit() {
    const amount = Number(depositAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setDepositError("Enter the amount in USDT.");
      return;
    }

    try {
      setDepositing(true);
      setDepositError(null);

      const { invoiceUrl } =
        await createCryptoDeposit(
          "USDT-BSC",
          amount
        );

      setDepositAmount("");
      setShowDeposit(false);
      openExternal(invoiceUrl);
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

  return (
    <main className="page">

      {/* =========================
          HEADER
      ========================== */}
      <div className="page-header">

        <div>
          <h1>Wallet</h1>

          <p>
            Manage your Coins and USDT wallet.
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

        <div className="wallet-usdt">

          <div className="wallet-usdt-row">

            <div>
              <span>USDT (BSC)</span>

              <strong>$
                {usdtBalance.toLocaleString(
                  undefined,
                  { maximumFractionDigits: 4 }
                )}
              </strong>
            </div>

            <button
              type="button"
              className="wallet-usdt-deposit"
              onClick={() => {
                setShowDeposit((open) => !open);
                setDepositError(null);
              }}
            >
              Deposit
            </button>

          </div>

          {usdtError && (
            <p className="wallet-crypto-error">
              {usdtError}
            </p>
          )}

          {showDeposit && (
            <div className="wallet-deposit">

              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={depositAmount}
                onChange={(event) =>
                  setDepositAmount(
                    event.target.value
                  )
                }
                placeholder="Amount in USDT, e.g. 10"
                disabled={depositing}
              />

              <button
                type="button"
                className="wallet-deposit-button"
                onClick={handleDeposit}
                disabled={
                  depositing || !depositAmount
                }
              >
                {depositing
                  ? "Creating payment…"
                  : "Continue to payment"}
              </button>

              {depositError && (
                <p className="wallet-crypto-error">
                  {depositError}
                </p>
              )}

              <small>
                You pay on a secure payment page. Your
                USDT balance is credited automatically
                after the network confirms the payment.
              </small>

            </div>
          )}

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

          Coin Deposit

          <span>Coming soon</span>
        </button>

        <button
          type="button"
          disabled
        >
          <ArrowUpFromLine size={19} />

         Coin Withdraw

          <span>Coming soon</span>
        </button>

      </div>

      {/* =========================
          TON WALLET
      ========================== */}
      {/* <section className="ton-card">

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
