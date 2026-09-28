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
   completed?: boolean;
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

  const [completingTask, setCompletingTask] = useState<string | null>(
    null
  );

  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  /*
   * Tasks that have been started.
   */
  const [startedTasks, setStartedTasks] = useState<string[]>([]);

  /*
   * Silent countdown.
   *
   * The numbers are NEVER displayed to the user.
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

      const taskList = Array.isArray(result)
        ? result
        : Array.isArray((result as any)?.tasks)
        ? (result as any).tasks
        : [];

      setTasks(taskList);
    } catch (err: any) {
      console.error("Failed to load tasks:", err);

      setError(
        err?.message || "Unable to load tasks. Please try again."
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
   * Total possible rewards.
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
   * Rewards earned from tasks.
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
   * Open task target.
   */
  function openTaskTarget(target: string) {
    if (!target) return;

    let url = target.trim();

    if (url.startsWith("@")) {
      url = `https://t.me/${url.substring(1)}`;
    } else if (
      url.startsWith("t.me/") ||
      url.startsWith("telegram.me/")
    ) {
      url = `https://${url}`;
    } else if (
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
     * Open the task.
     */
    openTaskTarget(task.target);

    /*
     * Mark as started.
     */
    setStartedTasks((current) => [
      ...current,
      task.id,
    ]);

    /*
     * Start hidden 10-second timer.
     */
    setTaskCountdowns((current) => ({
      ...current,
      [task.id]: 10,
    }));
  }

  /*
   * COMPLETE TASK
   */
  async function handleCompleteTask(task: Task) {
    const countdown = taskCountdowns[task.id] ?? 0;

    /*
     * Must have started the task.
     */
    if (!startedTasks.includes(task.id)) {
      return;
    }

    /*
     * Must wait the full 10 seconds.
     */
    if (countdown > 0) {
      return;
    }

    /*
     * Prevent duplicate completion.
     */
    if (completedTasks.includes(task.id)) {
      return;
    }

    try {
      setError(null);
      setCompletingTask(task.id);

      /*
       * Backend completion.
       */
      const result = await completeTask(task.id);

      console.log("Task completion result:", result);

      /*
       * Mark completed.
       */
      setCompletedTasks((current) => {
        if (current.includes(task.id)) {
          return current;
        }

        return [...current, task.id];
      });

      /*
       * Remove countdown.
       */
      setTaskCountdowns((current) => {
        const next = { ...current };

        delete next[task.id];

        return next;
      });

      /*
       * Remove started status.
       */
      setStartedTasks((current) =>
        current.filter(
          (id) => id !== task.id
        )
      );

      /*
       * IMPORTANT:
       *
       * Balance comes from backend/Supabase.
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
   * Refresh.
   */
  async function handleRefresh() {
    await loadTasks(true);
  }

  return (
    <>
      <style>{`
        /* =========================================
           TASKS PAGE
        ========================================= */

        .tasks-page {
          width: 100%;
          min-height: 100%;
          padding: 18px 16px 100px;
          box-sizing: border-box;
          color: var(--text, #ffffff);
        }

        /* =========================================
           HEADER
        ========================================= */

        .tasks-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 20px;
        }

        .tasks-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .tasks-title-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(245, 184, 0, 0.14);
          color: #f5b800;
          flex-shrink: 0;
        }

        .tasks-header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.4px;
        }

        .tasks-header p {
          margin: 4px 0 0;
          color: #999999;
          font-size: 13px;
        }

        .tasks-refresh {
          width: 40px;
          height: 40px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .tasks-refresh:hover {
          background: rgba(245, 184, 0, 0.12);
          color: #f5b800;
        }

        .tasks-refresh:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        /* =========================================
           SUMMARY
        ========================================= */

        .tasks-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 14px;
        }

        .tasks-summary-card {
          min-width: 0;
          padding: 13px 10px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .tasks-summary-icon {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(245, 184, 0, 0.12);
          color: #f5b800;
        }

        .tasks-summary-card span {
          display: block;
          color: #888888;
          font-size: 10px;
          margin-bottom: 3px;
          white-space: nowrap;
        }

        .tasks-summary-card strong {
          display: block;
          font-size: 14px;
          font-weight: 800;
          color: #ffffff;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* =========================================
           REWARD INFO
        ========================================= */

        .tasks-reward-info {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 13px;
          margin-bottom: 16px;
          border-radius: 13px;
          background: rgba(245, 184, 0, 0.07);
          border: 1px solid rgba(245, 184, 0, 0.13);
        }

        .tasks-reward-info-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: rgba(245, 184, 0, 0.12);
          color: #f5b800;
        }

        .tasks-reward-info strong {
          display: block;
          color: #f5b800;
          font-size: 13px;
          margin-bottom: 3px;
        }

        .tasks-reward-info span {
          display: block;
          color: #999999;
          font-size: 11px;
        }

        /* =========================================
           ERROR
        ========================================= */

        .tasks-error {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 16px;
          padding: 12px 14px;
          border-radius: 11px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          font-size: 12px;
        }

        .tasks-error button {
          border: none;
          background: transparent;
          color: #fca5a5;
          font-size: 20px;
          cursor: pointer;
          line-height: 1;
        }

        /* =========================================
           LOADING
        ========================================= */

        .tasks-loading {
          min-height: 220px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #999999;
          font-size: 13px;
        }

        /* =========================================
           EMPTY
        ========================================= */

        .tasks-empty {
          padding: 45px 20px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.06);
          text-align: center;
        }

        .tasks-empty-icon {
          width: 62px;
          height: 62px;
          margin: 0 auto 14px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(245, 184, 0, 0.1);
          color: #f5b800;
        }

        .tasks-empty h3 {
          margin: 0 0 7px;
          font-size: 17px;
        }

        .tasks-empty p {
          max-width: 330px;
          margin: 0 auto 20px;
          color: #888888;
          font-size: 12px;
          line-height: 1.6;
        }

        /* =========================================
           TASK LIST
        ========================================= */

        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* =========================================
           TASK CARD
        ========================================= */

        .task-card {
          padding: 15px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.07);
          transition:
            border-color 0.2s ease,
            transform 0.2s ease,
            background 0.2s ease;
        }

        .task-card:hover {
          border-color: rgba(245, 184, 0, 0.18);
          background: rgba(255, 255, 255, 0.05);
        }

        .task-card-completed {
          border-color: rgba(34, 197, 94, 0.18);
        }

        /* =========================================
           TASK TOP
        ========================================= */

        .task-card-top {
          display: flex;
          align-items: flex-start;
          gap: 11px;
        }

        .task-icon {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(245, 184, 0, 0.11);
          color: #f5b800;
        }

        .task-card-info {
          flex: 1;
          min-width: 0;
        }

        .task-card-title-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 7px;
        }

        .task-card-title-row h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 750;
          color: #ffffff;
          line-height: 1.35;
        }

        .task-type {
          padding: 3px 7px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.06);
          color: #999999;
          font-size: 9px;
          font-weight: 600;
        }

        .task-card-info p {
          margin: 5px 0 0;
          color: #888888;
          font-size: 11px;
          line-height: 1.5;
        }

        /* =========================================
           REWARD
        ========================================= */

        .task-reward {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #f5b800;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        /* =========================================
           TARGET / STATUS
        ========================================= */

        .task-target {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 14px;
          padding: 10px 12px;
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.035);
          color: #999999;
          font-size: 11px;
        }

        .task-target-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #777777;
        }

        /* =========================================
           FOOTER
        ========================================= */

        .task-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 14px;
        }

        .task-progress {
          flex: 1;
          min-width: 0;
        }

        .task-progress-bar {
          width: 100%;
          height: 4px;
          overflow: hidden;
          border-radius: 99px;
          background: rgba(255, 255, 255, 0.07);
        }

        .task-progress-fill {
          height: 100%;
          border-radius: 99px;
          background: #f5b800;
          transition: width 0.35s ease;
        }

        .task-card-completed .task-progress-fill {
          background: #22c55e;
        }

        .task-progress span {
          display: block;
          margin-top: 5px;
          color: #777777;
          font-size: 9px;
        }

        /* =========================================
           BUTTONS
        ========================================= */

        .task-button,
        .task-complete-ready,
        .task-completed {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          flex-shrink: 0;
          border: none;
          border-radius: 10px;
          padding: 10px 15px;
          font-size: 12px;
          font-weight: 750;
          white-space: nowrap;
          transition:
            transform 0.2s ease,
            background 0.2s ease,
            opacity 0.2s ease;
        }

        .task-button {
          background: #f5b800;
          color: #111111;
          cursor: pointer;
        }

        .task-button:hover {
          transform: translateY(-1px);
          background: #ffc928;
        }

        .task-button:active {
          transform: scale(0.97);
        }

        .task-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        /*
         * Green Complete button.
         */
        .task-complete-ready {
          background: #22c55e;
          color: #ffffff;
          cursor: pointer;
        }

        .task-complete-ready:hover {
          background: #16a34a;
          transform: translateY(-1px);
        }

        .task-complete-ready:active {
          transform: scale(0.97);
        }

        /*
         * Completed button.
         */
        .task-completed {
          background: #166534;
          color: #ffffff;
          cursor: default;
        }

        /* =========================================
           SPINNER
        ========================================= */

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

        /* =========================================
           MOBILE
        ========================================= */

        @media (max-width: 600px) {
          .tasks-page {
            padding: 16px 13px 100px;
          }

          .tasks-summary {
            gap: 7px;
          }

          .tasks-summary-card {
            padding: 10px 7px;
            gap: 6px;
          }

          .tasks-summary-icon {
            width: 29px;
            height: 29px;
            border-radius: 8px;
          }

          .tasks-summary-card span {
            font-size: 9px;
          }

          .tasks-summary-card strong {
            font-size: 12px;
          }

          .task-card {
            padding: 13px;
          }

          .task-card-top {
            gap: 9px;
          }

          .task-icon {
            width: 38px;
            height: 38px;
          }

          .task-reward {
            font-size: 11px;
          }

          .task-card-footer {
            align-items: flex-end;
          }

          .task-progress {
            min-width: 80px;
          }

          .task-button,
          .task-complete-ready,
          .task-completed {
            padding: 9px 11px;
            font-size: 11px;
          }
        }

        @media (max-width: 390px) {
          .tasks-summary-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .task-card-title-row {
            padding-right: 0;
          }

          .task-card-footer {
            flex-direction: column;
            align-items: stretch;
          }

          .task-button,
          .task-complete-ready,
          .task-completed {
            width: 100%;
          }
        }
      `}</style>

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
            SUMMARY
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
                      TASK STATUS
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
                      FOOTER
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
    </>
  );
}