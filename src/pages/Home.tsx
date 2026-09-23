
import { useEffect, useState } from "react";
import {
  Coins,
  Gift,
  Users,
  Zap,
} from "lucide-react";

import { mineCoin } from "../lib/api";

const MAX_ENERGY = 1000;

// 1000 energy over 6 hours
const REFILL_TIME = 6 * 60 * 60 * 1000;
const REFILL_RATE =
  REFILL_TIME / MAX_ENERGY;

interface HomeProps {
  balance: number;
  setBalance: React.Dispatch<
    React.SetStateAction<number>
  >;
}


export default function Home({
  balance,
  setBalance,
}: HomeProps) {

  const [energy, setEnergy] =
    useState(MAX_ENERGY);

  const [
    lastEnergyUpdate,
    setLastEnergyUpdate,
  ] = useState(Date.now());

  const [tapEffects, setTapEffects] =
    useState<number[]>([]);

  const [isTapping, setIsTapping] =
    useState(false);

  const [mining, setMining] =
    useState(false);

  const [miningError, setMiningError] =
    useState<string | null>(null);


  /*
  --------------------------------------------------
  Load locally cached energy for smooth UI
  --------------------------------------------------
  */

  useEffect(() => {

    try {

      const savedEnergy =
        localStorage.getItem(
          "coinEarnEnergy"
        );

      const savedTime =
        localStorage.getItem(
          "coinEarnEnergyTime"
        );


      if (savedEnergy !== null) {

        const parsedEnergy =
          Number(savedEnergy);

        if (
          Number.isFinite(parsedEnergy)
        ) {

          setEnergy(
            Math.min(
              MAX_ENERGY,
              Math.max(
                0,
                parsedEnergy
              )
            )
          );

        }

      }


      if (savedTime !== null) {

        const parsedTime =
          Number(savedTime);

        if (
          Number.isFinite(parsedTime)
        ) {

          setLastEnergyUpdate(
            parsedTime
          );

        }

      }

    } catch (error) {

      console.error(
        "Could not load saved energy:",
        error
      );

    }

  }, []);


  /*
  --------------------------------------------------
  Automatically refill energy visually
  --------------------------------------------------
  */

  useEffect(() => {

    const interval =
      setInterval(() => {

        setEnergy(
          (currentEnergy) => {

            if (
              currentEnergy >=
              MAX_ENERGY
            ) {

              return MAX_ENERGY;

            }


            const now =
              Date.now();

            const elapsed =
              now -
              lastEnergyUpdate;


            const recovered =
              Math.floor(
                elapsed /
                REFILL_RATE
              );


            if (
              recovered <= 0
            ) {

              return currentEnergy;

            }


            const newEnergy =
              Math.min(
                MAX_ENERGY,
                currentEnergy +
                  recovered
              );


            const newTime =
              lastEnergyUpdate +
              recovered *
                REFILL_RATE;


            setLastEnergyUpdate(
              newTime
            );


            return newEnergy;

          }
        );

      }, 1000);


    return () => {

      clearInterval(
        interval
      );

    };

  }, [
    lastEnergyUpdate,
  ]);


  /*
  --------------------------------------------------
  Save visual energy state
  --------------------------------------------------
  */

  useEffect(() => {

    try {

      localStorage.setItem(
        "coinEarnEnergy",
        String(energy)
      );

      localStorage.setItem(
        "coinEarnEnergyTime",
        String(
          lastEnergyUpdate
        )
      );

    } catch (error) {

      console.error(
        "Could not save energy:",
        error
      );

    }

  }, [
    energy,
    lastEnergyUpdate,
  ]);


  /*
  --------------------------------------------------
  Calculate progress bar percentage
  --------------------------------------------------
  */

  const energyPercentage =
    Math.max(
      0,
      Math.min(
        100,
        (energy / MAX_ENERGY) *
          100
      )
    );


  /*
  --------------------------------------------------
  Handle mining tap
  --------------------------------------------------
  */

  const handleTap = async () => {

    if (
      energy <= 0 ||
      mining
    ) {

      return;

    }


    setMining(true);

    setMiningError(null);


    try {

      /*
      ----------------------------------------------
      Send request to secure backend
      ----------------------------------------------
      */

      const result =
        await mineCoin();


      /*
      ----------------------------------------------
      Update authoritative balance
      ----------------------------------------------
      */

      setBalance(
        Number(
          result.balance
        )
      );


      /*
      ----------------------------------------------
      Update authoritative energy
      ----------------------------------------------
      */

      setEnergy(
        Number(
          result.energy
        )
      );


      /*
      ----------------------------------------------
      Update refill timestamp
      ----------------------------------------------
      */

      setLastEnergyUpdate(
        new Date(
          result.last_energy_update
        ).getTime()
      );


      /*
      ----------------------------------------------
      Tap animation
      ----------------------------------------------
      */

      setIsTapping(true);


      setTimeout(() => {

        setIsTapping(false);

      }, 120);


      /*
      ----------------------------------------------
      Floating +1 animation
      ----------------------------------------------
      */

      const effectId =
        Date.now();


      setTapEffects(
        (current) => [
          ...current,
          effectId,
        ]
      );


      setTimeout(() => {

        setTapEffects(
          (current) =>
            current.filter(
              (id) =>
                id !== effectId
            )
        );

      }, 800);


    } catch (error) {

      console.error(
        "Mining failed:",
        error
      );


      setMiningError(

        error instanceof Error
          ? error.message
          : "Mining failed. Please try again."

      );

    } finally {

      setMining(false);

    }

  };


  /*
  --------------------------------------------------
  Format numbers
  --------------------------------------------------
  */

  const formatNumber = (
    number: number
  ) => {

    return number.toLocaleString();

  };


  /*
  --------------------------------------------------
  Render
  --------------------------------------------------
  */

  return (

    <div className="page">

      {/* -------------------------------------------
          HEADER
      ------------------------------------------- */}

      <div className="top-header">

        <div>

          <p className="welcome-text">
            Welcome back 👋
          </p>

          <h1>
            CoinEarn
          </h1>

          <p className="app-tagline">
            Mine. Earn. Spend.
          </p>

        </div>


        <div className="header-avatar">
          👤
        </div>

      </div>


      {/* -------------------------------------------
          BALANCE CARD
      ------------------------------------------- */}

      <div className="balance-card">

        <div className="balance-label">

          <Coins size={17} />

          <span>
            Your Balance
          </span>

        </div>


        <h2>
          {formatNumber(balance)}
        </h2>


        <p>
          COINS
        </p>

      </div>


      {/* -------------------------------------------
          MINING SECTION
      ------------------------------------------- */}

      <div className="tap-section">

        <div className="tap-wrapper">

          {/* Floating +1 effects */}

          {tapEffects.map(
            (id) => (

              <span
                key={id}
                className="tap-effect"
              >
                +1
              </span>

            )
          )}


          {/* Main mining button */}

          <button
            type="button"
            className={`tap-button ${
              isTapping
                ? "tap-active"
                : ""
            }`}
            onClick={handleTap}
            disabled={
              energy <= 0 ||
              mining
            }
          >

            <div className="coin-icon">
              🪙
            </div>


            <span>

              {mining
                ? "MINING..."
                : energy > 0
                ? "TAP TO MINE"
                : "REFILLING..."}

            </span>

          </button>

        </div>


        {/* -----------------------------------------
            ENERGY PROGRESS BAR
        ----------------------------------------- */}

        <div className="mining-progress">

          <div className="progress-track">

            <div
              className="progress-fill"
              style={{
                width: `${energyPercentage}%`,
              }}
            />

          </div>

        </div>


        {/* -----------------------------------------
            ERROR MESSAGE
        ----------------------------------------- */}

        {miningError && (

          <p
            style={{
              marginTop: "10px",
              color: "#ff7777",
              fontSize: "12px",
              textAlign: "center",
              padding: "0 15px",
            }}
          >
            {miningError}
          </p>

        )}

      </div>


      {/* -------------------------------------------
          QUICK STATS
      ------------------------------------------- */}

      <div className="quick-stats">


        {/* Today */}

        <div className="stat-card">

          <Zap size={20} />

          <strong>
            {formatNumber(
              balance
            )}
          </strong>

          <span>
            Today
          </span>

        </div>


        {/* Daily Bonus */}

        <div className="stat-card">

          <Gift size={20} />

          <strong>
            0
          </strong>

          <span>
            Daily Bonus
          </span>

        </div>


        {/* Referrals */}

        <div className="stat-card">

          <Users size={20} />

          <strong>
            0
          </strong>

          <span>
            Referrals
          </span>

        </div>


      </div>


      {/* -------------------------------------------
          DAILY REWARD
      ------------------------------------------- */}

      <div className="daily-card">

        <div>

          <h3>
            Daily Reward
          </h3>

          <p>
            Come back every day to claim
            your reward.
          </p>

        </div>


        <button
          type="button"
        >
          Claim
        </button>

      </div>

    </div>

  );
}

