
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Gift,
  Loader2,
  Send,
  Target,
  Users,
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

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [completingTask, setCompletingTask] =
    useState<string | null>(null);

  const [completedTasks, setCompletedTasks] =
    useState<string[]>([]);

  const [error, setError] =
    useState<string | null>(null);


  /*
  --------------------------------------------------
  Load tasks
  --------------------------------------------------
  */

  useEffect(() => {

    async function loadTasks() {

      try {

        setLoading(true);

        setError(null);


        const result =
          await getTasks();


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

      }

    }


    loadTasks();

  }, []);


  /*
  --------------------------------------------------
  Complete task
  --------------------------------------------------
  */

  const handleCompleteTask =
    async (
      task: Task
    ) => {

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
        Open Telegram target
        */

        if (
          task.target
        ) {

          const target =
            task.target.startsWith(
              "@"
            )
              ? `https://t.me/${task.target.substring(
                  1
                )}`
              : task.target;


          window.open(
            target,
            "_blank"
          );

        }


        /*
        Give the user a moment
        to join the channel.
        */

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              1500
            )
        );


        /*
        Complete task on backend
        */

        const result =
          await completeTask(
            task.id
          );


        setCompletedTasks(
          (current) => [
            ...current,
            task.id,
          ]
        );


        /*
        Update global balance
        */

        if (setBalance) {

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

    };


  /*
  --------------------------------------------------
  Loading state
  --------------------------------------------------
  */

  if (loading) {

    return (

      <div className="page">

        <div className="tasks-header">

          <p className="welcome-text">
            Earn more Coins
          </p>

          <h1>
            Tasks
          </h1>

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
  --------------------------------------------------
  Empty state
  --------------------------------------------------
  */

  if (
    !tasks.length
  ) {

    return (

      <div className="page">

        <div className="tasks-header">

          <p className="welcome-text">
            Earn more Coins
          </p>

          <h1>
            Tasks
          </h1>

        </div>


        <div className="daily-card">

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

      </div>

    );

  }


  /*
  --------------------------------------------------
  Render
  --------------------------------------------------
  */

  return (

    <div className="page">

      {/* Header */}

      <div className="tasks-header">

        <div>

          <p className="welcome-text">
            Earn more Coins
          </p>

          <h1>
            Tasks
          </h1>

        </div>


        <div className="task-header-icon">

          <Target
            size={24}
          />

        </div>

      </div>


      {/* Reward banner */}

      <div className="task-reward-banner">

        <div className="task-reward-icon">

          <Gift size={23} />

        </div>


        <div>

          <strong>
            Complete tasks
          </strong>

          <span>
            Earn Coins and grow
            your balance.
          </span>

        </div>

      </div>


      {/* Error */}

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


      {/* Task list */}

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

                <div className="task-icon">

                  {task.type ===
                  "telegram" ? (
                    <Send
                      size={22}
                    />
                  ) : (
                    <Users
                      size={22}
                    />
                  )}

                </div>


                <div className="task-info">

                  <h3>
                    {task.title}
                  </h3>

                  <p>
                    {task.description}
                  </p>


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

                        <Loader2
                          size={16}
                          className="spin"
                        />

                      ) : completed ? (

                        <>

                          <CheckCircle2
                            size={16}
                          />

                          Done

                        </>

                      ) : (

                        "Complete"

                      )}

                    </button>

                  </div>

                </div>

              </div>

            );

          }
        )}

      </div>

    </div>

  );

}

