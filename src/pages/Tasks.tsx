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
  Megaphone,
} from "lucide-react";

import WatchAdButton from "../components/WatchAdButton";

import {
  completeTask,
  getTasks,
  startTask,
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
   * Telegram advertisement fields
   */
  image_url?: string | null;
  advertiser?: string | null;

  completed?: boolean;
  ready_to_claim?: boolean;
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
| TELEGRAM AD CARD
|--------------------------------------------------------------------------
*/

function TelegramAdCard({
  task,
  completed,
  processing,
  ready,
  starting,
  remaining,
  errorMessage,
  onStart,
  onComplete,
}: {
  task: Task;
  completed: boolean;
  processing: boolean;
  ready: boolean;
  starting: boolean;
  remaining: number;
  errorMessage: string | null;
  onStart: () => void;
  onComplete: () => void;
}) {
  const [
    imageFailed,
    setImageFailed,
  ] = useState(false);

  return (
    <article
      className={`telegram-ad-card ${
        completed
          ? "telegram-ad-card-completed"
          : ""
      }`}
    >
      {/* HEADER */}

      <div className="telegram-ad-header">

        <div className="telegram-ad-profile">

          <div className="telegram-ad-avatar">

            {task.image_url &&
            !imageFailed ? (
              <img
                src={task.image_url}
                alt=""
                onError={() =>
                  setImageFailed(true)
                }
              />
            ) : (
              <Send size={19} />
            )}

          </div>

          <div className="telegram-ad-author">

            <strong>
              {task.advertiser ||
                "Sponsored Channel"}
            </strong>

            <span>
              Sponsored
            </span>

          </div>

        </div>

        <div className="telegram-ad-more">
          •••
        </div>

      </div>

      {/* IMAGE */}

      {task.image_url &&
      !imageFailed && (
        <button
          type="button"
          className="telegram-ad-image"
          onClick={onStart}
          disabled={
            completed ||
            starting ||
            processing ||
            remaining > 0
          }
        >
          <img
            src={task.image_url}
            alt={task.title}
            onError={() =>
              setImageFailed(true)
            }
          />
        </button>
      )}

      {/* CONTENT */}

      <div className="telegram-ad-content">

        <div className="telegram-ad-sponsored">

          <Megaphone size={11} />

          <span>
            Sponsored
          </span>

        </div>

        <h3>
          {task.title}
        </h3>

        {task.description && (
          <p>
            {task.description}
          </p>
        )}

      </div>

      {/* TARGET */}

      <div className="telegram-ad-target">

        <div className="telegram-ad-target-icon">

          <Send size={13} />

        </div>

        <div>

          <span>
            Telegram Channel
          </span>

          <strong>
            {task.target
              ?.replace(
                "https://t.me/",
                "@"
              )
              .replace(
                "http://t.me/",
                "@"
              ) ||
              "Telegram Channel"}
          </strong>

        </div>

      </div>

      {/* REWARD */}

      <div className="telegram-ad-reward">

        <div>

          <span>
            Task reward
          </span>

          <strong>
            +
            {Number(
              task.reward || 0
            ).toLocaleString()}{" "}
            Coins
          </strong>

        </div>

        {completed && (
          <div className="telegram-ad-completed-badge">

            <CheckCircle2 size={12} />

            Completed

          </div>
        )}

      </div>

      {/* ERROR */}

      {errorMessage &&
      !completed && (
        <div className="telegram-ad-error">
          {errorMessage}
        </div>
      )}

      {/* ACTIONS */}

      <div className="telegram-ad-actions">

        {completed ? (

          <button
            type="button"
            className="telegram-ad-complete telegram-ad-complete-done"
            disabled
          >
            <CheckCircle2 size={15} />
            Completed
          </button>

        ) : processing ? (

          <button
            type="button"
            className="telegram-ad-complete"
            disabled
          >
            <Loader2
              size={15}
              className="spin"
            />
            Processing...
          </button>

        ) : starting ? (

          <button
            type="button"
            className="telegram-ad-open"
            disabled
          >
            <Loader2
              size={15}
              className="spin"
            />
            Starting...
          </button>

        ) : remaining > 0 ? (

          <button
            type="button"
            className="telegram-ad-complete"
            disabled
          >
            <Loader2
              size={15}
              className="spin"
            />
            Claim in {remaining}s
          </button>

        ) : ready ? (

          <>
            <button
              type="button"
              className="telegram-ad-open telegram-ad-open-secondary"
              onClick={onStart}
            >
              <ExternalLink size={14} />
              Open Channel
            </button>

            <button
              type="button"
              className="telegram-ad-complete"
              onClick={onComplete}
            >
              <CheckCircle2 size={15} />
              Claim Reward
            </button>
          </>

        ) : (

          <button
            type="button"
            className="telegram-ad-open"
            onClick={onStart}
          >
            <ExternalLink size={14} />
            Open Channel
          </button>

        )}

      </div>

    </article>
  );
}

/*
|--------------------------------------------------------------------------
| MAIN TASK COMPONENT
|--------------------------------------------------------------------------
*/

export default function Tasks({
  balance = 0,
  setBalance,
}: TasksProps) {

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
    readyToComplete,
    setReadyToComplete,
  ] = useState<Set<string>>(
    new Set()
  );

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    waitUntil,
    setWaitUntil,
  ] = useState<Record<string, number>>({});

  const [
    now,
    setNow,
  ] = useState(() => Date.now());

  const [
    taskErrors,
    setTaskErrors,
  ] = useState<Record<string, string>>({});

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

      const taskList: Task[] =
        Array.isArray(result)
          ? result
          : Array.isArray(
              (result as any)?.tasks
            )
          ? (result as any).tasks
          : [];

      setTasks(taskList);

      setReadyToComplete(
        (previous) => {

          const next =
            new Set(previous);

          taskList.forEach(
            (task) => {

              if (
                task.completed === true
              ) {
                next.delete(
                  task.id
                );
              } else if (
                task.ready_to_claim
              ) {
                next.add(
                  task.id
                );
              }

            }
          );

          return next;
        }
      );

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
  | COUNTDOWN
  |--------------------------------------------------------------------------
  */

  const hasWaiting =
    Object.values(waitUntil).some(
      (end) => end > now
    );

  useEffect(() => {

    if (!hasWaiting) {
      return;
    }

    setNow(Date.now());

    const timer =
      window.setInterval(() => {
        setNow(Date.now());
      }, 500);

    return () => {
      window.clearInterval(timer);
    };

  }, [hasWaiting]);

  /*
  |--------------------------------------------------------------------------
  | REFRESH WHEN RETURNING
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    function refreshOnReturn() {

      if (
        document.visibilityState ===
        "visible"
      ) {
        loadTasks(true);
      }

    }

    document.addEventListener(
      "visibilitychange",
      refreshOnReturn
    );

    window.addEventListener(
      "focus",
      refreshOnReturn
    );

    return () => {

      document.removeEventListener(
        "visibilitychange",
        refreshOnReturn
      );

      window.removeEventListener(
        "focus",
        refreshOnReturn
      );

    };

  }, []);

  /*
  |--------------------------------------------------------------------------
  | COUNTS
  |--------------------------------------------------------------------------
  */

  const completedCount =
    tasks.filter(
      (task) =>
        task.completed === true
    ).length;

  const remainingTasks =
    tasks.filter(
      (task) =>
        task.completed !== true
    ).length;

  /*
  |--------------------------------------------------------------------------
  | TOTAL AVAILABLE REWARDS
  |--------------------------------------------------------------------------
  */

  const totalRewards =
    tasks
      .filter(
        (task) =>
          task.completed !== true
      )
      .reduce(
        (
          total,
          task
        ) =>
          total +
          Number(
            task.reward || 0
          ),
        0
      );

  /*
  |--------------------------------------------------------------------------
  | EARNED REWARDS
  |--------------------------------------------------------------------------
  */

  const earnedFromTasks =
    tasks
      .filter(
        (task) =>
          task.completed === true
      )
      .reduce(
        (
          total,
          task
        ) =>
          total +
          Number(
            task.reward || 0
          ),
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
          <Send size={19} />
        );

      case "telegram_ad":

        return (
          <Megaphone size={19} />
        );

      case "website":

        return (
          <Globe size={19} />
        );

      case "social":
      case "facebook":
      case "instagram":
      case "youtube":

        return (
          <Users size={19} />
        );

      default:

        return (
          <Target size={19} />
        );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | TASK TYPE
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

      case "telegram_ad":
        return "Sponsored";

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
  | OPEN TARGET
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

    if (
      url.startsWith("@")
    ) {

      url =
        `https://t.me/${url.substring(1)}`;

    } else if (
      url.startsWith("t.me/")
    ) {

      url =
        `https://${url}`;

    } else if (
      url.startsWith(
        "telegram.me/"
      )
    ) {

      url =
        `https://${url}`;

    } else if (
      !url.startsWith(
        "http://"
      ) &&
      !url.startsWith(
        "https://"
      )
    ) {

      url =
        `https://t.me/${url}`;

    }

    const webApp =
      (window as any).Telegram?.WebApp;

    if (
      webApp?.openTelegramLink &&
      /^https:\/\/(t|telegram)\.me\//.test(
        url
      )
    ) {

      webApp.openTelegramLink(url);

    } else if (
      webApp?.openLink
    ) {

      webApp.openLink(url);

    } else {

      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | TASK ERROR
  |--------------------------------------------------------------------------
  */

  function setTaskError(
    taskId: string,
    message: string | null
  ) {

    setTaskErrors(
      (previous) => {

        const next = {
          ...previous,
        };

        if (message) {
          next[taskId] =
            message;
        } else {
          delete next[taskId];
        }

        return next;
      }
    );
  }

  /*
  |--------------------------------------------------------------------------
  | START TASK
  |--------------------------------------------------------------------------
  */

  async function handleStartTask(
    task: Task
  ) {

    if (
      task.completed === true
    ) {
      return;
    }

    if (
      startingTask ||
      completingTask
    ) {
      return;
    }

    try {

      setError(null);

      setTaskError(
        task.id,
        null
      );

      setStartingTask(
        task.id
      );

      const {
        waitSeconds,
      } =
        await startTask(
          task.id
        );

      const wait =
        Math.max(
          0,
          Number(
            waitSeconds
          ) || 0
        );

      openTaskTarget(
        task.target
      );

      if (wait > 0) {

        setNow(
          Date.now()
        );

        setWaitUntil(
          (previous) => ({
            ...previous,
            [task.id]:
              Date.now() +
              wait * 1000,
          })
        );

      } else {

        setReadyToComplete(
          (previous) => {

            const next =
              new Set(previous);

            next.add(
              task.id
            );

            return next;
          }
        );
      }

    } catch (err) {

      console.error(
        "Start task error:",
        err
      );

      setTaskError(
        task.id,
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
  */

  async function handleCompleteTask(
    task: Task
  ) {

    if (
      task.completed === true
    ) {
      return;
    }

    if (
      completingTask ||
      startingTask
    ) {
      return;
    }

    try {

      setError(null);

      setTaskError(
        task.id,
        null
      );

      setCompletingTask(
        task.id
      );

      const result =
        await completeTask(
          task.id
        );

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

      setReadyToComplete(
        (previous) => {

          const next =
            new Set(previous);

          next.delete(
            task.id
          );

          return next;
        }
      );

      setWaitUntil(
        (previous) => {

          const next = {
            ...previous,
          };

          delete next[task.id];

          return next;
        }
      );

      await loadTasks();

    } catch (err) {

      console.error(
        "Task completion failed:",
        err
      );

      const message =
        err instanceof Error
          ? err.message
          : "Could not complete task";

      setTaskError(
        task.id,
        message
      );

      if (
        message.includes(
          "Open the task first"
        )
      ) {

        setReadyToComplete(
          (previous) => {

            const next =
              new Set(previous);

            next.delete(
              task.id
            );

            return next;
          }
        );

        setWaitUntil(
          (previous) => {

            const next = {
              ...previous,
            };

            delete next[task.id];

            return next;
          }
        );
      }

    } finally {

      setCompletingTask(
        null
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | LOADING
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
            color: #ffffff;
          }

          .tasks-loading strong {
            color: #ffffff;
            font-size: 16px;
          }

          .tasks-loading span {
            font-size: 12px;
          }

          .spin {
            animation:
              taskSpin 1s linear infinite;
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

        .tasks-page {
          width: 100%;
          min-height: 100%;
          padding: 18px 16px 110px;
          box-sizing: border-box;
          color: var(--text, #ffffff);
        }

        .tasks-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }

        .tasks-header-left {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .tasks-header-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(245,184,0,0.13);
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
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .tasks-subtitle {
          margin: 4px 0 0;
          color: #ffffff;
          font-size: 11px;
        }

        .tasks-refresh-button {
          width: 40px;
          height: 40px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 11px;
          background: rgba(255,255,255,0.04);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .tasks-refresh-button:hover {
          color: #f5b800;
          background: rgba(245,184,0,0.09);
        }

        .tasks-refresh-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .tasks-summary {
          display: grid;
          grid-template-columns:
            repeat(3,minmax(0,1fr));
          gap: 8px;
          margin-bottom: 13px;
        }

        .tasks-summary-card {
          padding: 10px 8px;
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          min-width: 0;
        }

        .tasks-summary-card-top {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 5px;
        }

        .tasks-summary-icon {
          width: 26px;
          height: 26px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(245,184,0,0.11);
          color: #f5b800;
          flex-shrink: 0;
        }

        .tasks-summary-label {
          display: block;
          color: #ffffff;
          font-size: 9px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tasks-summary-value {
          display: block;
          color: #ffffff;
          font-size: 14px;
          font-weight: 800;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tasks-hero {
          position: relative;
          overflow: hidden;
          padding: 14px;
          margin-bottom: 14px;
          border-radius: 15px;
          background: linear-gradient(
            135deg,
            rgba(245,184,0,0.14),
            rgba(245,184,0,0.035)
          );
          border: 1px solid rgba(245,184,0,0.14);
        }

        .tasks-hero-glow {
          position: absolute;
          width: 120px;
          height: 120px;
          right: -55px;
          top: -60px;
          border-radius: 50%;
          background: rgba(245,184,0,0.13);
          filter: blur(20px);
        }

        .tasks-hero-top {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .tasks-hero-icon {
          width: 37px;
          height: 37px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f5b800;
          background: rgba(245,184,0,0.12);
        }

        .tasks-live-badge {
          padding: 5px 8px;
          border-radius: 7px;
          background: rgba(34,197,94,0.12);
          color: #4ade80;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .tasks-hero-content {
          position: relative;
          margin-top: 10px;
        }

        .tasks-hero-content span {
          display: block;
          color: #ffffff;
          font-size: 10px;
        }

        .tasks-hero-content strong {
          display: block;
          margin-top: 2px;
          color: #f5b800;
          font-size: 25px;
          font-weight: 900;
        }

        .tasks-hero-content small {
          color: #777777;
          font-size: 9px;
        }

        .tasks-hero-bottom {
          position: relative;
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: 11px;
          padding-top: 9px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .tasks-hero-bottom div {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #ffffff;
          font-size: 9px;
        }

        .tasks-hero-bottom svg {
          color: #f5b800;
        }

        .tasks-error {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
          padding: 10px 12px;
          border-radius: 10px;
          background: rgba(239,68,68,0.09);
          border: 1px solid rgba(239,68,68,0.18);
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

        .tasks-empty {
          padding: 40px 20px;
          border-radius: 16px;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.06);
          text-align: center;
        }

        .tasks-empty-icon {
          width: 58px;
          height: 58px;
          margin: 0 auto 13px;
          border-radius: 17px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(245,184,0,0.1);
          color: #f5b800;
        }

        .tasks-empty h3 {
          margin: 0 0 6px;
          font-size: 16px;
        }

        .tasks-empty p {
          max-width: 320px;
          margin: 0 auto 16px;
          color: #ffffff;
          font-size: 11px;
          line-height: 1.6;
        }

        .tasks-section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: 17px 0 10px;
        }

        .tasks-section-heading p {
          margin: 0 0 3px;
          color: #ffffff;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .tasks-section-heading h2 {
          margin: 0;
          font-size: 16px;
        }

        .tasks-earned-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 8px;
          border-radius: 8px;
          background: rgba(34,197,94,0.1);
          color: #4ade80;
          font-size: 9px;
          font-weight: 800;
        }

        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /*
        |--------------------------------------------------------------------------
        | NORMAL TASK CARD
        |--------------------------------------------------------------------------
        */

        .task-card {
          padding: 13px;
          border-radius: 15px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          transition:
            opacity 0.2s ease,
            border-color 0.2s ease,
            background 0.2s ease;
        }

        .task-card:hover {
          border-color: rgba(245,184,0,0.16);
        }

        .task-card-completed {
          opacity: 0.48;
          border-color: rgba(34,197,94,0.12);
          background: rgba(34,197,94,0.025);
        }

        .task-card-top {
          display: flex;
          align-items: flex-start;
          gap: 9px;
        }

        .task-icon {
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(245,184,0,0.11);
          color: #f5b800;
        }

        .task-card-completed .task-icon {
          background: rgba(34,197,94,0.1);
          color: #4ade80;
        }

        .task-card-heading {
          flex: 1;
          min-width: 0;
        }

        .task-title {
          margin: 0;
          color: #ffffff;
          font-size: 13px;
          font-weight: 750;
          line-height: 1.35;
        }

        .task-description {
          margin: 4px 0 0;
          color: #ffffff;
          font-size: 10px;
          line-height: 1.45;
        }

        .task-type-badge {
          display: inline-flex;
          margin-bottom: 4px;
          padding: 3px 6px;
          border-radius: 6px;
          background: rgba(255,255,255,0.06);
          color: #ffffff;
          font-size: 8px;
          font-weight: 700;
        }

        .task-completed-label {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-left: 5px;
          padding: 3px 6px;
          border-radius: 6px;
          background: rgba(34,197,94,0.1);
          color: #4ade80;
          font-size: 8px;
          font-weight: 800;
        }

        .task-reward {
          display: flex;
          align-items: center;
          gap: 3px;
          flex-shrink: 0;
          color: #f5b800;
          font-size: 11px;
          font-weight: 800;
        }

        .task-target {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 11px;
          padding: 8px 10px;
          border-radius: 8px;
          background: rgba(255,255,255,0.035);
          color: #ffffff;
          font-size: 9px;
        }

        .task-target-icon {
          display: flex;
          color: #ffffff;
        }

        .task-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 11px;
        }

        .task-earning {
          min-width: 0;
        }

        .task-earning span {
          display: block;
          margin-bottom: 2px;
          color: #f8f5f5;
          font-size: 8px;
        }

        .task-earning strong {
          color: #f5b800;
          font-size: 11px;
        }

        .task-card-completed
        .task-earning strong {
          color: #4ade80;
        }

        .task-button,
        .task-complete-button,
        .task-completed-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          flex-shrink: 0;
          min-width: 102px;
          padding: 9px 12px;
          border: none;
          border-radius: 9px;
          font-size: 10px;
          font-weight: 800;
          transition:
            transform 0.2s ease,
            background 0.2s ease;
        }

        .task-button {
          background: #f5b800;
          color: #111111;
          cursor: pointer;
        }

        .task-button:hover {
          background: #ffc928;
          transform: translateY(-1px);
        }

        .task-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        .task-complete-button {
          background: #22c55e;
          color: #ffffff;
          cursor: pointer;
        }

        .task-complete-button:hover {
          background: #16a34a;
          transform: translateY(-1px);
        }

        .task-complete-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        .task-completed-button {
          background: #166534;
          color: #ffffff;
          cursor: not-allowed;
          pointer-events: none;
          opacity: 0.9;
        }

        /*
        |--------------------------------------------------------------------------
        | COMPACT TELEGRAM AD CARD
        |--------------------------------------------------------------------------
        */

        .telegram-ad-card {
          overflow: hidden;
          border-radius: 14px;
          background: #2e2b2b;
          color: #111111;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow:
            0 6px 22px rgba(0,0,0,0.16);
          transition:
            transform 0.2s ease,
            opacity 0.2s ease,
            box-shadow 0.2s ease;
        }

        .telegram-ad-card:hover {
          transform: translateY(-1px);
          box-shadow:
            0 9px 26px rgba(0,0,0,0.21);
        }

        .telegram-ad-card-completed {
          opacity: 0.55;
        }

        .telegram-ad-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 10px 12px 9px;
        }

        .telegram-ad-profile {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .telegram-ad-avatar {
          width: 35px;
          height: 35px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #229ed9;
          color: #ffffff;
        }

        .telegram-ad-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .telegram-ad-author {
          min-width: 0;
        }

        .telegram-ad-author strong {
          display: block;
          overflow: hidden;
          color: #ffffff;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .telegram-ad-author span {
          display: block;
          margin-top: 1px;
          color: #dddddd;
          font-size: 9px;
        }

        .telegram-ad-more {
          color: #ffffff;
          font-size: 14px;
          letter-spacing: 1px;
        }

        /*
        |--------------------------------------------------------------------------
        | REDUCED IMAGE HEIGHT
        |--------------------------------------------------------------------------
        */

        .telegram-ad-image {
          display: block;
          width: 100%;
          height: 170px;
          padding: 0;
          border: none;
          background: #444444;
          cursor: pointer;
          overflow: hidden;
        }

        .telegram-ad-image img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .telegram-ad-content {
          padding: 10px 12px 3px;
        }

        .telegram-ad-sponsored {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          margin-bottom: 4px;
          color: #229ed9;
          font-size: 8px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .telegram-ad-content h3 {
          margin: 0;
          color: #ffffff;
          font-size: 14px;
          line-height: 1.3;
          font-weight: 800;
        }

        .telegram-ad-content p {
          margin: 4px 0 0;
          color: #eeeeee;
          font-size: 10px;
          line-height: 1.4;

          /*
           * Prevent very long descriptions
           * from making cards too tall.
           */
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .telegram-ad-target {
          display: flex;
          align-items: center;
          gap: 7px;
          margin: 9px 12px 0;
          padding: 7px 8px;
          border-radius: 8px;
          background: #474643;
        }

        .telegram-ad-target-icon {
          width: 27px;
          height: 27px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: #229ed9;
          color: #ffffff;
        }

        .telegram-ad-target div:last-child {
          min-width: 0;
        }

        .telegram-ad-target span {
          display: block;
          color: #ffffff;
          font-size: 7px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .telegram-ad-target strong {
          display: block;
          margin-top: 1px;
          overflow: hidden;
          color: #ffffff;
          font-size: 10px;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .telegram-ad-reward {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin: 9px 12px 0;
          padding-top: 8px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .telegram-ad-reward span {
          display: block;
          color: #dddddd;
          font-size: 8px;
        }

        .telegram-ad-reward strong {
          display: block;
          margin-top: 1px;
          color: #f0a900;
          font-size: 12px;
          font-weight: 900;
        }

        .telegram-ad-completed-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 7px;
          border-radius: 6px;
          background: rgba(34,197,94,0.12);
          color: #4ade80;
          font-size: 8px;
          font-weight: 800;
        }

        .telegram-ad-actions {
          display: flex;
          gap: 7px;
          padding: 9px 12px 11px;
        }

        .telegram-ad-open,
        .telegram-ad-complete {
          flex: 1;
          min-height: 35px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          border: none;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            opacity 0.2s ease;
        }

        .telegram-ad-open {
          background: #229ed9;
          color: #ffffff;
        }

        .telegram-ad-open:hover {
          transform: translateY(-1px);
          background: #1c8ac0;
        }

        .telegram-ad-complete {
          background: #22c55e;
          color: #ffffff;
        }

        .telegram-ad-complete:hover {
          transform: translateY(-1px);
          background: #16a34a;
        }

        .telegram-ad-complete-done {
          background: #e9f8ef;
          color: #169447;
          cursor: not-allowed;
        }

        .telegram-ad-open:disabled,
        .telegram-ad-complete:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        .telegram-ad-error {
          margin: 8px 12px 0;
          padding: 8px 9px;
          border-radius: 8px;
          background: #fdecec;
          color: #c0392b;
          font-size: 10px;
          line-height: 1.4;
        }

        .telegram-ad-open-secondary {
          background: #eaf4fa;
          color: #1c8ac0;
        }

        .telegram-ad-open-secondary:hover {
          background: #dcedf7;
        }

        /*
        |--------------------------------------------------------------------------
        | MOBILE
        |--------------------------------------------------------------------------
        */

        @media (max-width: 600px) {

          .tasks-page {
            padding: 15px 12px 105px;
          }

          .telegram-ad-image {
            height: 145px;
          }

          .telegram-ad-header {
            padding: 9px 11px 8px;
          }

          .telegram-ad-content {
            padding: 9px 11px 3px;
          }

          .telegram-ad-target {
            margin-left: 11px;
            margin-right: 11px;
          }

          .telegram-ad-reward {
            margin-left: 11px;
            margin-right: 11px;
          }

          .telegram-ad-actions {
            padding-left: 11px;
            padding-right: 11px;
            padding-bottom: 10px;
          }

          .task-card {
            padding: 12px;
          }

          .task-icon {
            width: 37px;
            height: 37px;
          }

        }

        @media (max-width: 390px) {

          .telegram-ad-image {
            height: 130px;
          }

          .telegram-ad-actions {
            flex-direction: column;
          }

          .telegram-ad-open,
          .telegram-ad-complete {
            width: 100%;
            min-height: 34px;
          }

          .task-bottom {
            align-items: flex-end;
          }

          .task-button,
          .task-complete-button,
          .task-completed-button {
            min-width: 94px;
            font-size: 10px;
          }

        }

      `}</style>

      {/* HEADER */}

      <header className="tasks-header">

        <div className="tasks-header-left">

          <div className="tasks-header-icon">
            <Sparkles size={20} />
          </div>

          <div>

            <p className="tasks-eyebrow">
              EARN MORE COINS
            </p>

            <h1>
              Tasks
            </h1>

            <p className="tasks-subtitle">
              Complete tasks and grow your balance.
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
              size={18}
              className="spin"
            />
          ) : (
            <RefreshCw size={18} />
          )}

        </button>

      </header>

      {/* SUMMARY */}

      <section className="tasks-summary">

        <div className="tasks-summary-card">

          <div className="tasks-summary-card-top">

            <div className="tasks-summary-icon">
              <Coins size={15} />
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
              <Target size={15} />
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
              <CheckCircle2 size={15} />
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

      {/* HERO */}

      <section className="tasks-hero">

        <div className="tasks-hero-glow" />

        <div className="tasks-hero-top">

          <div className="tasks-hero-icon">
            <Sparkles size={20} />
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
            Coins available from current tasks
          </small>

        </div>

        <div className="tasks-hero-bottom">

          <div>

            <CircleDollarSign size={14} />

            <span>
              {remainingTasks} tasks remaining
            </span>

          </div>

          <div>

            <Coins size={14} />

            <span>
              Balance{" "}
              {balance.toLocaleString()}
            </span>

          </div>

        </div>

      </section>

      {/* ERROR */}

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

      {/* EMPTY */}

      {!tasks.length ? (

        <div className="tasks-empty">

          <div className="tasks-empty-icon">
            <Gift size={28} />
          </div>

          <h3>
            No tasks available
          </h3>

          <p>
            New earning opportunities will
            appear here when they become
            available.
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
                  size={14}
                  className="spin"
                />
                Checking...
              </>

            ) : (

              <>
                <RefreshCw size={14} />
                Check Again
              </>

            )}

          </button>

        </div>

      ) : (

        <>

          {/* WATCH AD */}

          {setBalance && (
            <WatchAdButton
              setBalance={setBalance}
            />
          )}

          {/* SECTION TITLE */}

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

              <Coins size={13} />

              +
              {earnedFromTasks.toLocaleString()}

            </div>

          </div>

          {/* TASK LIST */}

          <div className="tasks-list">

            {tasks.map(
              (task) => {

                const completed =
                  task.completed === true;

                const starting =
                  startingTask === task.id;

                const completing =
                  completingTask === task.id;

                const waitEnd =
                  waitUntil[task.id];

                const remaining =
                  waitEnd
                    ? Math.max(
                        0,
                        Math.ceil(
                          (waitEnd - now) /
                          1000
                        )
                      )
                    : 0;

                const waiting =
                  remaining > 0;

                const ready =
                  readyToComplete.has(
                    task.id
                  ) ||
                  (
                    waitEnd !== undefined &&
                    remaining === 0
                  );

                const taskError =
                  taskErrors[task.id] ||
                  null;

                /*
                |--------------------------------------------------------------------------
                | TELEGRAM AD
                |--------------------------------------------------------------------------
                */

                if (
                  task.type ===
                  "telegram_ad"
                ) {

                  return (
                    <TelegramAdCard
                      key={task.id}
                      task={task}
                      completed={completed}
                      processing={completing}
                      ready={ready}
                      starting={starting}
                      remaining={remaining}
                      errorMessage={taskError}
                      onStart={() =>
                        handleStartTask(
                          task
                        )
                      }
                      onComplete={() =>
                        handleCompleteTask(
                          task
                        )
                      }
                    />
                  );

                }

                /*
                |--------------------------------------------------------------------------
                | NORMAL TASK
                |--------------------------------------------------------------------------
                */

                return (

                  <article
                    key={task.id}
                    className={`task-card ${
                      completed
                        ? "task-card-completed"
                        : ""
                    }`}
                  >

                    <div className="task-card-top">

                      <div className="task-icon">

                        {completed ? (

                          <CheckCircle2
                            size={19}
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

                        <Coins size={13} />

                        <span>
                          +
                          {Number(
                            task.reward || 0
                          ).toLocaleString()}
                        </span>

                      </div>

                    </div>

                    <div className="task-target">

                      <div className="task-target-icon">

                        {completed ||
                        ready ? (

                          <CheckCircle2
                            size={13}
                          />

                        ) : (

                          <ExternalLink
                            size={13}
                          />

                        )}

                      </div>

                      <span>

                        {completed
                          ? "You have already completed this task."
                          : starting
                          ? "Starting task..."
                          : waiting
                          ? `Task started. You can claim in ${remaining}s.`
                          : taskError
                          ? taskError
                          : ready
                          ? "Task ready. Click Complete to claim your reward."
                          : "Visit the target to start this task."}

                      </span>

                    </div>

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

                      {completed ? (

                        <button
                          type="button"
                          className="task-completed-button"
                          disabled
                        >
                          <CheckCircle2 size={14} />
                          Completed
                        </button>

                      ) : starting ? (

                        <button
                          type="button"
                          className="task-button"
                          disabled
                        >
                          <Loader2
                            size={14}
                            className="spin"
                          />
                          Please wait
                        </button>

                      ) : waiting ? (

                        <button
                          type="button"
                          className="task-button"
                          disabled
                        >
                          <Loader2
                            size={14}
                            className="spin"
                          />
                          Claim in {remaining}s
                        </button>

                      ) : completing ? (

                        <button
                          type="button"
                          className="task-complete-button"
                          disabled
                        >
                          <Loader2
                            size={14}
                            className="spin"
                          />
                          Processing
                        </button>

                      ) : ready ? (

                        <button
                          type="button"
                          className="task-complete-button"
                          onClick={() =>
                            handleCompleteTask(
                              task
                            )
                          }
                        >
                          <CheckCircle2 size={14} />
                          Complete
                        </button>

                      ) : (

                        <button
                          type="button"
                          className="task-button"
                          onClick={() =>
                            handleStartTask(
                              task
                            )
                          }
                          disabled={
                            startingTask !==
                              null ||
                            completingTask !==
                              null
                          }
                        >
                          <ExternalLink size={14} />
                          Start Task
                        </button>

                      )}

                    </div>

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