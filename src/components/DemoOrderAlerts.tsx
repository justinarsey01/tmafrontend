import { useEffect, useState } from "react";
import { BadgeCheck, ShoppingBag, X } from "lucide-react";
import "./DemoOrderAlerts.css";

type DemoOrder = {
  id: number;
  name: string;
  item: string;
  time: string;
};

/**
 * Demo-only activity notifications.
 * These are fictional examples and are not connected to real orders or payments.
 */
const DEMO_ORDERS: Omit<DemoOrder, "id">[] = [
  { name: "Ada from Lagos", item: "Telegram Channel Promotion", time: "just now" },
  { name: "Michael from Abuja", item: "Forex Signals Feature", time: "2 minutes ago" },
  { name: "Chioma from Port Harcourt", item: "Audience Growth Package", time: "3 minutes ago" },
  { name: "Daniel from Accra", item: "Channel Promotion", time: "5 minutes ago" },
  { name: "Samuel from Ibadan", item: "Social Engagement Package", time: "6 minutes ago" },
];

const ENABLE_DEMO_ORDER_ALERTS = true;
const FIRST_ALERT_DELAY_MS = 6500;
const MIN_NEXT_ALERT_DELAY_MS = 18000;
const MAX_NEXT_ALERT_DELAY_MS = 32000;
const VISIBLE_DURATION_MS = 6500;

export default function DemoOrderAlerts() {
  const [currentAlert, setCurrentAlert] = useState<DemoOrder | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [lastIndex, setLastIndex] = useState(-1);

  useEffect(() => {
    if (!ENABLE_DEMO_ORDER_ALERTS) return;

    let showTimer: ReturnType<typeof setTimeout> | undefined;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const scheduleNext = (delay: number) => {
      showTimer = setTimeout(() => {
        if (cancelled) return;

        let nextIndex = Math.floor(Math.random() * DEMO_ORDERS.length);
        if (DEMO_ORDERS.length > 1 && nextIndex === lastIndex) {
          nextIndex = (nextIndex + 1) % DEMO_ORDERS.length;
        }

        setLastIndex(nextIndex);
        setCurrentAlert({ id: Date.now(), ...DEMO_ORDERS[nextIndex] });
        setDismissed(false);

        hideTimer = setTimeout(() => {
          if (cancelled) return;
          setCurrentAlert(null);
          scheduleNext(
            MIN_NEXT_ALERT_DELAY_MS +
              Math.random() * (MAX_NEXT_ALERT_DELAY_MS - MIN_NEXT_ALERT_DELAY_MS)
          );
        }, VISIBLE_DURATION_MS);
      }, delay);
    };

    scheduleNext(FIRST_ALERT_DELAY_MS);

    return () => {
      cancelled = true;
      if (showTimer) clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
    // This effect manages one notification sequence for the app's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ENABLE_DEMO_ORDER_ALERTS || !currentAlert || dismissed) return null;

  return (
    <aside
      className="demo-order-alert"
      role="status"
      aria-live="polite"
      aria-label="Sample order activity notification"
    >
      <div className="demo-order-alert-icon" aria-hidden="true">
        <ShoppingBag size={20} />
      </div>

      <div className="demo-order-alert-copy">
        <div className="demo-order-alert-heading">
          <span>Sample activity</span>
          <span className="demo-order-alert-demo-tag">DEMO</span>
        </div>
        <p>
          <strong>{currentAlert.name}</strong> selected
        </p>
        <p className="demo-order-alert-item">{currentAlert.item}</p>
        <div className="demo-order-alert-meta">
          <BadgeCheck size={13} />
          <span>Example notification · {currentAlert.time}</span>
        </div>
      </div>

      <button
        type="button"
        className="demo-order-alert-close"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss sample activity notification"
      >
        <X size={16} />
      </button>
    </aside>
  );
}
