
import {
  useEffect,
  useMemo,
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

interface Task {
  id: string;
  title: string;
  description: string | null;
  type: string;
  target: string;
  reward: number;
}

interface TasksProps {
  balance?: number;
  setBalance?: React.Dispatch<
    React.SetStateAction<number>
  >;
}

export default function Tasks({
  balance = 0,
  setBalance,
}: TasksProps) {
  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [completingTask, setCompletingTask] =
    useState<string | null>(null);

  const [completedTasks, setCompletedTasks] =
    useState<string[]>([]);

  const [error, setError] =
    useState<string | null>(null);

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

      const result = await getTasks();

      setTasks(result || []);
    } catch (error) {
      console.error(
        "Could not load tasks:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
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
  | TASK TOTALS
  |--------------------------------------------------------------------------
  */

  const totalRewards = useMemo(() => {
    return tasks.reduce(
      (total, task) =>
        total + Number(task.reward || 0),
      0
    );
  }, [tasks]);

  const remainingTasks = tasks.filter(
    (task) =>
      !completedTasks.includes(task.id)
  ).length;

  const earnedFromTasks = tasks
    .filter((task) =>
      completedTasks.includes(task.id)
    )
    .reduce(
      (total, task) =>
        total + Number(task.reward || 0),
      0
    );

  /*
  |--------------------------------------------------------------------------
  | TASK ICON
  |--------------------------------------------------------------------------
  */

  function getTaskIcon(type: string) {
    switch (type) {
      case "telegram_channel":
      case "telegram_group":
      case "telegram_bot":
      case "telegram_post":
      case "telegram":
        return <Send size={21} />;

      case "website":
        return <Globe size={21} />;

      case "social":
        return <Users size={21} />;

      default:
        return <Target size={21} />;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | TASK TYPE
  |--------------------------------------------------------------------------
  */

  function getTaskType(type: string) {
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
  | OPEN TARGET
  |--------------------------------------------------------------------------
  */

  function openTaskTarget(
    target: string
  ) {
    if (!target) {
      return;
    }

    let url = target.trim();

    if (url.startsWith("@")) {
      url =
        `https://t.me/${url.substring(1)}`;
    } else if (
      !url.startsWith("http://") &&
      !url.startsWith("https://")
    ) {
      if (url.startsWith("t.me/")) {
        url = `https://${url}`;
      } else {
        url = `https://t.me/${url}`;
      }
    }

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
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
      completingTask ||
      completedTasks.includes(task.id)
    ) {
      return;
    }

    try {
      setCompletingTask(task.id);
      setError(null);

      openTaskTarget(task.target);

      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );

      const result =
        await completeTask(task.id);

      setCompletedTasks((current) => {
        if (current.includes(task.id)) {
          return current;
        }

        return [
          ...current,
          task.id,
        ];
      });

      if (
        setBalance &&
        result?.balance !== undefined
      ) {
        setBalance(
          Number(result.balance)
        );
      }
    } catch (error) {
      console.error(
        "Task completion failed:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Could not complete task"
      );
    } finally {
      setCompletingTask(null);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="page tasks-page">

        <div className="tasks-header">
          <div>
            <p className="page-eyebrow">
              EARN MORE
            </p>

            <h1>
              Tasks
            </h1>

            <p className="tasks-subtitle">
              Complete simple tasks and
              earn Coins.
            </p>
          </div>
        </div>

        <div className="tasks-loading">
          <div className="tasks-loading-icon">
            <Loader2
              size={30}
              className="spin"
            />
          </div>

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
    <div className="page tasks-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="tasks-header">

        <div>
          <p className="page-eyebrow">
            EARN MORE COINS
          </p>

          <h1>
            Tasks
          </h1>

          <p className="tasks-subtitle">
            Complete simple tasks and
            grow your balance.
          </p>
        </div>

        <button
          type="button"
          className="task-refresh-button"
          onClick={() =>
            loadTasks(true)
          }
          disabled={refreshing}
          aria-label="Refresh tasks"
        >
          {refreshing ? (
            <Loader2
              size={20}
              className="spin"
            />
          ) : (
            <RefreshCw size={20} />
          )}
        </button>

      </div>


      {/* =========================================
          REWARD HERO
      ========================================= */}

      <section className="tasks-hero">

        <div className="tasks-hero-glow" />

        <div className="tasks-hero-top">

          <div className="tasks-hero-icon">
            <Sparkles size={22} />
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
            +{totalRewards.toLocaleString()}
          </strong>

          <small>
            Coins available from
            current tasks
          </small>

        </div>

        <div className="tasks-hero-bottom">

          <div>
            <CircleDollarSign
              size={16}
            />

            <span>
              {remainingTasks} tasks remaining
            </span>
          </div>

          <div>
            <Coins size={16} />

            <span>
              Balance {balance.toLocaleString()}
            </span>
          </div>

        </div>

      </section>


      {/* =========================================
          PROGRESS
      ========================================= */}

      {tasks.length > 0 && (
        <section className="tasks-progress-card">

          <div className="tasks-progress-heading">

            <div>
              <strong>
                Task progress
              </strong>

              <span>
                {completedTasks.length} of{" "}
                {tasks.length} completed
              </span>
            </div>

            <strong>
              {tasks.length
                ? Math.round(
                    (completedTasks.length /
                      tasks.length) *
                      100
                  )
                : 0}
              %
            </strong>

          </div>

          <div className="tasks-progress-track">

            <div
              className="tasks-progress-fill"
              style={{
                width: `${
                  tasks.length
                    ? (completedTasks.length /
                        tasks.length) *
                      100
                    : 0
                }%`,
              }}
            />

          </div>

        </section>
      )}


      {/* =========================================
          ERROR
      ========================================= */}

      {error && (
        <div className="tasks-error">
          <div>
            <strong>
              Something went wrong
            </strong>

            <span>
              {error}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              loadTasks(true)
            }
          >
            Try again
          </button>
        </div>
      )}


      {/* =========================================
          EMPTY
      ========================================= */}

      {!tasks.length ? (
        <div className="tasks-empty">

          <div className="tasks-empty-icon">
            <Gift size={27} />
          </div>

          <h3>
            No tasks available
          </h3>

          <p>
            New earning opportunities
            will appear here when
            they become available.
          </p>

          <button
            type="button"
            onClick={() =>
              loadTasks(true)
            }
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <Loader2
                  size={16}
                  className="spin"
                />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Check again
              </>
            )}
          </button>

        </div>
      ) : (

        <>
          {/* =====================================
              SECTION TITLE
          ===================================== */}

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
              <Coins size={15} />
              +{earnedFromTasks}
            </div>

          </div>


          {/* =====================================
              TASK LIST
          ===================================== */}

          <div className="tasks-list">

            {tasks.map((task) => {

              const completed =
                completedTasks.includes(
                  task.id
                );

              const processing =
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

                  {/* CARD TOP */}

                  <div className="task-card-top">

                    <div
                      className={`task-icon ${
                        completed
                          ? "task-icon-completed"
                          : ""
                      }`}
                    >
                      {completed ? (
                        <CheckCircle2
                          size={21}
                        />
                      ) : (
                        getTaskIcon(
                          task.type
                        )
                      )}
                    </div>

                    <div className="task-card-heading">

                      <span className="task-type-badge">
                        {getTaskType(
                          task.type
                        )}
                      </span>

                      {completed && (
                        <span className="task-done-label">
                          COMPLETED
                        </span>
                      )}

                    </div>

                    <div className="task-reward-badge">
                      <Coins size={14} />

                      <span>
                        +{task.reward}
                      </span>
                    </div>

                  </div>


                  {/* CARD CONTENT */}

                  <div className="task-info">

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

                  <div className="task-target">

                    <div className="task-target-icon">
                      <ExternalLink
                        size={14}
                      />
                    </div>

                    <span>
                      Visit the target
                      to complete this task
                    </span>

                  </div>


                  {/* CARD BOTTOM */}

                  <div className="task-bottom">

                    <div className="task-earning">

                      <span>
                        Reward
                      </span>

                      <strong>
                        +{task.reward} Coins
                      </strong>

                    </div>


                    <button
                      type="button"
                      className={
                        completed
                          ? "task-completed"
                          : "task-button"
                      }
                      disabled={
                        processing ||
                        completed
                      }
                      onClick={() =>
                        handleCompleteTask(
                          task
                        )
                      }
                    >

                      {processing ? (
                        <>
                          <Loader2
                            size={16}
                            className="spin"
                          />

                          Processing
                        </>
                      ) : completed ? (
                        <>
                          <CheckCircle2
                            size={16}
                          />

                          Done
                        </>
                      ) : (
                        <>
                          <ExternalLink
                            size={15}
                          />

                          Complete
                        </>
                      )}

                    </button>

                  </div>

                </article>
              );
            })}

          </div>
        </>

      )}

    </div>
  );
}
