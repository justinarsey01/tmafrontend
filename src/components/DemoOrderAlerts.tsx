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
  { name: "Jacob", item: "Telegram Channel Auto Post", time: "4 minutes ago" },
  { name: "user26593", item: "Telegram Group Members", time: "18 minutes ago" },
  { name: "Philip", item: "Telegram Post Views", time: "22 minutes ago" },
  { name: "wizzy", item: "Telegram Post Views", time: "22 minutes ago" },
  { name: "user46863", item: "Telegram Channel Boost", time: "2 minutes ago" },
  { name: "Ahmed", item: "Telegram Channel Boost", time: "18 minutes ago" },
  { name: "Clipaty", item: "Telegram Post Views", time: "just now" },
  { name: "Lucy", item: "Telegram Group Members", time: "just now" },
  { name: "Emeka", item: "Telegram Channel Boost", time: "2 minutes ago" },
  { name: "young-money", item: "Audience Growth Package", time: "3 minutes ago" },
  { name: "Blessing", item: "Telegram Channel Boost", time: "6 minutes ago" },
  { name: "Citiman", item: "Audience Growth Package", time: "8 minutes ago" },
  { name: "user43284", item: "Telegram Premium Members", time: "25 minutes ago" },
  { name: "Amara", item: "Telegram Premium Members", time: "5 minutes ago" },
  { name: "user75002", item: "Telegram Channel Auto Post", time: "5 minutes ago" },
  { name: "pucy33", item: "Telegram Post Views", time: "6 minutes ago" },
  { name: "Michael", item: "Telegram Post Views", time: "6 minutes ago" },
  { name: "mame", item: "Telegram Premium Members", time: "7 minutes ago" },
  { name: "Stephanie", item: "Telegram Group Members", time: "9 minutes ago" },
  { name: "Idris45", item: "Audience Growth Package", time: "7 minutes ago" },
  { name: "Patience", item: "Telegram Reactions", time: "18 minutes ago" },
  { name: "Ben", item: "Audience Growth Package", time: "9 minutes ago" },
  { name: "user92171", item: "Audience Growth Package", time: "6 minutes ago" },
  { name: "Paul", item: "Telegram Post Views", time: "4 minutes ago" },
  { name: "user89977", item: "Telegram Channel Boost", time: "28 minutes ago" },
  { name: "2pac", item: "Telegram Group Members", time: "22 minutes ago" },
  { name: "John", item: "Telegram Group Members", time: "22 minutes ago" },
  { name: "Femi", item: "Telegram Channel Boost", time: "12 minutes ago" },
  { name: "user60610", item: "Telegram Channel Auto Post", time: "just now" },
  { name: "user48192", item: "Audience Growth Package", time: "22 minutes ago" },
  { name: "user88149", item: "Telegram Channel Auto Post", time: "9 minutes ago" },
  { name: "Caleb", item: "Telegram Channel Auto Post", time: "2 minutes ago" },
  { name: "Philip", item: "Telegram Premium Members", time: "28 minutes ago" },
  { name: "Ibrahim82", item: "Telegram Channel Boost", time: "5 minutes ago" },
  { name: "user36386", item: "Audience Growth Package", time: "3 minutes ago" },
  { name: "Sani", item: "Telegram Group Members", time: "7 minutes ago" },
  { name: "Patience", item: "Telegram Group Members", time: "28 minutes ago" },
  { name: "Joy", item: "Telegram Premium Members", time: "1 minute ago" },
  { name: "user23706", item: "Telegram Channel Auto Post", time: "7 minutes ago" },
  { name: "Peace", item: "Telegram Post Views", time: "4 minutes ago" },
  { name: "Lucy", item: "Telegram Group Members", time: "3 minutes ago" },
  { name: "Uche74", item: "Telegram Channel Auto Post", time: "28 minutes ago" },
  { name: "user44102", item: "Telegram Post Views", time: "12 minutes ago" },
  { name: "user92558", item: "Telegram Channel Auto Post", time: "22 minutes ago" },
  { name: "user95190", item: "Telegram Post Views", time: "22 minutes ago" },
  { name: "Jane", item: "Audience Growth Package", time: "just now" },
  { name: "Omar", item: "Telegram Channel Auto Post", time: "just now" },
  { name: "Mohammed", item: "Telegram Post Views", time: "25 minutes ago" },
  { name: "Jennifer", item: "Telegram Post Views", time: "15 minutes ago" },
  { name: "user95126", item: "Telegram Channel Boost", time: "25 minutes ago" },
  { name: "Jane21", item: "Telegram Channel Auto Post", time: "18 minutes ago" },
  { name: "user70713", item: "Telegram Channel Boost", time: "25 minutes ago" },
  { name: "Amara74", item: "Telegram Premium Members", time: "6 minutes ago" },
  { name: "Philip", item: "Telegram Premium Members", time: "7 minutes ago" },
  { name: "Hamza", item: "Telegram Channel Boost", time: "15 minutes ago" },
  { name: "Nasir", item: "Telegram Channel Boost", time: "8 minutes ago" },
  { name: "user81324", item: "Telegram Channel Auto Post", time: "28 minutes ago" },
  { name: "Linda", item: "Telegram Channel Boost", time: "28 minutes ago" },
  { name: "Sadiq", item: "Audience Growth Package", time: "6 minutes ago" },
  { name: "Clara", item: "Audience Growth Package", time: "3 minutes ago" },
  { name: "user72492", item: "Telegram Channel Auto Post", time: "2 minutes ago" },
  { name: "Sarah", item: "Telegram Group Members", time: "3 minutes ago" },
  { name: "Stephanie", item: "Audience Growth Package", time: "just now" },
  { name: "Peter", item: "Telegram Channel Boost", time: "28 minutes ago" },
  { name: "Samuel", item: "Audience Growth Package", time: "12 minutes ago" },
  { name: "Abdul", item: "Telegram Premium Members", time: "5 minutes ago" },
  { name: "user39202", item: "Telegram Premium Members", time: "22 minutes ago" },
  { name: "Felix", item: "Telegram Premium Members", time: "just now" },
  { name: "Jennifer", item: "Telegram Reactions", time: "8 minutes ago" },
  { name: "user95737", item: "Telegram Channel Boost", time: "3 minutes ago" },
  { name: "Linda", item: "Telegram Group Members", time: "just now" },
  { name: "Okon", item: "Telegram Post Views", time: "12 minutes ago" },
  { name: "Emeka", item: "Telegram Channel Auto Post", time: "15 minutes ago" },
  { name: "Angela", item: "Telegram Post Views", time: "28 minutes ago" },
  { name: "user74570", item: "Telegram Channel Auto Post", time: "9 minutes ago" },
  { name: "Grace", item: "Telegram Post Views", time: "1 minute ago" },
  { name: "Abasi", item: "Telegram Group Members", time: "25 minutes ago" },
  { name: "Linda", item: "Telegram Premium Members", time: "8 minutes ago" },
  { name: "Halima", item: "Telegram Channel Boost", time: "3 minutes ago" },
  { name: "Princess", item: "Telegram Post Views", time: "3 minutes ago" },
  { name: "user18571", item: "Audience Growth Package", time: "9 minutes ago" },
  { name: "user23387", item: "Audience Growth Package", time: "5 minutes ago" },
  { name: "Joseph", item: "Telegram Reactions", time: "7 minutes ago" },
  { name: "user94986", item: "Telegram Reactions", time: "1 minute ago" },
  { name: "Emmanuel", item: "Telegram Channel Auto Post", time: "6 minutes ago" },
  { name: "user34678", item: "Telegram Channel Auto Post", time: "18 minutes ago" },
  { name: "Ibrahim", item: "Telegram Reactions", time: "6 minutes ago" },
  { name: "user10718", item: "Telegram Group Members", time: "1 minute ago" },
  { name: "user62296", item: "Telegram Post Views", time: "1 minute ago" },
  { name: "Emeka", item: "Telegram Premium Members", time: "7 minutes ago" },
  { name: "Joy", item: "Telegram Premium Members", time: "1 minute ago" },
  { name: "Hauwa", item: "Telegram Channel Boost", time: "25 minutes ago" },
  { name: "Abdul", item: "Audience Growth Package", time: "7 minutes ago" },
  { name: "Caleb", item: "Audience Growth Package", time: "5 minutes ago" },
  { name: "James", item: "Telegram Group Members", time: "2 minutes ago" },
  { name: "Grace", item: "Telegram Reactions", time: "25 minutes ago" },
  { name: "Ali", item: "Telegram Group Members", time: "28 minutes ago" },
  { name: "Ada", item: "Telegram Channel Boost", time: "12 minutes ago" },
  { name: "Chioma56", item: "Telegram Channel Boost", time: "1 minute ago" },
  { name: "Daniel", item: "Telegram Reactions", time: "28 minutes ago" },
  { name: "Michael", item: "Telegram Reactions", time: "5 minutes ago" },
  { name: "Clara", item: "Telegram Channel Auto Post", time: "9 minutes ago" },
  { name: "Hauwa", item: "Telegram Reactions", time: "8 minutes ago" },
  { name: "Peter", item: "Telegram Channel Boost", time: "3 minutes ago" },
  { name: "Zainab", item: "Telegram Channel Auto Post", time: "1 minute ago" },
  { name: "user97268", item: "Telegram Post Views", time: "28 minutes ago" },
  { name: "user40273", item: "Telegram Channel Boost", time: "just now" },
  { name: "Patience", item: "Telegram Post Views", time: "5 minutes ago" },
  { name: "Jane54", item: "Telegram Channel Boost", time: "8 minutes ago" },
  { name: "user54128", item: "Telegram Channel Auto Post", time: "25 minutes ago" },
  { name: "Chinedu", item: "Telegram Group Members", time: "1 minute ago" },
  { name: "Emeka", item: "Telegram Group Members", time: "1 minute ago" },
  { name: "Yusuf", item: "Telegram Premium Members", time: "25 minutes ago" },
  { name: "youngmoney", item: "Telegram Post Views", time: "2 minutes ago" },
  { name: "Lucy", item: "Telegram Post Views", time: "just now" },
  { name: "user90974", item: "Telegram Post Views", time: "22 minutes ago" },
  { name: "Uche", item: "Telegram Premium Members", time: "2 minutes ago" },
  { name: "Mark33", item: "Telegram Channel Auto Post", time: "4 minutes ago" },
  { name: "user40644", item: "Audience Growth Package", time: "25 minutes ago" },
  { name: "Uche", item: "Telegram Post Views", time: "just now" },
  { name: "Miriam", item: "Telegram Channel Boost", time: "7 minutes ago" },
  { name: "Fatima", item: "Telegram Channel Boost", time: "15 minutes ago" },
  { name: "Sani", item: "Telegram Premium Members", time: "6 minutes ago" },
  { name: "Brian", item: "Telegram Channel Boost", time: "18 minutes ago" },
  { name: "Peace", item: "Telegram Post Views", time: "15 minutes ago" },
  { name: "Linda55", item: "Telegram Group Members", time: "15 minutes ago" },
  { name: "Mohammed", item: "Telegram Channel Auto Post", time: "18 minutes ago" },
  { name: "Sharon", item: "Audience Growth Package", time: "5 minutes ago" },
  { name: "Michael", item: "Telegram Group Members", time: "8 minutes ago" },
  { name: "user43180", item: "Telegram Channel Auto Post", time: "6 minutes ago" },
  { name: "Sarah", item: "Telegram Reactions", time: "5 minutes ago" },
  { name: "Brian", item: "Telegram Post Views", time: "6 minutes ago" },
  { name: "Miriam73", item: "Telegram Channel Auto Post", time: "2 minutes ago" },
  { name: "Joseph", item: "Telegram Reactions", time: "3 minutes ago" },
  { name: "Halima", item: "Telegram Channel Auto Post", time: "15 minutes ago" },
  { name: "Clara", item: "Telegram Channel Boost", time: "7 minutes ago" },
  { name: "Omar", item: "Telegram Channel Auto Post", time: "just now" },
  { name: "user78114", item: "Telegram Channel Boost", time: "3 minutes ago" },
  { name: "Femi", item: "Telegram Premium Members", time: "28 minutes ago" },
  { name: "Ibrahim", item: "Telegram Channel Auto Post", time: "25 minutes ago" },
  { name: "user69751", item: "Audience Growth Package", time: "8 minutes ago" },
  { name: "user66245", item: "Telegram Group Members", time: "25 minutes ago" },
  { name: "Jennifer", item: "Telegram Channel Boost", time: "25 minutes ago" },
  { name: "Yusuf", item: "Telegram Channel Auto Post", time: "just now" },
  { name: "Chiamaka", item: "Telegram Group Members", time: "5 minutes ago" },
  { name: "Joseph", item: "Audience Growth Package", time: "8 minutes ago" },
  { name: "Kofi", item: "Telegram Reactions", time: "6 minutes ago" },
  { name: "Princess", item: "Telegram Group Members", time: "8 minutes ago" },
  { name: "Khadija", item: "Telegram Post Views", time: "7 minutes ago" },
  { name: "Sadiq", item: "Telegram Channel Auto Post", time: "1 minute ago" },

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
       {/* <div className="demo-order-alert-heading">
          <span>Sample activity</span>
          <span className="demo-order-alert-demo-tag">DEMO</span>
        </div>*/}
        <p>
          <strong>{currentAlert.name}</strong> ordered
        </p>
        <p className="demo-order-alert-item">{currentAlert.item}</p>
       <div className="demo-order-alert-meta">
          <BadgeCheck size={13} /> 
          <span>... · {currentAlert.time}</span>
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
