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


export type Tab =
  | "home"
  | "tasks"
  | "market"
  | "wallet"
  | "profile";


export interface CoinEarnUser {

  id: string;

  telegramId: string;

  username: string | null;

  firstName: string | null;

  lastName: string | null;

  photoUrl: string | null;

}


function App() {

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<Tab>("home");


  const [
    user,
    setUser,
  ] =
    useState<CoinEarnUser | null>(
      null
    );


  const [
    balance,
    setBalance,
  ] =
    useState(0);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );


  /*
  |--------------------------------------------------------------------------
  | Authenticate
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    async function authenticate() {

      try {

        setLoading(true);

        const result =
          await telegramLogin();


        setUser(
          result.user
        );


        setBalance(
          result.balance || 0
        );


        setError(null);

      } catch (err) {

        console.error(err);


        setError(

          err instanceof Error

            ? err.message

            : "Authentication failed"

        );

      } finally {

        setLoading(false);

      }

    }


    authenticate();

  }, []);


  /*
  |--------------------------------------------------------------------------
  | Render current page
  |--------------------------------------------------------------------------
  */

  const renderPage =
    () => {

      switch (
        activeTab
      ) {

        case "home":

          return (

            <Home
              balance={balance}
              setBalance={setBalance}
            />

          );


        case "tasks":

          return (

            <Tasks
              balance={balance}
              setBalance={setBalance}
            />

          );


        case "market":

          return (

            <Market
              balance={balance}
              setBalance={setBalance}
            />

          );


        case "wallet":

          return (

            <Wallet
              balance={balance}
            />

          );


        case "profile":

          return (

            <Profile
              user={user}
            />

          );


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
  | POLISHED SPLASH / LOADING SCREEN
  |--------------------------------------------------------------------------
  */

  if (loading) {

    return (

      <div className="loading-screen">

        {/* Background glow */}

        <div className="loading-glow loading-glow-one" />

        <div className="loading-glow loading-glow-two" />


        {/* Logo */}

        <div className="loading-logo-wrapper">

          <div className="loading-logo-ring" />

          <div className="loading-logo">

            <img
              src="https://dlfwaffhsiuodtxtxmti.supabase.co/storage/v1/object/public/Ads%20image/generated-image%20(1).png"
              alt="ChannelFix"
            />

          </div>

        </div>


        {/* App name */}

        <h1 className="loading-title">
          Channel<span>Fix</span>
        </h1>


        {/* Tagline */}

        <p className="loading-subtitle">
          Growing Your Audience
        </p>


        {/* Animated loading dots */}

        <div className="loading-dots">

          <span />
          <span />
          <span />

        </div>


        {/* Spinner */}

        <div className="loading-spinner-wrapper">

          <div className="loading-spinner" />

        </div>


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

        <div className="loading-error-icon">
          ⚠️
        </div>


        <h1 className="loading-title">
          Channel<span>Fix</span>
        </h1>


        <p className="loading-error-text">
          {error}
        </p>


        <button
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
  | APPLICATION
  |--------------------------------------------------------------------------
  */

  return (

    <div className="app">

      <main className="app-content">

        {renderPage()}

      </main>


      <BottomNav
        activeTab={
          activeTab
        }
        setActiveTab={
          setActiveTab
        }
      />

    </div>

  );

}


export default App;