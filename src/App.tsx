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
            <Wallet />
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
  | Loading screen
  |--------------------------------------------------------------------------
  */

  if (loading) {

    return (

      <div className="loading-screen">

        <div className="loading-logo">
          🪙
        </div>

        <h1>
          CoinEarn
        </h1>

        <p>
          Connecting to Telegram...
        </p>

        <div className="loading-spinner" />

      </div>

    );

  }


  /*
  |--------------------------------------------------------------------------
  | Error screen
  |--------------------------------------------------------------------------
  */

  if (error) {

    return (

      <div className="loading-screen">

        <div className="loading-logo">
          ⚠️
        </div>

        <h1>
          CoinEarn
        </h1>

        <p>
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
  | Application
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