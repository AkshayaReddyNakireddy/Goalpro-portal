import { useEffect, useState } from "react";

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

import {
  db,
  auth,
} from "../firebase";

import {
  signOut,
} from "firebase/auth";

import {
  useNavigate,
} from "react-router-dom";

import "../styles/dashboard.css";

function Dashboard() {

  const navigate =
    useNavigate();

  const [goals,
  setGoals] =
    useState([]);

  const [title,
  setTitle] =
    useState("");

  const [description,
  setDescription] =
    useState("");

  const [target,
  setTarget] =
    useState("");

  const [weightage,
  setWeightage] =
    useState("");

  const [uom,
  setUom] =
    useState("Min Numeric");

  const [thrustArea,
  setThrustArea] =
    useState("");

  const [deadline,
  setDeadline] =
    useState("");

  const [achievementInputs,
  setAchievementInputs] =
    useState({});

  const [statusInputs,
  setStatusInputs] =
    useState({});

  // FETCH GOALS
  const fetchGoals =
  async () => {

    const querySnapshot =
      await getDocs(
        collection(
          db,
          "goals"
        )
      );

    const data = [];

    querySnapshot.forEach(
      (docItem) => {

        const goal =
          docItem.data();

        if (
          goal.employeeEmail ===
          auth.currentUser.email
        ) {

          data.push({

            id:
              docItem.id,

            ...goal,

          });
        }
      }
    );

    setGoals(data);
  };

  useEffect(() => {

    fetchGoals();

  }, []);

  // QUARTERLY WINDOW
  const getCurrentPhase =
  () => {

    const month =
      new Date().getMonth() + 1;

    // MAY-JUNE
    if (
      month === 5 ||
      month === 6
    ) {

      return {

        phase:
          "Phase 1 — Goal Setting",

        allowGoalCreation:
          true,

        allowCheckin:
          false,
      };
    }

    // JULY-SEPT
    if (
      month >= 7 &&
      month <= 9
    ) {

      return {

        phase:
          "Q1 Check-in",

        allowGoalCreation:
          false,

        allowCheckin:
          true,
      };
    }

    // OCT-DEC
    if (
      month >= 10 &&
      month <= 12
    ) {

      return {

        phase:
          "Q2 Check-in",

        allowGoalCreation:
          false,

        allowCheckin:
          true,
      };
    }

    // JAN-FEB
    if (
      month >= 1 &&
      month <= 2
    ) {

      return {

        phase:
          "Q3 Check-in",

        allowGoalCreation:
          false,

        allowCheckin:
          true,
      };
    }

    // MAR-APR
    return {

      phase:
        "Q4 / Annual Review",

      allowGoalCreation:
        false,

      allowCheckin:
        true,
    };
  };

  const currentPhase =
    getCurrentPhase();

  // CREATE GOAL
  const addGoal =
  async () => {

    if (
      !title ||
      !target ||
      !weightage
    ) {

      alert(
        "Fill required fields"
      );

      return;
    }

    // MAX 8 GOALS
    if (
      goals.length >= 8
    ) {

      alert(
        "Maximum 8 goals allowed"
      );

      return;
    }

    // MIN 10%
    if (
      Number(weightage) < 10
    ) {

      alert(
        "Minimum weightage is 10%"
      );

      return;
    }

    // TOTAL 100%
    const totalWeightage =
      goals.reduce(

        (
          total,
          goal
        ) =>

          total +
          Number(
            goal.weightage
          ),

        0
      ) +
      Number(weightage);

    if (
      totalWeightage > 100
    ) {

      alert(
        "Total weightage cannot exceed 100%"
      );

      return;
    }

    await addDoc(

      collection(
        db,
        "goals"
      ),

      {

        employeeEmail:
          auth.currentUser.email,

        title,

        description,

        target,

        weightage,

        uom,

        thrustArea,

        deadline,

        achievement:
          "",

        progressStatus:
          "Not Started",

        status:
          "Pending Approval",

        locked:
          false,

        shared:
          false,

        managerFeedback:
          "",

      }
    );

    alert(
      "Goal Created"
    );

    setTitle("");
    setDescription("");
    setTarget("");
    setWeightage("");
    setThrustArea("");
    setDeadline("");

    fetchGoals();
  };

  // UPDATE ACHIEVEMENT
  const updateAchievement =
  async (goal) => {

    await updateDoc(

      doc(
        db,
        "goals",
        goal.id
      ),

      {

        achievement:

          achievementInputs[
            goal.id
          ] || "",

        progressStatus:

          statusInputs[
            goal.id
          ] || "Not Started",

      }
    );

    alert(
      "Achievement Updated"
    );

    fetchGoals();
  };

  // PROGRESS SCORE
  const calculateProgress =
  (goal) => {

    const target =
      Number(goal.target);

    const achievement =
      Number(goal.achievement);

    // MIN
    if (
      goal.uom ===
        "Min Numeric" ||

      goal.uom ===
        "Min %"
    ) {

      if (!target)
        return 0;

      return Math.min(

        (
          achievement /
          target
        ) * 100,

        100
      ).toFixed(0);
    }

    // MAX
    if (
      goal.uom ===
        "Max Numeric" ||

      goal.uom ===
        "Max %"
    ) {

      if (!achievement)
        return 0;

      return Math.min(

        (
          target /
          achievement
        ) * 100,

        100
      ).toFixed(0);
    }

    // ZERO
    if (
      goal.uom ===
      "Zero"
    ) {

      return achievement === 0
        ? 100
        : 0;
    }

    // TIMELINE
    if (
      goal.uom ===
      "Timeline"
    ) {

      if (
        goal.progressStatus ===
        "Completed"
      ) {

        return 100;
      }

      else if (
        goal.progressStatus ===
        "On Track"
      ) {

        return 60;
      }

      return 0;
    }

    return 0;
  };

  // LOGOUT
  const logout =
  async () => {

    await signOut(auth);

    navigate("/");
  };

  return (

    <div className="dashboard-container">

      {/* SIDEBAR */}
      <div className="sidebar">

        <div>

          <div className="logo-section">

            <h1 className="logo-title">

              GoalPro

            </h1>

            <p className="logo-subtitle">

              Employee Portal

            </p>

          </div>

          <div className="menu">

            <div className="menu-item active">

              Dashboard

            </div>

          </div>

        </div>

        <button
          className="logout-btn"
          onClick={logout}
        >

          Logout

        </button>

      </div>

      {/* MAIN */}
      <div className="main-content">

        {/* TOP */}
        <div className="top-banner">

          <div>

            <h1 className="banner-title">

              Employee Goal Dashboard

            </h1>

            <p className="banner-subtitle">

              Track goals and quarterly achievements

            </p>

            {/* PHASE */}
            <div className="phase-badge">

              Current Cycle:
              {" "}

              {currentPhase.phase}

            </div>

          </div>

          <div className="profile-card">

            <div className="profile-circle">

              E

            </div>

            <div>

              <p className="profile-role">

                Logged in as

              </p>

              <h3 className="profile-name">

                Employee

              </h3>

            </div>

          </div>

        </div>

        {/* STATS */}
        <div className="stats-grid">

          <div className="stats-card">

            <p className="stats-label">

              Total Goals

            </p>

            <h1 className="stats-value">

              {goals.length}

            </h1>

          </div>

          <div className="stats-card">

            <p className="stats-label">

              Approved Goals

            </p>

            <h1 className="stats-value green">

              {
                goals.filter(

                  (goal) =>

                    goal.status ===
                    "Approved"

                ).length
              }

            </h1>

          </div>

          <div className="stats-card">

            <p className="stats-label">

              Pending Approval

            </p>

            <h1 className="stats-value yellow">

              {
                goals.filter(

                  (goal) =>

                    goal.status ===
                    "Pending Approval"

                ).length
              }

            </h1>

          </div>

        </div>

        {/* CREATE GOAL */}
        <div className="goal-form-card">

          <h2 className="form-title">

            Create New Goal

          </h2>

          <div className="form-grid">

            <input
              type="text"
              placeholder="Goal Title"

              value={title}

              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }

              className="input-field"
            />

            <input
              type="text"
              placeholder="Thrust Area"

              value={thrustArea}

              onChange={(e) =>
                setThrustArea(
                  e.target.value
                )
              }

              className="input-field"
            />

            <input
              type="text"
              placeholder="Target"

              value={target}

              onChange={(e) =>
                setTarget(
                  e.target.value
                )
              }

              className="input-field"
            />

            <input
              type="number"
              placeholder="Weightage"

              value={weightage}

              onChange={(e) =>
                setWeightage(
                  e.target.value
                )
              }

              className="input-field"
            />

            <select
              value={uom}

              onChange={(e) =>
                setUom(
                  e.target.value
                )
              }

              className="input-field"
            >

              <option value="Min Numeric">

                Min Numeric

              </option>

              <option value="Min %">

                Min %

              </option>

              <option value="Max Numeric">

                Max Numeric

              </option>

              <option value="Max %">

                Max %

              </option>

              <option value="Timeline">

                Timeline

              </option>

              <option value="Zero">

                Zero

              </option>

            </select>

            <input
              type="date"

              value={deadline}

              onChange={(e) =>
                setDeadline(
                  e.target.value
                )
              }

              className="input-field"
            />

          </div>

          <textarea
            placeholder="Goal Description"

            value={description}

            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }

            className="textarea-field"
          ></textarea>

          <button
            className="save-btn"

            disabled={
              !currentPhase.allowGoalCreation
            }

            onClick={addGoal}
          >

            {
              currentPhase.allowGoalCreation

                ? "Add Goal"

                : "Goal Creation Closed"
            }

          </button>

        </div>

        {/* GOALS */}
        <div className="goal-grid">

          {goals.map((goal) => (

            <div
              key={goal.id}
              className="goal-card"
            >

              {/* TOP */}
              <div className="goal-top">

                <div>

                  <h2 className="goal-title">

                    {goal.title}

                  </h2>

                  <p className="goal-email">

                    {goal.thrustArea}

                  </p>

                </div>

                {goal.shared && (

                  <div className="shared-badge">

                    Shared KPI

                  </div>

                )}

              </div>

              {/* DETAILS */}
              <div className="goal-details">

                <p>
                  🎯 Target:
                  {" "}
                  {goal.target}
                </p>

                <p>
                  ⚖ Weightage:
                  {" "}
                  {goal.weightage}%
                </p>

                <p>
                  📏 UoM:
                  {" "}
                  {goal.uom}
                </p>

                <p>
                  📌 Status:
                  {" "}
                  {goal.status}
                </p>

                <p>
                  📈 Progress:
                  {" "}
                  {goal.progressStatus}
                </p>

                <p>
                  📊 Progress Score:
                  {" "}
                  {calculateProgress(goal)}%
                </p>

                <div className="progress-bar">

                  <div
                    className="progress-fill"

                    style={{
                      width:
                        `${calculateProgress(goal)}%`
                    }}
                  ></div>

                </div>

              </div>

              {/* CHECK-IN */}
              <div className="section-box">

                <h3 className="section-title">

                  Quarterly Achievement Update

                </h3>

                <input
                  type="text"
                  placeholder="Achievement"

                  disabled={
                    goal.locked ||

                    !currentPhase.allowCheckin
                  }

                  onChange={(e) =>

                    setAchievementInputs({

                      ...achievementInputs,

                      [goal.id]:
                        e.target.value,

                    })

                  }

                  className="input-field"
                />

                <select
                  disabled={
                    goal.locked ||

                    !currentPhase.allowCheckin
                  }

                  onChange={(e) =>

                    setStatusInputs({

                      ...statusInputs,

                      [goal.id]:
                        e.target.value,

                    })

                  }

                  className="input-field"
                >

                  <option>

                    Not Started

                  </option>

                  <option>

                    On Track

                  </option>

                  <option>

                    Completed

                  </option>

                </select>

                <button
                  disabled={
                    goal.locked ||

                    !currentPhase.allowCheckin
                  }

                  className="save-btn"

                  onClick={() =>
                    updateAchievement(
                      goal
                    )
                  }
                >

                  {
                    currentPhase.allowCheckin

                      ? "Update Achievement"

                      : "Check-in Window Closed"
                  }

                </button>

              </div>

              {/* FEEDBACK */}
              {goal.managerFeedback && (

                <div className="feedback-box">

                  <h3>

                    Manager Feedback

                  </h3>

                  <p>

                    {goal.managerFeedback}

                  </p>

                </div>

              )}

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default Dashboard;