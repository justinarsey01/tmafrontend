import { useEffect, useMemo, useState } from "react";
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

import { completeTask, getTasks } from "../lib/api";

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
  setBalance?: React.Dispatch<React.SetStateAction<number>>;
}

export default function Tasks({
  balance = 0,
  setBalance,
}: TasksProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [completingTask, setCompletingTask] = useState<string | null>(null);

  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  /*
   * Tasks that the user has clicked "Start Task" on.
   */
  const [startedTasks, setStartedTasks] = useState<string[]>([]);

  /*
   * Silent countdown.
   *
   * Users will NOT see these numbers.
   * They are only used internally to make sure
   * Complete does not become available before 10 seconds.
   */
  const [taskCountdowns, setTaskCountdowns] = useState<
    Record<string, number>
  >({});

  const [error, setError] = useState<string | null>(null);

  /*
   * Silent 10-second timer.
   */
  useEffect(() => {
    const interval = window.setInterval(() => {
      setTaskCountdowns((current) => {
        const next = { ...current };
        let changed = false;

        Object.keys(next).forEach((taskId) => {
          const remaining = next[taskId];

          if (remaining > 0) {
            next[taskId] = remaining - 1;
            changed = true;
          }
        });

        return changed ? next : current;
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  /*
   * Load tasks.
   */
  async function loadTasks(showRefresh = false) {
    try {
      setError(null);

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await getTasks();

      /*
       * Support either:
       * getTasks() -> Task[]
       * or
       * getTasks() -> { tasks: Task[] }
       */
      const taskList = Array.isArray(result)
        ? result
        : Array.isArray((result as any)?.tasks)
        ? (result as any).tasks
        : [];

      setTasks(taskList);
    } catch (err: any) {
      console.error("Failed to load tasks:", err);

      setError(
        err?.message ||
          "Unable to load tasks. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  /*
   * Calculate total possible rewards.
   */
  const totalRewards = useMemo(() => {
    return tasks.reduce(
      (total, task) => total + Number(task.reward || 0),
      0
    );
  }, [tasks]);

  /*
   * Remaining tasks.
   */
  const remainingTasks = useMemo(() => {
    return tasks.filter(
      (task) => !completedTasks.includes(task.id)
    ).length;
  }, [tasks, completedTasks]);

  /*
   * Rewards earned from completed tasks in this session.
   */
  const earnedFromTasks = useMemo(() => {
    return tasks
      .filter((task) => completedTasks.includes(task.id))
      .reduce(
        (total, task) => total + Number(task.reward || 0),
        0
      );
  }, [tasks, completedTasks]);

  /*
   * Task icon.
   */
  function getTaskIcon(type: string) {
    const normalized = String(type || "").toLowerCase();

    if (
      normalized.includes("telegram") ||
      normalized.includes("channel")
    ) {
      return <Send size={19} />;
    }

    if (
      normalized.includes("referral") ||
      normalized.includes("invite")
    ) {
      return <Users size={19} />;
    }

    if (
      normalized.includes("website") ||
      normalized.includes("web")
    ) {
      return <Globe size={19} />;
    }

    if (
      normalized.includes("social") ||
      normalized.includes("facebook") ||
      normalized.includes("instagram") ||
      normalized.includes("youtube")
    ) {
      return <Target size={19} />;
    }

    return <Gift size={19} />;
  }

  /*
   * Task type label.
   */
  function getTaskType(type: string) {
    const normalized = String(type || "").toLowerCase();

    if (normalized.includes("telegram")) {
      return "Telegram";
    }

    if (normalized.includes("referral")) {
      return "Referral";
    }

    if (normalized.includes("website")) {
      return "Website";
    }

    if (normalized.includes("social")) {
      return "Social Media";
    }

    return type || "Task";
  }

  /*
   * Open the task target.
   */
  function openTaskTarget(target: string) {
    if (!target) return;

    let url = target.trim();

    /*
     * @username
     */
    if (url.startsWith("@")) {
      url = `https://t.me/${url.substring(1)}`;
    }

    /*
     * t.me/username
     */
    else if (
      url.startsWith("t.me/") ||
      url.startsWith("telegram.me/")
    ) {
      url = `https://${url}`;
    }

    /*
     * Missing protocol.
     */
    else if (
      !url.startsWith("http://") &&
      !url.startsWith("https://")
    ) {
      url = `https://${url}`;
    }

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  /*
   * START TASK
   *
   * This opens the target and starts the hidden
   * 10-second timer.
   */
  function handleStartTask(task: Task) {
    if (completedTasks.includes(task.id)) {
      return;
    }

    if (startedTasks.includes(task.id)) {
      return;
    }

    setError(null);

    /*
     * Open task destination.
     */
    openTaskTarget(task.target);

    /*
     * Mark task as started.
     */
    setStartedTasks((current) => [
      ...current,
      task.id,
    ]);

    /*
     * Start silent 10-second countdown.
     */
    setTaskCountdowns((current) => ({
      ...current,
      [task.id]: 10,
    }));
  }

  /*
   * COMPLETE TASK
   *
   * Reward comes from the backend.
   * The frontend does NOT calculate or add the reward itself.
   */
  async function handleCompleteTask(task: Task) {
    const countdown = taskCountdowns[task.id] ?? 0;

    /*
     * Don't allow completion before task was started.
     */
    if (!startedTasks.includes(task.id)) {
      return;
    }

    /*
     * Don't allow completion before 10 seconds.
     */
    if (countdown > 0) {
      return;
    }

    /*
     * Don't process the same task twice.
     */
    if (completedTasks.includes(task.id)) {
      return;
    }

    try {
      setError(null);
      setCompletingTask(task.id);

      /*
       * Call backend.
       */
      const result = await completeTask(task.id);

      console.log("Task completion result:", result);

      /*
       * Mark task completed.
       */
      setCompletedTasks((current) => {
        if (current.includes(task.id)) {
          return current;
        }

        return [...current, task.id];
      });

      /*
       * Remove timer.
       */
      setTaskCountdowns((current) => {
        const next = { ...current };

        delete next[task.id];

        return next;
      });

      /*
       * Remove from started tasks.
       */
      setStartedTasks((current) =>
        current.filter(
          (id) => id !== task.id
        )
      );

      /*
       * IMPORTANT:
       *
       * The wallet balance comes from the backend.
       * This keeps the balance synchronized with
       * Supabase/backend instead of calculating it
       * only in React.
       */
      if (
        setBalance &&
        result?.balance !== undefined &&
        result?.balance !== null
      ) {
        setBalance(Number(result.balance));
      }
    } catch (err: any) {
      console.error(
        "Failed to complete task:",
        err
      );

      setError(
        err?.message ||
          "Unable to complete task. Please try again."
      );
    } finally {
      setCompletingTask(null);
    }
  }

  /*
   * Refresh tasks.
   */
  async function handleRefresh() {
    await loadTasks(true);
  }

  return (
    <div className="tasks-page">

      {/* =========================
          HEADER
      ========================== */}
      <div className="tasks-header">
        <div>
          <div className="tasks-title-row">
            <div className="tasks-title-icon">
              <Sparkles size={20} />
            </div>

            <div>
              <h1>Tasks</h1>

              <p>
                Complete tasks and earn Coins
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="tasks-refresh"
          onClick={handleRefresh}
          disabled={refreshing}
          aria-label="Refresh tasks"
        >
          <RefreshCw
            size={18}
            className={
              refreshing ? "spin" : ""
            }
          />
        </button>
      </div>

      {/* =========================
          BALANCE SUMMARY
      ========================== */}
      <div className="tasks-summary">

        <div className="tasks-summary-card">
          <div className="tasks-summary-icon">
            <Coins size={19} />
          </div>

          <div>
            <span>Balance</span>

            <strong>
              {Math.max(
                0,
                Math.floor(balance)
              ).toLocaleString()}
            </strong>
          </div>
        </div>

        <div className="tasks-summary-card">
          <div className="tasks-summary-icon">
            <Target size={19} />
          </div>

          <div>
            <span>Available</span>

            <strong>
              {remainingTasks}
            </strong>
          </div>
        </div>

        <div className="tasks-summary-card">
          <div className="tasks-summary-icon">
            <CircleDollarSign size={19} />
          </div>

          <div>
            <span>Task Earnings</span>

            <strong>
              {earnedFromTasks.toLocaleString()}
            </strong>
          </div>
        </div>

      </div>

      {/* =========================
          REWARD INFO
      ========================== */}
      {tasks.length > 0 && (
        <div className="tasks-reward-info">
          <div className="tasks-reward-info-icon">
            <Gift size={18} />
          </div>

          <div>
            <strong>
              Earn up to{" "}
              {totalRewards.toLocaleString()} Coins
            </strong>

            <span>
              Complete the available tasks below.
            </span>
          </div>
        </div>
      )}

      {/* =========================
          ERROR
      ========================== */}
      {error && (
        <div className="tasks-error">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* =========================
          LOADING
      ========================== */}
      {loading ? (
        <div className="tasks-loading">
          <Loader2
            size={30}
            className="spin"
          />

          <span>
            Loading tasks...
          </span>
        </div>
      ) : tasks.length === 0 ? (
        /* =========================
           EMPTY STATE
        ========================== */
        <div className="tasks-empty">
          <div className="tasks-empty-icon">
            <Gift size={30} />
          </div>

          <h3>No tasks available</h3>

          <p>
            New earning tasks will appear here
            when they become available.
          </p>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="task-button"
          >
            <RefreshCw
              size={16}
              className={
                refreshing ? "spin" : ""
              }
            />

            Refresh
          </button>
        </div>
      ) : (
        /* =========================
           TASK LIST
        ========================== */
        <div className="tasks-list">

          {tasks.map((task) => {
            const completed =
              completedTasks.includes(task.id);

            const started =
              startedTasks.includes(task.id);

            const countdown =
              taskCountdowns[task.id] ?? 0;

            const readyToComplete =
              started &&
              countdown <= 0 &&
              !completed;

            const processing =
              completingTask === task.id;

            return (
              <div
                className={`task-card ${
                  completed
                    ? "task-card-completed"
                    : ""
                }`}
                key={task.id}
              >

                {/* =========================
                    TASK TOP
                ========================== */}
                <div className="task-card-top">

                  <div className="task-icon">
                    {getTaskIcon(task.type)}
                  </div>

                  <div className="task-card-info">

                    <div className="task-card-title-row">

                      <h3>
                        {task.title}
                      </h3>

                      <span className="task-type">
                        {getTaskType(task.type)}
                      </span>

                    </div>

                    {task.description && (
                      <p>
                        {task.description}
                      </p>
                    )}

                  </div>

                  {/* REWARD */}
                  <div className="task-reward">

                    <Coins size={15} />

                    <span>
                      +{Number(
                        task.reward || 0
                      ).toLocaleString()}
                    </span>

                  </div>

                </div>

                {/* =========================
                    TASK TARGET / STATUS
                ========================== */}
                <div className="task-target">

                  <div className="task-target-icon">
                    <ExternalLink size={14} />
                  </div>

                  <span>
                    {completed
                      ? "Task completed successfully"
                      : started
                      ? "Task started successfully"
                      : "Start the task to begin"}
                  </span>

                </div>

                {/* =========================
                    TASK FOOTER
                ========================== */}
                <div className="task-card-footer">

                  <div className="task-progress">

                    <div className="task-progress-bar">

                      <div
                        className="task-progress-fill"
                        style={{
                          width: completed
                            ? "100%"
                            : started
                            ? "50%"
                            : "0%",
                        }}
                      />

                    </div>

                    <span>
                      {completed
                        ? "Completed"
                        : started
                        ? "In progress"
                        : "Not started"}
                    </span>

                  </div>

                  {/* =========================
                      ACTION BUTTON
                  ========================== */}
                  <button
                    type="button"
                    className={
                      completed
                        ? "task-completed"
                        : readyToComplete
                        ? "task-complete-ready"
                        : "task-button"
                    }
                    disabled={
                      processing ||
                      completed ||
                      (started &&
                        countdown > 0)
                    }
                    onClick={() => {
                      if (!started) {
                        handleStartTask(task);
                        return;
                      }

                      if (readyToComplete) {
                        handleCompleteTask(task);
                      }
                    }}
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
                    ) : !started ? (
                      <>
                        <ExternalLink
                          size={15}
                        />

                        Start Task
                      </>
                    ) : countdown > 0 ? (
                      <>
                        <Loader2
                          size={16}
                          className="spin"
                        />

                        Please wait
                      </>
                    ) : (
                      <>
                        <CheckCircle2
                          size={16}
                        />

                        Complete
                      </>
                    )}

                  </button>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}


