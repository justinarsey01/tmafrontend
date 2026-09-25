
import { useEffect, useRef, useState } from "react";
import {
  Coins,
  Gift,
  Users,
  Zap,
  Sparkles,
  TrendingUp,
  Clock3,
  ShieldCheck,
} from "lucide-react";

import { mineCoin } from "../lib/api";

type HomeProps = {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
};

type TapEffect = {
  id: number;
  text: string;
};

const MAX_ENERGY = 1000;

// Full energy recovery time: 6 hours
const REFILL_TIME = 6 * 60 * 60 * 1000;

// One energy every 21.6 seconds
const ENERGY_INTERVAL = REFILL_TIME / MAX_ENERGY;

const ENERGY_STORAGE_KEY = "coinEarnEnergy";
const ENERGY_TIME_STORAGE_KEY = "coinEarnEnergyTime";

export default function Home({
  balance,
  setBalance,
}: HomeProps) {
  const [energy, setEnergy] = useState(MAX_ENERGY);
  const [lastEnergyUpdate, setLastEnergyUpdate] = useState(
    Date.now()
  );

  const [tapEffects, setTapEffects] = useState<TapEffect[]>([]);
  const [isTapping, setIsTapping] = useState(false);

  const [mining, setMining] = useState(false);
  const [miningError, setMiningError] = useState("");

  const [tapCount, setTapCount] = useState(0);

  /*
   * IMPORTANT:
   *
   * The frontend is optimistic for the visual experience,
   * but the backend remains authoritative.
   *
   * Rapid taps are placed into a queue and processed one
   * at a time. This prevents multiple simultaneous requests
   * from causing inconsistent balances.
   */

  const pendingTapsRef = useRef(0);
  const processingQueueRef = useRef(false);

  // Authoritative values returned by the backend.
  const serverEnergyRef = useRef(MAX_ENERGY);
  const serverBalanceRef = useRef(balance);

  // Keeps energy immediately responsive even before React
  // finishes updating state.
  const displayedEnergyRef = useRef(MAX_ENERGY);

  const tapEffectIdRef = useRef(0);
  const tapAnimationTimeoutRef = useRef<number | null>(null);

  /*
   * Keep our balance reference synchronized when another part
   * of the application updates the balance.
   */
  useEffect(() => {
    if (
      !processingQueueRef.current &&
      pendingTapsRef.current === 0
    ) {
      serverBalanceRef.current = balance;
    }
  }, [balance]);

  /*
   * Restore saved local energy when the page loads.
   *
   * This is only for UI continuity.
   * The backend remains authoritative for actual mining.
   */
  useEffect(() => {
    try {
      const savedEnergy = localStorage.getItem(
        ENERGY_STORAGE_KEY
      );

      const savedTime = localStorage.getItem(
        ENERGY_TIME_STORAGE_KEY
      );

      if (!savedEnergy || !savedTime) {
        displayedEnergyRef.current = MAX_ENERGY;
        serverEnergyRef.current = MAX_ENERGY;

        setEnergy(MAX_ENERGY);
        setLastEnergyUpdate(Date.now());

        return;
      }

      const storedEnergy = Math.max(
        0,
        Math.min(MAX_ENERGY, Number(savedEnergy))
      );

      const storedTime = Number(savedTime);

      if (!Number.isFinite(storedTime)) {
        displayedEnergyRef.current = storedEnergy;
        serverEnergyRef.current = storedEnergy;

        setEnergy(storedEnergy);
        setLastEnergyUpdate(Date.now());

        return;
      }

      const elapsed = Math.max(
        0,
        Date.now() - storedTime
      );

      const regenerated = Math.floor(
        elapsed / ENERGY_INTERVAL
      );

      const restoredEnergy = Math.min(
        MAX_ENERGY,
        storedEnergy + regenerated
      );

      displayedEnergyRef.current = restoredEnergy;
      serverEnergyRef.current = restoredEnergy;

      setEnergy(restoredEnergy);

      const consumedIntervals =
        regenerated * ENERGY_INTERVAL;

      const calculatedLastUpdate =
        restoredEnergy >= MAX_ENERGY
          ? Date.now()
          : storedTime + consumedIntervals;

      setLastEnergyUpdate(calculatedLastUpdate);
    } catch (error) {
      console.error(
        "Could not restore energy:",
        error
      );
    }
  }, []);

  /*
   * Persist displayed energy locally.
   *
   * Again, this does NOT replace backend validation.
   */
  useEffect(() => {
    try {
      localStorage.setItem(
        ENERGY_STORAGE_KEY,
        String(energy)
      );

      localStorage.setItem(
        ENERGY_TIME_STORAGE_KEY,
        String(lastEnergyUpdate)
      );
    } catch (error) {
      console.error(
        "Could not save energy:",
        error
      );
    }
  }, [energy, lastEnergyUpdate]);

  /*
   * Energy regeneration.
   */
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (
        pendingTapsRef.current > 0 ||
        processingQueueRef.current
      ) {
        return;
      }

      const now = Date.now();

      const elapsed = Math.max(
        0,
        now - lastEnergyUpdate
      );

      const regenerated = Math.floor(
        elapsed / ENERGY_INTERVAL
      );

      if (regenerated <= 0) {
        return;
      }

      setEnergy((currentEnergy) => {
        const nextEnergy = Math.min(
          MAX_ENERGY,
          currentEnergy + regenerated
        );

        displayedEnergyRef.current = nextEnergy;

        serverEnergyRef.current = Math.max(
          serverEnergyRef.current,
          nextEnergy
        );

        return nextEnergy;
      });

      setLastEnergyUpdate((previousTime) => {
        if (
          displayedEnergyRef.current >=
          MAX_ENERGY
        ) {
          return now;
        }

        return (
          previousTime +
          regenerated * ENERGY_INTERVAL
        );
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [lastEnergyUpdate]);

  /*
   * Add the floating +1 animation immediately.
   */
  const addTapEffect = () => {
    const id = ++tapEffectIdRef.current;

    setTapEffects((current) => [
      ...current,
      {
        id,
        text: "+1",
      },
    ]);

    window.setTimeout(() => {
      setTapEffects((current) =>
        current.filter((effect) => effect.id !== id)
      );
    }, 800);
  };

  /*
   * Update the visible energy based on:
   *
   * backend-authoritative energy
   * minus taps waiting in the queue.
   *
   * This is important when the user taps 10 times very quickly.
   */
  const updateDisplayedEnergy = (
    authoritativeEnergy: number
  ) => {
    const pending = pendingTapsRef.current;

    const nextEnergy = Math.max(
      0,
      Math.min(
        MAX_ENERGY,
        authoritativeEnergy - pending
      )
    );

    displayedEnergyRef.current = nextEnergy;

    setEnergy(nextEnergy);
  };

  /*
   * Process queued taps sequentially.
   *
   * Only one request is sent to the backend at a time.
   */
  const processMiningQueue = async () => {
    if (processingQueueRef.current) {
      return;
    }

    processingQueueRef.current = true;
    setMining(true);

    try {
      while (pendingTapsRef.current > 0) {
        /*
         * Remove one tap from the waiting queue.
         */
        pendingTapsRef.current -= 1;

        try {
          const result = await mineCoin();

          if (!result?.success) {
            throw new Error(
              result?.message ||
                "Mining request failed"
            );
          }

          /*
           * Backend has now successfully processed
           * this exact tap.
           */
          const authoritativeBalance = Number(
            result.balance
          );

          const authoritativeEnergy = Number(
            result.energy
          );

          if (
            Number.isFinite(authoritativeBalance)
          ) {
            serverBalanceRef.current =
              authoritativeBalance;
          }

          if (
            Number.isFinite(authoritativeEnergy)
          ) {
            serverEnergyRef.current =
              authoritativeEnergy;
          }

          /*
           * Show:
           *
           * backend energy
           * minus taps that are still waiting.
           */
          if (
            Number.isFinite(authoritativeEnergy)
          ) {
            updateDisplayedEnergy(
              authoritativeEnergy
            );
          }

          /*
           * Show the authoritative backend balance
           * plus any taps that are still waiting.
           *
           * This keeps the UI feeling instant while
           * preserving backend authority.
           */
          const pending =
            pendingTapsRef.current;

          const optimisticBalance =
            serverBalanceRef.current +
            pending;

          setBalance(optimisticBalance);

          setLastEnergyUpdate(
            Date.now()
          );

          setMiningError("");
        } catch (error) {
          console.error(
            "Mining request failed:",
            error
          );

          /*
           * This tap was rejected.
           *
           * Restore the tap/energy visually because
           * the backend did NOT award the Coin.
           */
          setTapCount((current) =>
            Math.max(0, current - 1)
          );

          /*
           * Since this tap was removed from pending,
           * restore one energy.
           */
          displayedEnergyRef.current =
            Math.min(
              MAX_ENERGY,
              displayedEnergyRef.current + 1
            );

          setEnergy(
            displayedEnergyRef.current
          );

          /*
           * Make sure balance returns to the last
           * authoritative server value plus any
           * remaining successful/queued taps.
           */
          setBalance(
            serverBalanceRef.current +
              pendingTapsRef.current
          );

          setMiningError(
            error instanceof Error
              ? error.message
              : "Mining failed. Please try again."
          );
        }
      }
    } finally {
      processingQueueRef.current = false;
      setMining(false);

      /*
       * If everything has finished, make sure the
       * final balance matches the backend.
       */
      if (pendingTapsRef.current === 0) {
        setBalance(serverBalanceRef.current);

        if (
          serverEnergyRef.current >= 0
        ) {
          displayedEnergyRef.current =
            serverEnergyRef.current;

          setEnergy(
            serverEnergyRef.current
          );
        }

        setLastEnergyUpdate(Date.now());
      }
    }
  };

  /*
   * MAIN TAP HANDLER
   *
   * Everything visual happens immediately.
   */
  const handleTap = () => {
    /*
     * Use the ref because React state updates are
     * asynchronous and the user may tap extremely fast.
     */
    if (displayedEnergyRef.current <= 0) {
      setMiningError(
        "No energy left. Wait for your energy to refill."
      );

      return;
    }

    setMiningError("");

    /*
     * Immediately consume one visible energy.
     */
    displayedEnergyRef.current =
      Math.max(
        0,
        displayedEnergyRef.current - 1
      );

    setEnergy(
      displayedEnergyRef.current
    );

    /*
     * Immediately increase tap count.
     */
    setTapCount((current) => current + 1);

    /*
     * Immediately show +1.
     */
    addTapEffect();

    /*
     * Add this tap to the secure backend queue.
     */
    pendingTapsRef.current += 1;

    /*
     * Immediately show optimistic balance.
     */
    setBalance(
      serverBalanceRef.current +
        pendingTapsRef.current
    );

    /*
     * Trigger button animation immediately.
     */
    setIsTapping(true);

    if (
      tapAnimationTimeoutRef.current
    ) {
      window.clearTimeout(
        tapAnimationTimeoutRef.current
      );
    }

    tapAnimationTimeoutRef.current =
      window.setTimeout(() => {
        setIsTapping(false);
      }, 120);

    /*
     * Start backend processing without waiting
     * for the UI.
     */
    void processMiningQueue();
  };

  /*
   * Cleanup.
   */
  useEffect(() => {
    return () => {
      if (
        tapAnimationTimeoutRef.current
      ) {
        window.clearTimeout(
          tapAnimationTimeoutRef.current
        );
      }
    };
  }, []);

  const energyPercentage =
    (energy / MAX_ENERGY) * 100;

  return (
    <main className="home-page">
      {/* =========================
          HEADER
      ========================== */}
      <header className="home-header">
        <div>
          <p className="home-eyebrow">
            WELCOME TO
          </p>

          <h1 className="home-title">
            Coin<span>Earn</span>
          </h1>
        </div>

        <div className="home-header-avatar">
          <Coins size={22} />
        </div>
      </header>

      {/* =========================
          BALANCE CARD
      ========================== */}
      <section className="home-balance-card">
        <div className="home-balance-glow" />

        <div className="home-balance-top">
          <div>
            <p className="home-balance-label">
              YOUR BALANCE
            </p>

            <div className="home-balance-value">
              <Coins size={30} />

              <span>
                {Math.max(
                  0,
                  Math.floor(balance)
                ).toLocaleString()}
              </span>
            </div>

            <p className="home-balance-unit">
              COINS
            </p>
          </div>

          <div className="home-balance-icon">
            <Sparkles size={25} />
          </div>
        </div>

        <div className="home-balance-footer">
          <span>
            <TrendingUp size={14} />
            Keep earning
          </span>

          <span>
            <Zap size={14} />
            +1 per tap
          </span>
        </div>
      </section>

      {/* =========================
          MINING STATUS
      ========================== */}
      <section className="home-mining-card">
        <div className="home-mining-status">
          <div className="home-mining-status-left">
            <div
              className={`home-mining-dot ${
                mining
                  ? "home-mining-dot-active"
                  : ""
              }`}
            />

            <div>
              <strong>
                {mining
                  ? "Processing taps..."
                  : "Mining active"}
              </strong>

              <span>
                {mining
                  ? "Securing your rewards"
                  : "Tap the coin to earn"}
              </span>
            </div>
          </div>

          <ShieldCheck size={20} />
        </div>

        {/* =========================
            TAP AREA
        ========================== */}
        <div className="tap-area">
          <div className="tap-ring tap-ring-one" />
          <div className="tap-ring tap-ring-two" />
          <div className="tap-ring tap-ring-three" />

          {tapEffects.map((effect) => (
            <span
              key={effect.id}
              className="tap-floating-effect"
            >
              {effect.text}
            </span>
          ))}

          <button
            type="button"
            className={`coin-tap-button ${
              isTapping
                ? "coin-tap-button-active"
                : ""
            }`}
            onClick={handleTap}
            disabled={energy <= 0}
            aria-label="Mine one Coin"
          >
            <div className="coin-tap-inner">
              <Coins size={68} />

              <span className="coin-tap-text">
                TAP
              </span>
            </div>
          </button>
        </div>

        {/* =========================
            ENERGY
        ========================== */}
        <div className="home-energy-section">
          <div className="home-energy-header">
            <div className="home-energy-title">
              <Zap size={17} />

              <span>
                ENERGY
              </span>
            </div>

            <strong>
              {energy.toLocaleString()} /{" "}
              {MAX_ENERGY.toLocaleString()}
            </strong>
          </div>

          <div className="home-energy-bar">
            <div
              className="home-energy-fill"
              style={{
                width: `${energyPercentage}%`,
              }}
            />
          </div>

          <div className="home-energy-footer">
            <span>
              {energy > 0
                ? "Tap to mine"
                : "Energy depleted"}
            </span>

            <span>
              <Clock3 size={13} />

              {energy >= MAX_ENERGY
                ? "Full"
                : "Regenerating"}
            </span>
          </div>
        </div>

        {miningError && (
          <div className="home-mining-error">
            {miningError}
          </div>
        )}
      </section>

      {/* =========================
          SESSION STATS
      ========================== */}
      <section className="home-stats-grid">
        <div className="home-stat-card">
          <div className="home-stat-icon">
            <Zap size={19} />
          </div>

          <div>
            <strong>
              {tapCount.toLocaleString()}
            </strong>

            <span>
              Taps this session
            </span>
          </div>
        </div>

        <div className="home-stat-card">
          <div className="home-stat-icon">
            <Coins size={19} />
          </div>

          <div>
            <strong>
              +{tapCount.toLocaleString()}
            </strong>

            <span>
              Coins mined
            </span>
          </div>
        </div>
      </section>

      {/* =========================
          DAILY REWARD
      ========================== */}
      <section className="home-daily-card">
        <div className="home-daily-icon">
          <Gift size={23} />
        </div>

        <div className="home-daily-content">
          <strong>
            Daily Reward
          </strong>

          <span>
            Come back every day for bonus
            Coins.
          </span>
        </div>

        <button
          type="button"
          className="home-daily-button"
          disabled
        >
          Soon
        </button>
      </section>

      {/* =========================
          COMMUNITY / REFERRAL
      ========================== */}
      <section className="home-info-row">
        <div className="home-info-icon">
          <Users size={20} />
        </div>

        <div className="home-info-content">
          <strong>
            Invite & Earn
          </strong>

          <span>
            Invite friends and grow your
            CoinEarn rewards.
          </span>
        </div>

        <span className="home-info-arrow">
          →
        </span>
      </section>

      {/* =========================
          SECURITY NOTICE
      ========================== */}
      <section className="home-security-note">
        <ShieldCheck size={17} />

        <span>
          Your mining rewards are verified
          securely by the CoinEarn server.
        </span>
      </section>
    </main>
  );
}

