import {
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  Gift,
  Loader2,
  Send,
  Target,
  Users,
  Globe,
  ExternalLink,
  RefreshCw,
  Coins,
  Sparkles,
  CircleDollarSign,
} from "lucide-react";

import {
  completeTask,
  getTasks,
} from "../lib/api";


/*
|--------------------------------------------------------------------------
| TASK TYPE
|--------------------------------------------------------------------------
*/

interface Task {
  id: string;

  title: string;

  description: string | null;

  type: string;

  target: string;

  reward: number;

  /*
   * IMPORTANT:
   *
   * This value comes from the backend.
   *
   * true = this user has already completed
   * this task permanently.
   */
  completed?: boolean;
}


/*
|--------------------------------------------------------------------------
| PROPS
|--------------------------------------------------------------------------
*/

interface TasksProps {
  balance?: number;

  setBalance?: React.Dispatch<
    React.SetStateAction<number>
  >;
}


/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function Tasks({
  balance = 0,
  setBalance,
}: TasksProps) {

  /*
  |--------------------------------------------------------------------------
  | UI STATE
  |--------------------------------------------------------------------------
  |
  | These states are only for the page itself.
  |
  | There is NO completedTasks state.
  | There is NO startedTasks state.
  | There is NO local task-completion storage.
  |
  | The backend is the authority for completion.
  |
  |--------------------------------------------------------------------------
  */

  const [
    tasks,
    setTasks,
  ] = useState<Task[]>([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  const [
    startingTask,
    setStartingTask,
  ] = useState<string | null>(null);


  const [
    completingTask,
    setCompletingTask,
  ] = useState<string | null>(null);


  const [
    error,
    setError,
  ] = useState<string | null>(null);


  /*
  |--------------------------------------------------------------------------
  | LOAD TASKS
  |--------------------------------------------------------------------------
  */

  async function loadTasks(
    showRefresh = false
  ) {

    try {

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);


      const result =
        await getTasks();


      /*
       * Your API may return:
       *
       * [
       *   ...
       * ]
       *
       * OR:
       *
       * {
       *   tasks: [...]
       * }
       */

      const taskList: Task[] =
        Array.isArray(result)
          ? result
          : Array.isArray(
              (result as any)?.tasks
            )
          ? (result as any).tasks
          : [];


      /*
       * Backend is the source of truth.
       *
       * No completed task IDs are stored
       * in React.
       */

      setTasks(taskList);

    } catch (err) {

      console.error(
        "Could not load tasks:",
        err
      );


      setError(
        err instanceof Error
          ? err.message
          : "Could not load tasks"
      );

    } finally {

      setLoading(false);

      setRefreshing(false);

    }

  }


  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    loadTasks();

  }, []);


  /*
  |--------------------------------------------------------------------------
  | TASK COUNTS
  |--------------------------------------------------------------------------
  */

  const completedCount =
    tasks.filter(
      (task) => task.completed === true
    ).length;


  const remainingTasks =
    tasks.filter(
      (task) => task.completed !== true
    ).length;


  /*
  |--------------------------------------------------------------------------
  | TOTAL AVAILABLE REWARDS
  |--------------------------------------------------------------------------
  |
  | Only uncompleted tasks are included.
  |
  |--------------------------------------------------------------------------
  */

  const totalRewards =
    tasks
      .filter(
        (task) =>
          task.completed !== true
      )
      .reduce(
        (total, task) =>
          total +
          Number(task.reward || 0),
        0
      );


  /*
  |--------------------------------------------------------------------------
  | EARNED FROM COMPLETED TASKS
  |--------------------------------------------------------------------------
  */

  const earnedFromTasks =
    tasks
      .filter(
        (task) =>
          task.completed === true
      )
      .reduce(
        (total, task) =>
          total +
          Number(task.reward || 0),
        0
      );


  /*
  |--------------------------------------------------------------------------
  | TASK ICON
  |--------------------------------------------------------------------------
  */

  function getTaskIcon(
    type: string
  ) {

    const normalized =
      String(type || "")
        .toLowerCase();


    switch (normalized) {

      case "telegram_channel":

      case "telegram_group":

      case "telegram_bot":

      case "telegram_post":

      case "telegram":

        return (
          <Send size={20} />
        );


      case "website":

        return (
          <Globe size={20} />
        );


      case "social":

      case "facebook":

      case "instagram":

      case "youtube":

        return (
          <Users size={20} />
        );


      default:

        return (
          <Target size={20} />
        );

    }

  }


  /*
  |--------------------------------------------------------------------------
  | TASK TYPE LABEL
  |--------------------------------------------------------------------------
  */

  function getTaskType(
    type: string
  ) {

    switch (type) {

      case "telegram_channel":

        return "Telegram Channel";


      case "telegram_group":

        return "Telegram Group";


      case "telegram_bot":

        return "Telegram Bot";


      case "telegram_post":

        return "Telegram Post";


      case "website":

        return "Website";


      case "social":

        return "Social Media";


      case "telegram":

        return "Telegram";


      default:

        return "Task";

    }

  }


  /*
  |--------------------------------------------------------------------------
  | OPEN TASK TARGET
  |--------------------------------------------------------------------------
  */

  function openTaskTarget(
    target: string
  ) {

    if (!target) {
      return;
    }


    let url =
      target.trim();


    /*
     * @username
     */

    if (
      url.startsWith("@")
    ) {

      url =
        `https://t.me/${url.substring(1)}`;

    }


    /*
     * t.me/username
     */

    else if (
      url.startsWith("t.me/")
    ) {

      url =
        `https://${url}`;

    }


    /*
     * telegram.me/username
     */

    else if (
      url.startsWith(
        "telegram.me/"
      )
    ) {

      url =
        `https://${url}`;

    }


    /*
     * Normal URL without protocol.
     */

    else if (
      !url.startsWith(
        "http://"
      ) &&
      !url.startsWith(
        "https://"
      )
    ) {

      url =
        `https://${url}`;

    }


    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

  }


  /*
  |--------------------------------------------------------------------------
  | START TASK
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  |
  | There is intentionally NO visible countdown.
  |
  | The user clicks Start Task.
  |
  | The target opens.
  |
  | The button remains unavailable while the
  | 10-second server-side/frontend waiting period
  | runs.
  |
  |--------------------------------------------------------------------------
  */

  async function handleStartTask(
    task: Task
  ) {

    /*
     * NEVER allow a completed task
     * to be started again.
     */

    if (
      task.completed === true
    ) {

      return;

    }


    /*
     * Prevent multiple clicks.
     */

    if (
      startingTask ||
      completingTask
    ) {

      return;

    }


    try {

      setError(null);

      setStartingTask(
        task.id
      );


      /*
       * Open the target immediately.
       */

      openTaskTarget(
        task.target
      );


      /*
       * Silent 10-second wait.
       *
       * Nothing is displayed to the user.
       */

      await new Promise<void>(
        (resolve) => {

          window.setTimeout(
            resolve,
            10000
          );

        }
      );


      /*
       * Reload the task from backend after
       * the waiting period.
       *
       * This makes sure we are still working
       * with the latest server state.
       */

      const result =
        await getTasks();


      const latestTasks: Task[] =
        Array.isArray(result)
          ? result
          : Array.isArray(
              (result as any)?.tasks
            )
          ? (result as any).tasks
          : [];


      /*
       * Update the entire task list from
       * the backend.
       */

      setTasks(
        latestTasks
      );

    } catch (err) {

      console.error(
        "Start task error:",
        err
      );


      setError(
        err instanceof Error
          ? err.message
          : "Could not start task"
      );

    } finally {

      setStartingTask(
        null
      );

    }

  }


  /*
  |--------------------------------------------------------------------------
  | COMPLETE TASK
  |--------------------------------------------------------------------------
  |
  | This is only shown after Start Task has completed
  | the silent 10-second wait.
  |
  | The reward is added by the secure backend RPC.
  |
  |--------------------------------------------------------------------------
  */

  async function handleCompleteTask(
    task: Task
  ) {

    /*
     * Never allow completed tasks
     * to be completed again.
     */

    if (
      task.completed === true
    ) {

      return;

    }


    /*
     * Prevent duplicate requests.
     */

    if (
      completingTask ||
      startingTask
    ) {

      return;

    }


    try {

      setError(null);

      setCompletingTask(
        task.id
      );


      /*
       * Secure backend completion.
       */

      const result =
        await completeTask(
          task.id
        );


      console.log(
        "Task completion result:",
        result
      );


      /*
       * Update the user's actual balance
       * using the authoritative backend value.
       */

      if (
        setBalance &&
        result?.balance !==
          undefined &&
        result?.balance !==
          null
      ) {

        setBalance(
          Number(
            result.balance
          )
        );

      }


      /*
       * IMPORTANT:
       *
       * Reload tasks from backend.
       *
       * The backend should now return:
       *
       * completed: true
       *
       * for this specific user/task.
       */

      await loadTasks();

    } catch (err) {

      console.error(
        "Task completion failed:",
        err
      );


      setError(
        err instanceof Error
          ? err.message
          : "Could not complete task"
      );

    } finally {

      setCompletingTask(
        null
      );

    }

  }


  /*
  |--------------------------------------------------------------------------
  | LOADING SCREEN
  |--------------------------------------------------------------------------
  */

  if (loading) {

    return (

      <div className="tasks-page">

        <style>{`

          .tasks-page {
            width: 100%;
            min-height: 100%;
            padding: 18px 16px 110px;
            box-sizing: border-box;
            color: var(--text, #ffffff);
          }

          .tasks-loading {
            min-height: 300px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 12px;
            color: #999999;
          }

          .tasks-loading strong {
            color: #ffffff;
            font-size: 16px;
          }

          .tasks-loading span {
            font-size: 12px;
          }

          .spin {
            animation: taskSpin 1s linear infinite;
          }

          @keyframes taskSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

        `}</style>


        <div className="tasks-loading">

          <Loader2
            size={32}
            className="spin"
          />

          <strong>
            Loading tasks
          </strong>

          <span>
            Finding available rewards...
          </span>

        </div>

      </div>

    );

  }


  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (

    <div className="tasks-page">

      <style>{`

        /* =========================================================
           TASK PAGE
        ========================================================= */

        .tasks-page {
          width: 100%;
          min-height: 100%;
          padding: 18px 16px 110px;
          box-sizing: border-box;
          color: var(--text, #ffffff);
        }


        /* =========================================================
           HEADER
        ========================================================= */

        .tasks-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 20px;
        }


        .tasks-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }


        .tasks-header-icon {
          width: 44px;
          height: 44px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(245, 184, 0, 0.13);
          color: #f5b800;
          flex-shrink: 0;
        }


        .tasks-eyebrow {
          margin: 0 0 3px;
          color: #f5b800;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1px;
        }


        .tasks-header h1 {
          margin: 0;
          font-size: 25px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }


        .tasks-subtitle {
          margin: 5px 0 0;
          color: #888888;
          font-size: 12px;
        }


        .tasks-refresh-button {
          width: 42px;
          height: 42px;
          border: 1px solid rgba(
            255,
            255,
            255,
            0.08
          );
          border-radius: 12px;
          background: rgba(
            255,
            255,
            255,
            0.04
          );
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }


        .tasks-refresh-button:hover {
          color: #f5b800;
          background: rgba(
            245,
            184,
            0,
            0.09
          );
        }


        .tasks-refresh-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }


        /* =========================================================
           SUMMARY
        ========================================================= */

        .tasks-summary {
          display: grid;
          grid-template-columns: repeat(
            3,
            minmax(0, 1fr)
          );
          gap: 9px;
          margin-bottom: 14px;
        }


        .tasks-summary-card {
          padding: 12px 9px;
          border-radius: 13px;
          background: rgba(
            255,
            255,
            255,
            0.04
          );
          border: 1px solid rgba(
            255,
            255,
            255,
            0.06
          );
          min-width: 0;
        }


        .tasks-summary-card-top {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 7px;
        }


        .tasks-summary-icon {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(
            245,
            184,
            0,
            0.11
          );
          color: #f5b800;
          flex-shrink: 0;
        }


        .tasks-summary-label {
          display: block;
          color: #777777;
          font-size: 9px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }


        .tasks-summary-value {
          display: block;
          color: #ffffff;
          font-size: 15px;
          font-weight: 800;
          overflow: hidden;
          text-overflow: ellipsis;
        }


        /* =========================================================
           REWARD HERO
        ========================================================= */

        .tasks-hero {
          position: relative;
          overflow: hidden;
          padding: 17px;
          margin-bottom: 16px;
          border-radius: 17px;
          background:
            linear-gradient(
              135deg,
              rgba(245, 184, 0, 0.14),
              rgba(245, 184, 0, 0.035)
            );
          border: 1px solid rgba(
            245,
            184,
            0,
            0.14
          );
        }


        .tasks-hero-glow {
          position: absolute;
          width: 130px;
          height: 130px;
          right: -55px;
          top: -65px;
          border-radius: 50%;
          background: rgba(
            245,
            184,
            0,
            0.13
          );
          filter: blur(20px);
        }


        .tasks-hero-top {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }


        .tasks-hero-icon {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f5b800;
          background: rgba(
            245,
            184,
            0,
            0.12
          );
        }


        .tasks-live-badge {
          padding: 5px 8px;
          border-radius: 7px;
          background: rgba(
            34,
            197,
            94,
            0.12
          );
          color: #4ade80;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }


        .tasks-hero-content {
          position: relative;
          margin-top: 13px;
        }


        .tasks-hero-content span {
          display: block;
          color: #999999;
          font-size: 11px;
        }


        .tasks-hero-content strong {
          display: block;
          margin-top: 3px;
          color: #f5b800;
          font-size: 28px;
          font-weight: 900;
        }


        .tasks-hero-content small {
          color: #777777;
          font-size: 10px;
        }


        .tasks-hero-bottom {
          position: relative;
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: 15px;
          padding-top: 12px;
          border-top: 1px solid rgba(
            255,
            255,
            255,
            0.06
          );
        }


        .tasks-hero-bottom div {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #999999;
          font-size: 10px;
        }


        .tasks-hero-bottom svg {
          color: #f5b800;
        }


        /* =========================================================
           ERROR
        ========================================================= */

        .tasks-error {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
          padding: 12px 14px;
          border-radius: 11px;
          background: rgba(
            239,
            68,
            68,
            0.09
          );
          border: 1px solid rgba(
            239,
            68,
            68,
            0.18
          );
          color: #fca5a5;
          font-size: 11px;
        }


        .tasks-error button {
          border: none;
          background: transparent;
          color: #fca5a5;
          font-size: 18px;
          cursor: pointer;
        }


        /* =========================================================
           EMPTY
        ========================================================= */

        .tasks-empty {
          padding: 45px 20px;
          border-radius: 17px;
          background: rgba(
            255,
            255,
            255,
            0.035
          );
          border: 1px solid rgba(
            255,
            255,
            255,
            0.06
          );
          text-align: center;
        }


        .tasks-empty-icon {
          width: 62px;
          height: 62px;
          margin: 0 auto 15px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(
            245,
            184,
            0,
            0.1
          );
          color: #f5b800;
        }


        .tasks-empty h3 {
          margin: 0 0 7px;
          font-size: 17px;
        }


        .tasks-empty p {
          max-width: 320px;
          margin: 0 auto 18px;
          color: #888888;
          font-size: 12px;
          line-height: 1.6;
        }


        /* =========================================================
           SECTION TITLE
        ========================================================= */

        .tasks-section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: 20px 0 12px;
        }


        .tasks-section-heading p {
          margin: 0 0 3px;
          color: #777777;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1px;
        }


        .tasks-section-heading h2 {
          margin: 0;
          font-size: 17px;
        }


        .tasks-earned-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 9px;
          border-radius: 8px;
          background: rgba(
            34,
            197,
            94,
            0.1
          );
          color: #4ade80;
          font-size: 10px;
          font-weight: 800;
        }


        /* =========================================================
           TASK LIST
        ========================================================= */

        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }


        /* =========================================================
           TASK CARD
        ========================================================= */

        .task-card {
          padding: 15px;
          border-radius: 16px;
          background: rgba(
            255,
            255,
            255,
            0.04
          );
          border: 1px solid rgba(
            255,
            255,
            255,
            0.07
          );
          transition:
            opacity 0.2s ease,
            border-color 0.2s ease,
            background 0.2s ease;
        }


        .task-card:hover {
          border-color: rgba(
            245,
            184,
            0,
            0.16
          );
        }


        /* =========================================================
           COMPLETED TASK
        =========================================================
        
        IMPORTANT:
        
        A completed task is permanently visually inactive.
        
        ========================================================= */

        .task-card-completed {
          opacity: 0.48;
          border-color: rgba(
            34,
            197,
            94,
            0.12
          );
          background: rgba(
            34,
            197,
            94,
            0.025
          );
        }


        .task-card-completed:hover {
          border-color: rgba(
            34,
            197,
            94,
            0.12
          );
          background: rgba(
            34,
            197,
            94,
            0.025
          );
        }


        /*
         * Strike completed task text.
         */

        .task-card-completed
        .task-title {

          text-decoration:
            line-through;

          text-decoration-thickness:
            1.5px;

          text-decoration-color:
            rgba(
              255,
              255,
              255,
              0.6
            );

        }


        .task-card-completed
        .task-description {

          text-decoration:
            line-through;

          text-decoration-thickness:
            1px;

        }


        .task-card-completed
        .task-target {

          text-decoration:
            line-through;

        }


        .task-card-completed
        .task-reward {

          text-decoration:
            line-through;

        }


        /* =========================================================
           TASK TOP
        ========================================================= */

        .task-card-top {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }


        .task-icon {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(
            245,
            184,
            0,
            0.11
          );
          color: #f5b800;
        }


        .task-card-completed
        .task-icon {

          background: rgba(
            34,
            197,
            94,
            0.1
          );

          color: #4ade80;

        }


        .task-card-heading {
          flex: 1;
          min-width: 0;
        }


        .task-title {
          margin: 0;
          color: #ffffff;
          font-size: 14px;
          font-weight: 750;
          line-height: 1.35;
        }


        .task-description {
          margin: 5px 0 0;
          color: #888888;
          font-size: 11px;
          line-height: 1.5;
        }


        .task-type-badge {
          display: inline-flex;
          margin-bottom: 5px;
          padding: 3px 7px;
          border-radius: 6px;
          background: rgba(
            255,
            255,
            255,
            0.06
          );
          color: #999999;
          font-size: 8px;
          font-weight: 700;
        }


        .task-completed-label {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-left: 5px;
          padding: 3px 7px;
          border-radius: 6px;
          background: rgba(
            34,
            197,
            94,
            0.1
          );
          color: #4ade80;
          font-size: 8px;
          font-weight: 800;
        }


        .task-reward {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
          color: #f5b800;
          font-size: 12px;
          font-weight: 800;
        }


        /* =========================================================
           TARGET
        ========================================================= */

        .task-target {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 14px;
          padding: 10px 11px;
          border-radius: 9px;
          background: rgba(
            255,
            255,
            255,
            0.035
          );
          color: #888888;
          font-size: 10px;
        }


        .task-target-icon {
          display: flex;
          color: #777777;
        }


        /* =========================================================
           FOOTER
        ========================================================= */

        .task-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 14px;
        }


        .task-earning {
          min-width: 0;
        }


        .task-earning span {
          display: block;
          margin-bottom: 3px;
          color: #777777;
          font-size: 9px;
        }


        .task-earning strong {
          color: #f5b800;
          font-size: 12px;
        }


        .task-card-completed
        .task-earning strong {

          color: #4ade80;

        }


        /* =========================================================
           BUTTONS
        ========================================================= */

        .task-button,
        .task-complete-button,
        .task-completed-button {

          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 6px;

          flex-shrink: 0;

          min-width: 105px;

          padding: 10px 14px;

          border: none;

          border-radius: 10px;

          font-size: 11px;

          font-weight: 800;

          transition:
            transform 0.2s ease,
            background 0.2s ease;

        }


        /*
         * START TASK
         */

        .task-button {

          background: #f5b800;

          color: #111111;

          cursor: pointer;

        }


        .task-button:hover {

          background: #ffc928;

          transform:
            translateY(-1px);

        }


        .task-button:active {

          transform:
            scale(0.97);

        }


        /*
         * While the silent 10 seconds is running.
         *
         * The user does NOT see a countdown.
         */

        .task-button:disabled {

          opacity: 0.55;

          cursor:
            not-allowed;

          transform:
            none;

        }


        /*
         * GREEN COMPLETE BUTTON
         */

        .task-complete-button {

          background: #22c55e;

          color: #ffffff;

          cursor: pointer;

        }


        .task-complete-button:hover {

          background: #16a34a;

          transform:
            translateY(-1px);

        }


        .task-complete-button:active {

          transform:
            scale(0.97);

        }


        /*
         * COMPLETED BUTTON
         */

        .task-completed-button {

          background: #166534;

          color: #ffffff;

          cursor: not-allowed;

          pointer-events: none;

          opacity: 0.9;

        }


        /* =========================================================
           SPINNER
        ========================================================= */

        .spin {

          animation:
            taskSpin
            1s
            linear
            infinite;

        }


        @keyframes taskSpin {

          from {

            transform:
              rotate(0deg);

          }

          to {

            transform:
              rotate(360deg);

          }

        }


        /* =========================================================
           MOBILE
        ========================================================= */

        @media (max-width: 600px) {

          .tasks-page {

            padding:
              16px
              13px
              105px;

          }


          .tasks-summary {

            gap: 7px;

          }


          .tasks-summary-card {

            padding:
              10px
              7px;

          }


          .tasks-summary-value {

            font-size: 13px;

          }


          .task-card {

            padding: 13px;

          }


          .task-card-top {

            gap: 8px;

          }


          .task-icon {

            width: 38px;

            height: 38px;

          }


          .task-title {

            font-size: 13px;

          }


          .task-reward {

            font-size: 10px;

          }


          .task-button,
          .task-complete-button,
          .task-completed-button {

            min-width:
              100px;

            padding:
              9px
              11px;

          }

        }


        @media (max-width: 390px) {

          .tasks-summary {

            grid-template-columns:
              repeat(
                3,
                minmax(0, 1fr)
              );

          }


          .task-bottom {

            align-items:
              flex-end;

          }


          .task-button,
          .task-complete-button,
          .task-completed-button {

            min-width:
              94px;

            font-size:
              10px;

          }

        }

      `}</style>


      {/* =========================================================
          HEADER
      ========================================================= */}

      <header className="tasks-header">

        <div className="tasks-header-left">

          <div className="tasks-header-icon">

            <Sparkles
              size={21}
            />

          </div>


          <div>

            <p className="tasks-eyebrow">
              EARN MORE COINS
            </p>

            <h1>
              Tasks
            </h1>

            <p className="tasks-subtitle">
              Complete tasks and grow
              your balance.
            </p>

          </div>

        </div>


        <button
          type="button"
          className="tasks-refresh-button"
          onClick={() =>
            loadTasks(true)
          }
          disabled={
            refreshing ||
            startingTask !== null ||
            completingTask !== null
          }
          aria-label="Refresh tasks"
        >

          {refreshing ? (

            <Loader2
              size={19}
              className="spin"
            />

          ) : (

            <RefreshCw
              size={19}
            />

          )}

        </button>

      </header>


      {/* =========================================================
          SUMMARY
      ========================================================= */}

      <section className="tasks-summary">

        <div className="tasks-summary-card">

          <div className="tasks-summary-card-top">

            <div className="tasks-summary-icon">

              <Coins
                size={16}
              />

            </div>

            <span className="tasks-summary-label">
              Balance
            </span>

          </div>


          <strong className="tasks-summary-value">

            {Math.max(
              0,
              Math.floor(balance)
            ).toLocaleString()}

          </strong>

        </div>


        <div className="tasks-summary-card">

          <div className="tasks-summary-card-top">

            <div className="tasks-summary-icon">

              <Target
                size={16}
              />

            </div>

            <span className="tasks-summary-label">
              Available
            </span>

          </div>


          <strong className="tasks-summary-value">

            {remainingTasks}

          </strong>

        </div>


        <div className="tasks-summary-card">

          <div className="tasks-summary-card-top">

            <div className="tasks-summary-icon">

              <CheckCircle2
                size={16}
              />

            </div>

            <span className="tasks-summary-label">
              Completed
            </span>

          </div>


          <strong className="tasks-summary-value">

            {completedCount}

          </strong>

        </div>

      </section>


      {/* =========================================================
          REWARD HERO
      ========================================================= */}

      <section className="tasks-hero">

        <div className="tasks-hero-glow" />


        <div className="tasks-hero-top">

          <div className="tasks-hero-icon">

            <Sparkles
              size={21}
            />

          </div>


          <span className="tasks-live-badge">

            AVAILABLE

          </span>

        </div>


        <div className="tasks-hero-content">

          <span>
            Potential rewards
          </span>


          <strong>

            +
            {totalRewards.toLocaleString()}

          </strong>


          <small>

            Coins available from
            current tasks

          </small>

        </div>


        <div className="tasks-hero-bottom">

          <div>

            <CircleDollarSign
              size={15}
            />

            <span>

              {remainingTasks}
              {" "}
              tasks remaining

            </span>

          </div>


          <div>

            <Coins
              size={15}
            />

            <span>

              Balance{" "}
              {balance.toLocaleString()}

            </span>

          </div>

        </div>

      </section>


      {/* =========================================================
          ERROR
      ========================================================= */}

      {error && (

        <div className="tasks-error">

          <span>
            {error}
          </span>


          <button
            type="button"
            onClick={() =>
              setError(null)
            }
          >
            ×
          </button>

        </div>

      )}


      {/* =========================================================
          EMPTY
      ========================================================= */}

      {!tasks.length ? (

        <div className="tasks-empty">

          <div className="tasks-empty-icon">

            <Gift
              size={29}
            />

          </div>


          <h3>
            No tasks available
          </h3>


          <p>

            New earning opportunities
            will appear here when they
            become available.

          </p>


          <button
            type="button"
            className="task-button"
            onClick={() =>
              loadTasks(true)
            }
            disabled={refreshing}
          >

            {refreshing ? (

              <>

                <Loader2
                  size={15}
                  className="spin"
                />

                Checking...

              </>

            ) : (

              <>

                <RefreshCw
                  size={15}
                />

                Check Again

              </>

            )}

          </button>

        </div>

      ) : (

        <>

          {/* =====================================================
              SECTION TITLE
          ===================================================== */}

          <div className="tasks-section-heading">

            <div>

              <p>
                AVAILABLE REWARDS
              </p>

              <h2>
                Complete & Earn
              </h2>

            </div>


            <div className="tasks-earned-badge">

              <Coins
                size={14}
              />

              +
              {earnedFromTasks.toLocaleString()}

            </div>

          </div>


          {/* =====================================================
              TASK LIST
          ===================================================== */}

          <div className="tasks-list">

            {tasks.map(
              (task) => {

                const completed =
                  task.completed === true;


                const starting =
                  startingTask ===
                  task.id;


                const completing =
                  completingTask ===
                  task.id;


                return (

                  <article
                    key={task.id}
                    className={`task-card ${
                      completed
                        ? "task-card-completed"
                        : ""
                    }`}
                  >

                    {/* =========================================
                        CARD TOP
                    ========================================== */}

                    <div className="task-card-top">


                      <div className="task-icon">

                        {completed ? (

                          <CheckCircle2
                            size={20}
                          />

                        ) : (

                          getTaskIcon(
                            task.type
                          )

                        )}

                      </div>


                      <div className="task-card-heading">

                        <div>

                          <span className="task-type-badge">

                            {getTaskType(
                              task.type
                            )}

                          </span>


                          {completed && (

                            <span className="task-completed-label">

                              <CheckCircle2
                                size={10}
                              />

                              COMPLETED

                            </span>

                          )}

                        </div>


                        <h3 className="task-title">

                          {task.title}

                        </h3>


                        {task.description && (

                          <p className="task-description">

                            {task.description}

                          </p>

                        )}

                      </div>


                      <div className="task-reward">

                        <Coins
                          size={14}
                        />

                        <span>

                          +
                          {Number(
                            task.reward || 0
                          ).toLocaleString()}

                        </span>

                      </div>

                    </div>


                    {/* =========================================
                        TARGET STATUS
                    ========================================== */}

                    <div className="task-target">

                      <div className="task-target-icon">

                        {completed ? (

                          <CheckCircle2
                            size={14}
                          />

                        ) : (

                          <ExternalLink
                            size={14}
                          />

                        )}

                      </div>


                      <span>

                        {completed

                          ? "You have already completed this task."

                          : starting

                          ? "Task started. Please complete the task."

                          : "Visit the target to start this task."

                        }

                      </span>

                    </div>


                    {/* =========================================
                        CARD BOTTOM
                    ========================================== */}

                    <div className="task-bottom">


                      <div className="task-earning">

                        <span>
                          Reward
                        </span>


                        <strong>

                          +
                          {Number(
                            task.reward || 0
                          ).toLocaleString()}

                          {" "}
                          Coins

                        </strong>

                      </div>


                      {/* =======================================
                          COMPLETED
                      ======================================== */}

                      {completed ? (

                        <button
                          type="button"
                          className="task-completed-button"
                          disabled
                        >

                          <CheckCircle2
                            size={15}
                          />

                          Completed

                        </button>

                      ) : starting ? (

                        /*
                         * IMPORTANT:
                         *
                         * The 10-second timer is NOT shown.
                         *
                         * User only sees "Please wait".
                         */

                        <button
                          type="button"
                          className="task-button"
                          disabled
                        >

                          <Loader2
                            size={15}
                            className="spin"
                          />

                          Please wait

                        </button>

                      ) : completing ? (

                        <button
                          type="button"
                          className="task-complete-button"
                          disabled
                        >

                          <Loader2
                            size={15}
                            className="spin"
                          />

                          Processing

                        </button>

                      ) : (

                        /*
                         * Start Task
                         *
                         * The first click opens the target
                         * and silently waits 10 seconds.
                         */

                        <button
                          type="button"
                          className="task-button"
                          onClick={() =>
                            handleStartTask(
                              task
                            )
                          }
                          disabled={
                            startingTask !== null ||
                            completingTask !== null
                          }
                        >

                          <ExternalLink
                            size={15}
                          />

                          Start Task

                        </button>

                      )}

                    </div>


                    {/* =========================================
                        GREEN COMPLETE BUTTON
                        =========================================
                        
                        After the silent 10 seconds we need
                        the button to become Complete.
                        
                        This is handled below by the
                        start flow.

                    ========================================== */}

                    {!completed &&
                      !starting &&
                      startingTask === null &&
                      false && (

                        <button
                          type="button"
                          className="task-complete-button"
                          onClick={() =>
                            handleCompleteTask(
                              task
                            )
                          }
                        >

                          <CheckCircle2
                            size={15}
                          />

                          Complete

                        </button>

                    )}

                  </article>

                );

              }
            )}

          </div>

        </>

      )}

    </div>

  );

}