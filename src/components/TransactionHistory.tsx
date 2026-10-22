import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  getTransactionHistory,
  type HistoryItem,
} from "../lib/api";

type Filter = "all" | "coins" | "crypto" | "deposits";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "coins", label: "Coins" },
  { id: "crypto", label: "Crypto" },
  { id: "deposits", label: "Deposits" },
];

function matchesFilter(item: HistoryItem, filter: Filter) {
  switch (filter) {
    case "coins":
      return item.kind === "coin_order";
    case "crypto":
      return (
        item.kind === "crypto_order" ||
        item.kind === "crypto_refund"
      );
    case "deposits":
      return item.kind === "crypto_deposit";
    default:
      return true;
  }
}

function isUnpaidDeposit(item: HistoryItem) {
  return (
    item.kind === "crypto_deposit" &&
    !item.credited &&
    (item.status === "pending" || item.status === "waiting")
  );
}

function statusLabel(item: HistoryItem) {
  if (item.kind === "crypto_refund") return "Refunded";

  if (item.kind === "crypto_deposit") {
    if (item.credited) return "Credited";

    switch (item.status) {
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
      case "refunded":
        return "Refunded";
      default:
        return item.status;
    }
  }

  return item.status.charAt(0).toUpperCase() + item.status.slice(1);
}

function formatAmount(item: HistoryItem) {
  if (item.amount == null) {
    return item.kind === "crypto_deposit"
      ? `$${(item.amountUsd ?? 0).toLocaleString()}`
      : "—";
  }

  const sign =
    item.kind === "crypto_deposit" || item.kind === "crypto_refund"
      ? "+"
      : "-";

  if (item.currency === "COINS") {
    return `${sign}${item.amount.toLocaleString()} Coins`;
  }

  const digits = item.currency === "BTC" ? 8 : 4;

  return `${sign}${item.amount.toLocaleString(undefined, {
    maximumFractionDigits: digits,
  })} ${item.currency}`;
}

function TransactionHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const load = useCallback(async () => {
    try {
      setError(null);
      setItems(await getTransactionHistory());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load your history."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void load();
      }
    };

    document.addEventListener("visibilitychange", onVisible);

    return () =>
      document.removeEventListener("visibilitychange", onVisible);
  }, [load]);

  const visible = items.filter(
    (item) => !isUnpaidDeposit(item) && matchesFilter(item, filter)
  );

  return (
    <section className="transactions history-card">
      <div className="transactions-header">
        <h3>History</h3>

        <button
          type="button"
          className="wallet-crypto-refresh"
          onClick={() => void load()}
          aria-label="Refresh history"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="history-filters">
        {FILTERS.map((option) => (
          <button
            type="button"
            key={option.id}
            className={`category-chip ${
              filter === option.id ? "active" : ""
            }`}
            onClick={() => setFilter(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="history-note">Loading history…</p>
      ) : error ? (
        <p className="wallet-crypto-error">{error}</p>
      ) : visible.length === 0 ? (
        <p className="history-note">
          Nothing here yet. Your orders and deposits will appear
          in this list.
        </p>
      ) : (
        <div className="history-list">
          {visible.map((item) => (
            <div className="history-item" key={item.id}>
              <div className="history-main">
                <strong>{item.title}</strong>
                <span>{item.subtitle}</span>
                <small>
                  {new Date(item.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </small>
              </div>

              <div className="history-side">
                <strong
                  className={
                    (item.kind === "crypto_deposit" && item.credited) ||
                    item.kind === "crypto_refund"
                      ? "in"
                      : ""
                  }
                >
                  {formatAmount(item)}
                </strong>

                {item.kind === "crypto_order" &&
                  item.amountUsd != null && (
                    <span>≈ ${item.amountUsd.toLocaleString()}</span>
                  )}

                <em className={`history-status ${item.status}`}>
                  {statusLabel(item)}
                </em>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default TransactionHistory;
