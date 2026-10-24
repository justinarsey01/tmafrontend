import { useEffect, useState } from "react";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ShoppingBag,
} from "lucide-react";

import {
  createCopyOrder,
  formatUsd,
  getCryptoWalletBalances,
  type SmmService,
} from "../lib/api";

interface CopyOrderFormProps {
  service: SmmService;
}

/*
|--------------------------------------------------------------------------
| Channel copy order form
| Paid with USDT (BSC) only. The price depends on how many target channels
| the user selects, and each option has its own admin-set price.
|--------------------------------------------------------------------------
*/

function CopyOrderForm({ service }: CopyOrderFormProps) {
  const prices = service.tierPricesUsd ?? [];
  const maxTargets = Math.max(
    1,
    Math.min(service.maxTargets ?? prices.length, prices.length || 1)
  );

  const [source, setSource] = useState("");
  const [count, setCount] = useState(1);
  const [targets, setTargets] = useState<string[]>(
    Array(maxTargets).fill("")
  );
  const [usdtBalance, setUsdtBalance] = useState(0);
  const [usdtLoading, setUsdtLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getCryptoWalletBalances()
      .then((wallet) => {
        if (!cancelled) setUsdtBalance(wallet.USDTBSC);
      })
      .catch(() => {
        // keep the last known balance
      })
      .finally(() => {
        if (!cancelled) setUsdtLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const price = prices[count - 1] ?? 0;
  const available = prices.length > 0 && price > 0;
  const remaining = usdtBalance - price;

  function updateTarget(index: number, value: string) {
    setTargets((current) =>
      current.map((item, i) => (i === index ? value : item))
    );
  }

  async function handleOrder() {
    setError(null);
    setSuccess(null);

    if (!available) {
      setError("This service is not available yet.");
      return;
    }

    if (!source.trim()) {
      setError("Enter the source channel link.");
      return;
    }

    const list = targets.slice(0, count).map((item) => item.trim());
    const missing = list.findIndex((item) => !item);

    if (missing !== -1) {
      setError(`Enter target channel ${missing + 1}.`);
      return;
    }

    if (usdtBalance < price) {
      setError(
        "You do not have enough USDT. Deposit from the Wallet page."
      );
      return;
    }

    try {
      setOrdering(true);

      const order = await createCopyOrder({
        serviceId: service.id,
        source: source.trim(),
        targets: list,
      });

      if (order.cryptoBalance != null) {
        setUsdtBalance(order.cryptoBalance);
      }

      setSuccess(`Order #${order.orderNumber} created successfully.`);
      setSource("");
      setTargets(Array(maxTargets).fill(""));
      setCount(1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create order"
      );
    } finally {
      setOrdering(false);
    }
  }

  const canSubmit =
    available &&
    !ordering &&
    source.trim() !== "" &&
    targets.slice(0, count).every((item) => item.trim() !== "");

  return (
    <div className="order-form copy-form">
      {/* Service + full description */}
      <div className="selected-service">
        <div className="selected-service-icon">📡</div>

        <div className="selected-service-details">
          <strong>{service.name}</strong>
          <span>
            Up to {maxTargets} target channel
            {maxTargets === 1 ? "" : "s"} · Pay with USDT
          </span>
        </div>

        <CheckCircle2 size={19} className="selected-check" />
      </div>

      {service.description && (
        <div className="service-description">
          <label>About this service</label>
          <p>{service.description}</p>
        </div>
      )}

      {!available ? (
        <div className="market-message error">
          <AlertCircle size={19} />
          <span>This service is not available yet.</span>
        </div>
      ) : (
        <>
          {/* Source */}
          <div className="form-group">
            <label>Source channel link</label>

            <input
              type="text"
              value={source}
              onChange={(event) => setSource(event.target.value)}
              placeholder="https://t.me/sourcechannel or @sourcechannel"
              maxLength={300}
            />

            <small>The channel we copy posts from.</small>
          </div>

          {/* Number of targets */}
          <div className="form-group">
            <label>How many target channels?</label>

            <div className="copy-count-grid">
              {Array.from({ length: maxTargets }, (_, index) => {
                const number = index + 1;
                const tierPrice = prices[index] ?? 0;

                return (
                  <button
                    type="button"
                    key={number}
                    className={`copy-count-chip ${
                      count === number ? "selected" : ""
                    }`}
                    onClick={() => {
                      setCount(number);
                      setError(null);
                    }}
                  >
                    <strong>
                      {number} channel{number === 1 ? "" : "s"}
                    </strong>
                    <span>
                      {tierPrice > 0 ? `${tierPrice} USDT` : "—"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target links */}
          <div className="form-group">
            <label>Target channel links</label>

            {Array.from({ length: count }, (_, index) => (
              <input
                key={index}
                type="text"
                className="copy-target-input"
                value={targets[index] ?? ""}
                onChange={(event) =>
                  updateTarget(index, event.target.value)
                }
                placeholder={`Target channel ${index + 1} link`}
                maxLength={300}
              />
            ))}

            <small>
              Posts from the source channel are copied to these
              channels.
            </small>
          </div>

          {/* Payment */}
          <div className="crypto-balance-panel">
            <span>
              {usdtLoading
                ? "Loading wallet balance…"
                : "USDT (BSC) available"}
            </span>

            <strong>
              {formatUsd(usdtBalance)}
            </strong>
          </div>

          {/* Total */}
          <div className="order-summary">
            <div className="summary-row total">
              <span>Total</span>
              <strong>{price} USDT</strong>
            </div>

            {price > 0 && (
              <div
                className={`balance-after ${
                  remaining >= 0 ? "positive" : "negative"
                }`}
              >
                <span>Balance after order</span>

                <strong>
                  {remaining >= 0
                    ? formatUsd(remaining)
                    : "Insufficient USDT. Deposit from Wallet."}
                </strong>
              </div>
            )}
          </div>

          {error && (
            <div className="market-message error">
              <AlertCircle size={19} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="market-message success">
              <CheckCircle2 size={19} />
              <span>{success}</span>
            </div>
          )}

          <button
            type="button"
            className="place-order-button"
            onClick={handleOrder}
            disabled={!canSubmit}
          >
            {ordering ? (
              <>
                <Loader2 size={19} className="spin" />
                Creating Order...
              </>
            ) : (
              <>
                <ShoppingBag size={19} />
                Place Order
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}

export default CopyOrderForm;
