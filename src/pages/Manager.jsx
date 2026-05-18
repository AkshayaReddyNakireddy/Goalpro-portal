import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp
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

import "../styles/Manager.css";

function Manager() {

  const navigate =
    useNavigate();

  const [goals,
  setGoals] =
    useState([]);

  const [feedbackInputs,
  setFeedbackInputs] =
    useState({});

  const [editingGoal,
  setEditingGoal] =
    useState(null);

  const [editTarget,
  setEditTarget] =
    useState("");

  const [editWeightage,
  setEditWeightage] =
    useState("");

  // SEARCH + FILTER
  const [searchText,
  setSearchText] =
    useState("");

  const [filterStatus,
  setFilterStatus] =
    useState("All");

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

        data.push({

          id:
            docItem.id,

          ...docItem.data(),

        });
      }
    );

    setGoals(data);
  };

  useEffect(() => {

    fetchGoals();

  }, []);

  // FILTERED GOALS
  const filteredGoals =
    goals.filter((goal) => {

      const matchesSearch =

        goal.title
          ?.toLowerCase()

          .includes(

            searchText.toLowerCase()
          );

      const matchesFilter =

        filterStatus === "All"

        ||

        goal.status ===
        filterStatus;

      return (
        matchesSearch &&
        matchesFilter
      );
    });

  // AUDIT LOG
  const createAuditLog =
  async (
    action,
    goalTitle
  ) => {

    await addDoc(

      collection(
        db,
        "auditLogs"
      ),

      {

        action,

        goalTitle,

        performedBy:
          auth.currentUser.email,

        role:
          "Manager",

        timestamp:
          new Date().toISOString(),
      }
    );
  };

  // CREATE NOTIFICATION
  const createNotification =
  async (
    email,
    type,
    message
  ) => {

    await addDoc(

      collection(
        db,
        "notifications"
      ),

      {

        email,

        type,

        message,

        read:false,

        createdAt:
          serverTimestamp(),
      }
    );
  };

  // APPROVE
  const approveGoal =
  async (goal) => {

    await updateDoc(

      doc(
        db,
        "goals",
        goal.id
      ),

      {

        status:
          "Approved",

        locked:true,
      }
    );

    // NOTIFICATION
    await createNotification(

      goal.employeeEmail,

      "approval",

      `Your goal "${goal.title}" was approved by manager.`
    );

    await createAuditLog(

      "Goal Approved",

      goal.title
    );

    alert(
      "Goal Approved"
    );

    fetchGoals();
  };

  // REWORK
  const sendForRework =
  async (goal) => {

    await updateDoc(

      doc(
        db,
        "goals",
        goal.id
      ),

      {

        status:
          "Rework Required",

        locked:false,

        managerFeedback:

          feedbackInputs[
            goal.id
          ] || "",
      }
    );

    // NOTIFICATION
    await createNotification(

      goal.employeeEmail,

      "rework",

      `Your goal "${goal.title}" was returned for rework by manager.`
    );

    await createAuditLog(

      "Goal Sent For Rework",

      goal.title
    );

    alert(
      "Returned For Rework"
    );

    fetchGoals();
  };

  // CHECK-IN FEEDBACK
  const saveCheckinFeedback =
  async (goal) => {

    await updateDoc(

      doc(
        db,
        "goals",
        goal.id
      ),

      {

        managerFeedback:

          feedbackInputs[
            goal.id
          ] || "",
      }
    );

    // NOTIFICATION
    await createNotification(

      goal.employeeEmail,

      "checkin",

      `Manager added quarterly check-in comments for "${goal.title}".`
    );

    await createAuditLog(

      "Quarterly Check-in Feedback Added",

      goal.title
    );

    alert(
      "Feedback Saved"
    );

    fetchGoals();
  };

  // INLINE EDIT
  const startEdit =
  (goal) => {

    setEditingGoal(
      goal.id
    );

    setEditTarget(
      goal.target
    );

    setEditWeightage(
      goal.weightage
    );
  };

  // SAVE EDIT
  const saveEdit =
  async (goal) => {

    await updateDoc(

      doc(
        db,
        "goals",
        goal.id
      ),

      {

        target:
          editTarget,

        weightage:
          editWeightage,
      }
    );

    if(goal.locked){

      await createAuditLog(

        `Locked Goal Modified - Target:${editTarget}`,

        goal.title
      );
    }

    else{

      await createAuditLog(

        `Goal Edited - Target:${editTarget}`,

        goal.title
      );
    }

    // NOTIFICATION
    await createNotification(

      goal.employeeEmail,

      "goal_edit",

      `Manager modified your goal "${goal.title}".`
    );

    alert(
      "Goal Updated"
    );

    setEditingGoal(
      null
    );

    fetchGoals();
  };

  // LOGOUT
  const logout =
  async () => {

    await signOut(auth);

    navigate("/");
  };

  return (

    <div className="manager-container">

      {/* SIDEBAR */}
      <div className="sidebar">

        <div>

          {/* LOGO */}
          <div className="logo-section">

            <h1 className="logo-title">

              GoalPro

            </h1>

            <p className="logo-subtitle">

              Manager Portal

            </p>

          </div>

          {/* MENU */}
          <div className="menu">

            <div className="menu-item active">

              Dashboard

            </div>

            {/* SHARED KPI */}
            <div
              className="menu-item"

              onClick={() => {

                localStorage.setItem(
                  "sharedKpiFrom",
                  "manager"
                );

                navigate(
                  "/sharedkpi"
                );
              }}
            >

              Shared KPI Portal

            </div>

          </div>

        </div>

        {/* LOGOUT */}
        <button
          className="logout-btn"

          onClick={logout}
        >

          Logout

        </button>

      </div>

      {/* MAIN */}
      <div className="main-content">

        {/* HEADER */}
        <div className="top-banner">

          <div>

            <h1 className="banner-title">

              Manager Dashboard

            </h1>

            <p className="banner-subtitle">

              Review goals, conduct quarterly check-ins and manage approvals

            </p>

          </div>

          <div className="profile-card">

            <div className="profile-circle">

              M

            </div>

            <div>

              <p className="profile-role">

                Logged in as

              </p>

              <h3 className="profile-name">

                Manager (L1)

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

                  (goal)=>

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

                  (goal)=>

                    goal.status ===
                    "Pending Approval"

                ).length
              }

            </h1>

          </div>

          <div className="stats-card">

            <p className="stats-label">

              Completed Check-ins

            </p>

            <h1 className="stats-value green">

              {
                goals.filter(

                  (goal)=>

                    goal.progressStatus ===
                    "Completed"

                ).length
              }

            </h1>

          </div>

        </div>

        {/* SEARCH */}
        <div className="filter-bar">

          <input
            type="text"

            placeholder="Search goals..."

            value={searchText}

            onChange={(e)=>
              setSearchText(
                e.target.value
              )
            }

            className="search-input"
          />

          <select
            value={filterStatus}

            onChange={(e)=>
              setFilterStatus(
                e.target.value
              )
            }

            className="filter-select"
          >

            <option>
              All
            </option>

            <option>
              Approved
            </option>

            <option>
              Pending Approval
            </option>

            <option>
              Rework Required
            </option>

          </select>

        </div>

        {/* GOALS */}
        <div className="goal-grid">

          {filteredGoals.map((goal)=>(

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

                    {goal.employeeEmail}

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

                  🎯 Planned Target:
                  {" "}

                  {
                    editingGoal === goal.id

                    ?

                    <input
                      type="text"

                      value={editTarget}

                      onChange={(e)=>
                        setEditTarget(
                          e.target.value
                        )
                      }

                      className="input-field"
                    />

                    :

                    goal.target
                  }

                </p>

                <p>

                  ⚖ Weightage:
                  {" "}

                  {
                    editingGoal === goal.id

                    ?

                    <input
                      type="number"

                      value={editWeightage}

                      onChange={(e)=>
                        setEditWeightage(
                          e.target.value
                        )
                      }

                      className="input-field"
                    />

                    :

                    `${goal.weightage}%`
                  }

                </p>

                <p>

                  📌 Approval Status:
                  {" "}
                  {goal.status}

                </p>

                <p>

                  📈 Progress Status:
                  {" "}
                  {goal.progressStatus}

                </p>

              </div>

              {/* BUTTONS */}
              <div className="button-group">

                {
                  goal.status ===
                  "Pending Approval"

                  && (

                    <>

                      <button
                        className="approve-btn"

                        onClick={() =>
                          approveGoal(goal)
                        }
                      >

                        Approve

                      </button>

                      <button
                        className="rework-btn"

                        onClick={() =>
                          sendForRework(goal)
                        }
                      >

                        Rework

                      </button>

                    </>
                  )
                }

                {
                  editingGoal ===
                  goal.id

                  ?

                  <button
                    className="save-btn"

                    onClick={() =>
                      saveEdit(goal)
                    }
                  >

                    Save Edit

                  </button>

                  :

                  <button
                    className="edit-btn"

                    onClick={() =>
                      startEdit(goal)
                    }
                  >

                    Inline Edit

                  </button>
                }

              </div>

              {/* CHECK-IN */}
              <div className="checkin-box">

                <h3 className="section-title">

                  Quarterly Check-in

                </h3>

                <textarea
                  placeholder="Manager Feedback / Check-in Comments"

                  onChange={(e)=>

                    setFeedbackInputs({

                      ...feedbackInputs,

                      [goal.id]:
                        e.target.value,
                    })
                  }

                  className="textarea-field"
                ></textarea>

                <button
                  className="save-btn"

                  onClick={() =>
                    saveCheckinFeedback(
                      goal
                    )
                  }
                >

                  Save Check-in Comment

                </button>

              </div>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}

export default Manager;