import { useEffect, useRef, useState } from "react";
import { ShoppingBag, X } from "lucide-react";

import {
  getRecentOrders,
  type RecentOrder,
} from "../lib/api";

/*
|--------------------------------------------------------------------------
| "Live orders" popup
| Shows REAL recent orders, one at a time, with no names or targets.
| Nothing is invented: if there are no recent orders, nothing is shown.
|--------------------------------------------------------------------------
*/

const FIRST_DELAY = 6000;
const VISIBLE_FOR = 5500;
const GAP_BETWEEN = 14000;
const REFRESH_EVERY = 120000;

function timeAgo(iso: string) {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  );

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function LiveOrderToast() {
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [current, setCurrent] = useState<RecentOrder | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const indexRef = useRef(0);

  // Load the real recent orders, and refresh them now and then.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const list = await getRecentOrders();
        if (!cancelled) setOrders(list);
      } catch {
        // The popup is optional: stay quiet if it can't load.
      }
    }

    void load();
    const timer = window.setInterval(load, REFRESH_EVERY);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  // Show one order at a time.
  useEffect(() => {
    if (dismissed || orders.length === 0) {
      setCurrent(null);
      return;
    }

    let showTimer: number;
    let hideTimer: number;

    function showNext() {
      const order = orders[indexRef.current % orders.length];
      indexRef.current += 1;

      setCurrent(order);

      hideTimer = window.setTimeout(() => {
        setCurrent(null);
        showTimer = window.setTimeout(showNext, GAP_BETWEEN);
      }, VISIBLE_FOR);
    }

    showTimer = window.setTimeout(showNext, FIRST_DELAY);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [orders, dismissed]);

  if (!current) return null;

  return (
    <div className="live-toast" role="status">
      <div className="live-toast-icon">
        <ShoppingBag size={16} />
      </div>

      <div className="live-toast-text">
        <strong>
          {current.quantity
            ? `${current.quantity.toLocaleString()} × `
            : ""}
          {current.service}
        </strong>

        <span>
          A user ordered · {timeAgo(current.createdAt)}
        </span>
      </div>

      <button
        type="button"
        className="live-toast-close"
        onClick={() => setDismissed(true)}
        aria-label="Hide live orders"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default LiveOrderToast;
