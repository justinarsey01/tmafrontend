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
    completingTask,
    setCompletingTask,
  ] = useState<string | null>(null);

  const [
    completedTasks,
    setCompletedTasks,
  ] = useState<string[]>([]);

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

      setTasks(
        result || []
      );

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
  | GET TASK ICON
  |--------------------------------------------------------------------------
  */

  function getTaskIcon(
    type: string
  ) {

    switch (type) {

      case "telegram_channel":
      case "telegram_group":
      case "telegram_bot":
      case "telegram_post":
      case "telegram":
        return (
          <Send size={22} />
        );

      case "website":
        return (
          <Globe size={22} />
        );

      case "social":
        return (
          <Users size={22} />
        );

      default:
        return (
          <Target size={22} />
        );
    }

  }


  /*
  |--------------------------------------------------------------------------
  | GET TYPE LABEL
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
    |--------------------------------------------------------------------------
    | Convert @username to Telegram URL
    |--------------------------------------------------------------------------
    */

    if (
      url.startsWith("@")
    ) {

      url =
        `https://t.me/${url.substring(1)}`;

    }

    /*
    |--------------------------------------------------------------------------
    | Convert Telegram username
    |--------------------------------------------------------------------------
    */

    else if (
      !url.startsWith("http://") &&
      !url.startsWith("https://")
    ) {

      if (
        url.startsWith("t.me/")
      ) {

        url =
          `https://${url}`;

      } else {

        url =
          `https://t.me/${url}`;

      }

    }

    /*
    |--------------------------------------------------------------------------
    | Open target
    |--------------------------------------------------------------------------
    */

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
      completedTasks.includes(
        task.id
      )
    ) {
      return;
    }

    try {

      setCompletingTask(
        task.id
      );

      setError(null);

      /*
      |--------------------------------------------------------------------------
      | Open Telegram / target
      |--------------------------------------------------------------------------
      */

      openTaskTarget(
        task.target
      );


      /*
      |--------------------------------------------------------------------------
      | Give user a short moment
      |--------------------------------------------------------------------------
      */

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            1500
          )
      );


      /*
      |--------------------------------------------------------------------------
      | Ask backend to complete task
      |--------------------------------------------------------------------------
      */

      const result =
        await completeTask(
          task.id
        );


      /*
      |--------------------------------------------------------------------------
      | Mark task completed locally
      |--------------------------------------------------------------------------
      */

      setCompletedTasks(
        (current) => {

          if (
            current.includes(
              task.id
            )
          ) {
            return current;
          }

          return [
            ...current,
            task.id,
          ];

        }
      );


      /*
      |--------------------------------------------------------------------------
      | Update user's actual balance
      |--------------------------------------------------------------------------
      */

      if (
        setBalance &&
        result?.balance !== undefined
      ) {

        setBalance(
          Number(
            result.balance
          )
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

      <div className="page">

        <div className="tasks-header">

          <div>

            <p className="welcome-text">
              Earn more Coins
            </p>

            <h1>
              Tasks
            </h1>

          </div>

        </div>


        <div
          style={{
            display: "flex",
            justifyContent:
              "center",
            padding: "60px 0",
          }}
        >

          <Loader2
            size={32}
            className="spin"
          />

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

    <div className="page">

      {/* HEADER */}

      <div className="tasks-header">

        <div>

          <p className="welcome-text">
            Earn more Coins
          </p>

          <h1>
            Tasks
          </h1>

        </div>


        <button
          type="button"
          className="task-header-icon"
          onClick={() =>
            loadTasks(true)
          }
          disabled={refreshing}
          title="Refresh tasks"
        >

          {refreshing ? (

            <Loader2
              size={22}
              className="spin"
            />

          ) : (

            <RefreshCw
              size={22}
            />

          )}

        </button>

      </div>


      {/* REWARD BANNER */}

      <div className="task-reward-banner">

        <div className="task-reward-icon">

          <Gift size={23} />

        </div>


        <div>

          <strong>
            Complete tasks
          </strong>

          <span>
            Complete available
            tasks and earn Coins.
          </span>

        </div>

      </div>


      {/* ERROR */}

      {error && (

        <div
          style={{
            marginTop: "14px",
            padding: "12px",
            borderRadius: "12px",
            background:
              "rgba(255, 70, 70, 0.10)",
            border:
              "1px solid rgba(255, 70, 70, 0.20)",
            color: "#ff8585",
            fontSize: "13px",
          }}
        >

          {error}

        </div>

      )}


      {/* NO TASKS */}

      {!tasks.length ? (

        <div
          className="daily-card"
          style={{
            marginTop: "16px",
          }}
        >

          <div>

            <h3>
              No tasks available
            </h3>

            <p>
              Check back later for
              new rewards.
            </p>

          </div>

          <Gift size={25} />

        </div>

      ) : (

        /* TASK LIST */

        <div className="tasks-list">

          {tasks.map(
            (task) => {

              const completed =
                completedTasks.includes(
                  task.id
                );

              const processing =
                completingTask ===
                task.id;


              return (

                <div
                  key={task.id}
                  className="task-card"
                >

                  {/* ICON */}

                  <div className="task-icon">

                    {getTaskIcon(
                      task.type
                    )}

                  </div>


                  {/* CONTENT */}

                  <div className="task-info">

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          "space-between",
                        gap: "10px",
                      }}
                    >

                      <h3>
                        {task.title}
                      </h3>

                    </div>


                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        marginTop: "4px",
                        padding:
                          "3px 7px",
                        borderRadius:
                          "6px",
                        background:
                          "rgba(0, 136, 204, 0.10)",
                        color:
                          "#4ba8d8",
                        fontSize:
                          "10px",
                        fontWeight:
                          600,
                      }}
                    >

                      {getTaskType(
                        task.type
                      )}

                    </div>


                    {task.description && (

                      <p>
                        {task.description}
                      </p>

                    )}


                    <div className="task-bottom">

                      <span className="task-reward">

                        +{task.reward} Coins

                      </span>


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

                            Processing...

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

                  </div>

                </div>

              );

            }
          )}

        </div>

      )}

    </div>

  );

}