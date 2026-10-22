import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ShoppingBag,
} from "lucide-react";

import {
  createCopyOrder,
  getCryptoWalletBalances,
  type SmmService,
} from "../lib/api";

interface CopyOrderFormProps {
  service: SmmService;
  balance: number;
  setBalance: Dispatch<SetStateAction<number>>;
}

function CopyOrderForm({
  service,
  balance,
  setBalance,
}: CopyOrderFormProps) {
  const maxTargets = Math.max(1, service.maxTargets ?? 1);

  const [source, setSource] = useState("");
  const [count, setCount] = useState(1);
  const [targets, setTargets] = useState<string[]>(
    Array(maxTargets).fill("")
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "coins" | "crypto"
  >("coins");
  const [usdtBalance, setUsdtBalance] = useState(0);
  const [usdtLoading, setUsdtLoading] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load the USDT balance only when the user chooses to pay with USDT.
  useEffect(() => {
    if (paymentMethod !== "crypto") return;

    let cancelled = false;
    setUsdtLoading(true);

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
  }, [paymentMethod]);

  const coinPrice = service.tierPrices?.[count - 1] ?? 0;
  const usdPrice = service.tierPricesUsd?.[count - 1] ?? 0;
  const cryptoAvailable = usdPrice > 0;

  const remaining = balance - coinPrice;

  function updateTarget(index: number, value: string) {
    setTargets((current) =>
      current.map((item, i) => (i === index ? value : item))
    );
  }

  function formatPrice(index: number) {
    if (paymentMethod === "coins") {
      const price = service.tierPrices?.[index] ?? 0;
      return price > 0 ? `${price.toLocaleString()} Coins` : "—";
    }

    const price = service.tierPricesUsd?.[index] ?? 0;
    return price > 0 ? `${price} USDT` : "—";
  }

  async function handleOrder() {
    setError(null);
    setSuccess(null);

    if (!source.trim()) {
      setError("Enter the source channel link.");
      return;
    }

    const list = targets
      .slice(0, count)
      .map((item) => item.trim());

    const missing = list.findIndex((item) => !item);

    if (missing !== -1) {
      setError(`Enter target channel ${missing + 1}.`);
      return;
    }

    if (paymentMethod === "coins" && balance < coinPrice) {
      setError("You do not have enough Coins for this order.");
      return;
    }

    if (paymentMethod === "crypto") {
      if (!cryptoAvailable) {
        setError(
          "USDT is not available for this option. Please pay with Coins."
        );
        return;
      }

      if (usdtBalance < usdPrice) {
        setError(
          "You do not have enough USDT. Deposit from the Wallet page."
        );
        return;
      }
    }

    try {
      setOrdering(true);

      const order = await createCopyOrder({
        serviceId: service.id,
        source: source.trim(),
        targets: list,
        paymentMethod,
      });

      if (paymentMethod === "coins" && order.balance != null) {
        setBalance(order.balance);
      }

      if (paymentMethod === "crypto" && order.cryptoBalance != null) {
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
            {maxTargets === 1 ? "" : "s"}
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

      {/* Source */}
      <div className="form-group">
        <label>Source channel</label>

        <input
          type="text"
          value={source}
          onChange={(event) => setSource(event.target.value)}
          placeholder="https://t.me/channelname or @channelname"
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
                <span>{formatPrice(index)}</span>
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
      <div className="step-title step-title-inline">
        <span className="step-number">3</span>
        <h2>Payment</h2>
      </div>

      <div className="form-group">
        <div className="payment-method-options">
          <button
            type="button"
            className={`payment-method-option ${
              paymentMethod === "coins" ? "selected" : ""
            }`}
            onClick={() => {
              setPaymentMethod("coins");
              setError(null);
            }}
          >
            🪙 Pay with Coins
          </button>

          <button
            type="button"
            className={`payment-method-option ${
              paymentMethod === "crypto" ? "selected" : ""
            }`}
            onClick={() => {
              setPaymentMethod("crypto");
              setError(null);
            }}
          >
            💵 Pay with USDT
          </button>
        </div>

        {paymentMethod === "crypto" && (
          <>
            <div className="crypto-balance-panel">
              <span>
                {usdtLoading
                  ? "Loading wallet balance…"
                  : "USDT (BSC) available"}
              </span>
              <strong>
                {usdtBalance.toLocaleString(undefined, {
                  maximumFractionDigits: 4,
                })}
              </strong>
            </div>

            {!cryptoAvailable && (
              <small>
                USDT is not available for this option. Please pay
                with Coins.
              </small>
            )}
          </>
        )}
      </div>

      {/* Total */}
      <div className="order-summary">
        <div className="summary-row total">
          <span>Total</span>

          <strong>
            {paymentMethod === "coins"
              ? `${coinPrice.toLocaleString()} Coins`
              : cryptoAvailable
              ? `${usdPrice} USDT`
              : "—"}
          </strong>
        </div>

        {paymentMethod === "coins" && coinPrice > 0 && (
          <div
            className={`balance-after ${
              remaining >= 0 ? "positive" : "negative"
            }`}
          >
            <span>Balance after order</span>

            <strong>
              {remaining >= 0
                ? remaining.toLocaleString()
                : "Insufficient Coins"}
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
    </div>
  );
}

export default CopyOrderForm;
