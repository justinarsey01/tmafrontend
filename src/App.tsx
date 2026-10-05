import {
  useEffect,
  useState,
} from "react";

import BottomNav from "./components/BottomNav";

import Home from "./pages/Home";

import Tasks from "./pages/Tasks";

import Market from "./pages/Market";

import Wallet from "./pages/Wallet";

import Profile from "./pages/Profile";

import {
  telegramLogin,
} from "./lib/api";


/*
|--------------------------------------------------------------------------
| Telegram / CoinEarn User
|--------------------------------------------------------------------------
*/

export interface CoinEarnUser {

  id: string;

  telegramId: string;

  username: string | null;

  firstName: string | null;

  lastName: string | null;

  photoUrl: string | null;

  referralCode?: string | null;

  totalEarned?: number;

  totalSpent?: number;

  referralCount?: number;

}


/*
|--------------------------------------------------------------------------
| Navigation Tabs
|--------------------------------------------------------------------------
*/

export type Tab =
  | "home"
  | "tasks"
  | "market"
  | "wallet"
  | "profile";


/*
|--------------------------------------------------------------------------
| LOGO URL
|--------------------------------------------------------------------------
|
| Replace this URL with the direct URL of your ChannelFix logo.
|
| Example:
| https://yourdomain.com/logo.png
|
| IMPORTANT:
| The URL should point directly to the image.
|
|--------------------------------------------------------------------------
*/

const LOGO_URL =
  "https://dlfwaffhsiuodtxtxmti.supabase.co/storage/v1/object/public/Ads%20image/20261005_181118.png";


/*
|--------------------------------------------------------------------------
| APP
|--------------------------------------------------------------------------
*/

function App() {

  /*
  |--------------------------------------------------------------------------
  | Active tab
  |--------------------------------------------------------------------------
  */

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<Tab>("home");


  /*
  |--------------------------------------------------------------------------
  | Authenticated Telegram user
  |--------------------------------------------------------------------------
  */

  const [
    user,
    setUser,
  ] =
    useState<CoinEarnUser | null>(
      null
    );


  /*
  |--------------------------------------------------------------------------
  | Coin balance
  |--------------------------------------------------------------------------
  */

  const [
    balance,
    setBalance,
  ] =
    useState(0);


  /*
  |--------------------------------------------------------------------------
  | Loading state
  |--------------------------------------------------------------------------
  */

  const [
    loading,
    setLoading,
  ] =
    useState(true);


  /*
  |--------------------------------------------------------------------------
  | Error state
  |--------------------------------------------------------------------------
  */

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );


  /*
  |--------------------------------------------------------------------------
  | TELEGRAM AUTHENTICATION
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    let mounted = true;


    async function authenticate() {

      try {

        setLoading(true);

        setError(null);


        /*
        --------------------------------------------------
        Authenticate with Telegram
        --------------------------------------------------
        */

        const result =
          await telegramLogin();


        /*
        --------------------------------------------------
        Only update state if component is still mounted
        --------------------------------------------------
        */

        if (!mounted) {
          return;
        }


        /*
        --------------------------------------------------
        Save user
        --------------------------------------------------
        */

        setUser(
          result.user
        );


        /*
        --------------------------------------------------
        Save balance
        --------------------------------------------------
        */

        setBalance(
          Number(result.balance || 0)
        );


        setError(null);

      } catch (err) {

        console.error(
          "Authentication error:",
          err
        );


        if (!mounted) {
          return;
        }


        setError(

          err instanceof Error

            ? err.message

            : "Authentication failed"

        );

      } finally {

        if (mounted) {

          setLoading(false);

        }

      }

    }


    authenticate();


    /*
    --------------------------------------------------
    Cleanup
    --------------------------------------------------
    */

    return () => {

      mounted = false;

    };

  }, []);


  /*
  |--------------------------------------------------------------------------
  | RENDER CURRENT PAGE
  |--------------------------------------------------------------------------
  */

  const renderPage = () => {

    switch (activeTab) {

      /*
      --------------------------------------------------
      HOME
      --------------------------------------------------
      */

      case "home":

        return (

          <Home
            balance={balance}
            setBalance={setBalance}
          />

        );


      /*
      --------------------------------------------------
      TASKS
      --------------------------------------------------
      */

      case "tasks":

        return (

          <Tasks
            balance={balance}
            setBalance={setBalance}
          />

        );


      /*
      --------------------------------------------------
      MARKET
      --------------------------------------------------
      */

      case "market":

        return (

          <Market
            balance={balance}
            setBalance={setBalance}
          />

        );


      /*
      --------------------------------------------------
      WALLET
      --------------------------------------------------
      */

      case "wallet":

        return (

          <Wallet
            balance={balance}
          />

        );


      /*
      --------------------------------------------------
      PROFILE
      --------------------------------------------------
      */

      case "profile":

        return (

          <Profile
            user={user}
          />

        );


      /*
      --------------------------------------------------
      DEFAULT
      --------------------------------------------------
      */

      default:

        return (

          <Home
            balance={balance}
            setBalance={setBalance}
          />

        );

    }

  };


  /*
  |--------------------------------------------------------------------------
  | POLISHED SPLASH SCREEN
  |--------------------------------------------------------------------------
  */

  if (loading) {

    return (

      <div className="loading-screen">

        {/* Background animated glow */}

        <div
          className="
            loading-glow
            loading-glow-one
          "
        />

        <div
          className="
            loading-glow
            loading-glow-two
          "
        />


        {/* =================================================
            LARGE LOGO
        ================================================== */}

        <div className="loading-logo-wrapper">

          {/* Animated outer ring */}

          <div className="loading-logo-ring" />


          {/* Logo container */}

          <div className="loading-logo">

            <img
              src={LOGO_URL}
              alt="ChannelFix"
            />

          </div>

        </div>


        {/* =================================================
            APP NAME
        ================================================== */}

        <h1 className="loading-title">

          Channel<span>Fix</span>

        </h1>


        {/* =================================================
            SUBTITLE
        ================================================== */}

        <p className="loading-subtitle">

          Growing Your Audience

        </p>


        {/* =================================================
            ANIMATED DOTS
        ================================================== */}

        <div className="loading-dots">

          <span />

          <span />

          <span />

        </div>


        {/* =================================================
            SPINNER
        ================================================== */}

        <div className="loading-spinner-wrapper">

          <div className="loading-spinner" />

        </div>


        {/* =================================================
            STATUS
        ================================================== */}

        <p className="loading-status">

          Connecting securely...

        </p>

      </div>

    );

  }


  /*
  |--------------------------------------------------------------------------
  | ERROR SCREEN
  |--------------------------------------------------------------------------
  */

  if (error) {

    return (

      <div className="loading-screen">

        {/* Background glow */}

        <div
          className="
            loading-glow
            loading-glow-one
          "
        />


        {/* Error icon */}

        <div className="loading-error-icon">

          ⚠️

        </div>


        {/* App name */}

        <h1 className="loading-title">

          Channel<span>Fix</span>

        </h1>


        {/* Error message */}

        <p className="loading-error-text">

          {error}

        </p>


        {/* Retry */}

        <button
          type="button"
          className="retry-button"
          onClick={() =>
            window.location.reload()
          }
        >

          Try Again

        </button>

      </div>

    );

  }


  /*
  |--------------------------------------------------------------------------
  | MAIN APPLICATION
  |--------------------------------------------------------------------------
  */

  return (

    <div className="app">

      <main className="app-content">

        {renderPage()}

      </main>


      {/* =================================================
          BOTTOM NAVIGATION
      ================================================== */}

      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

    </div>

  );

}


export default App;