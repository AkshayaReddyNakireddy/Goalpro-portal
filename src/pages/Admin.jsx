import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
  updateDoc,
  doc,
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

import "../styles/admin.css";

function Admin() {

  const navigate =
    useNavigate();

  const [goals,
  setGoals] =
    useState([]);

  const [auditLogs,
  setAuditLogs] =
    useState([]);

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

  // FETCH AUDIT LOGS
  const fetchAuditLogs =
  async () => {

    const querySnapshot =
      await getDocs(
        collection(
          db,
          "auditLogs"
        )
      );

    const logs = [];

    querySnapshot.forEach(
      (docItem) => {

        logs.push(
          docItem.data()
        );
      }
    );

    setAuditLogs(logs);
  };

  useEffect(() => {

    fetchGoals();

    fetchAuditLogs();

  }, []);

  // UNLOCK GOAL
  const unlockGoal =
  async (goal) => {

    await updateDoc(

      doc(
        db,
        "goals",
        goal.id
      ),

      {

        locked:false,
      }
    );

    alert(
      "Goal Unlocked"
    );

    fetchGoals();
  };

  // EXPORT CSV
  const exportCSV =
  () => {

    const headers = [

      "Employee",

      "Goal",

      "Target",

      "Achievement",

      "Approval Status",

      "Progress Status",

      "Weightage",
    ];

    const rows =
      goals.map((goal) => [

        goal.employeeEmail,

        goal.title,

        goal.target,

        goal.achievement || "",

        goal.status,

        goal.progressStatus,

        goal.weightage,
      ]);

    let csv =
      headers.join(",") +
      "\n";

    rows.forEach((row) => {

      csv +=
        row.join(",") +
        "\n";
    });

    const blob =
      new Blob(

        [csv],

        {
          type:
            "text/csv;charset=utf-8;",
        }
      );

    const link =
      document.createElement(
        "a"
      );

    const url =
      URL.createObjectURL(
        blob
      );

    link.href = url;

    link.download =
      "achievement_report.csv";

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );
  };

  // LOGOUT
  const logout =
  async () => {

    await signOut(auth);

    navigate("/");
  };

  return (

    <div className="admin-container">

      {/* SIDEBAR */}
      <div className="sidebar">

        <div>

          {/* LOGO */}
          <div className="logo-section">

            <h1 className="logo-title">

              GoalPro

            </h1>

            <p className="logo-subtitle">

              Admin / HR Portal

            </p>

          </div>

          {/* MENU */}
          <div className="menu">

            <div className="menu-item active">

              Dashboard

            </div>

            {/* FIXED SHARED KPI NAVIGATION */}
            <div
              className="menu-item"

              onClick={() =>
  navigate(
    "/shared-kpi?from=admin"
  )
}
            >

              Shared KPI

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

              Admin Dashboard

            </h1>

            <p className="banner-subtitle">

              Governance, reporting and completion monitoring

            </p>

          </div>

          <div className="profile-card">

            <div className="profile-circle">

              A

            </div>

            <div>

              <p className="profile-role">

                Logged in as

              </p>

              <h3 className="profile-name">

                Admin / HR

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

              Locked Goals

            </p>

            <h1 className="stats-value green">

              {
                goals.filter(

                  (goal)=>

                    goal.locked
                ).length
              }

            </h1>

          </div>

          <div className="stats-card">

            <p className="stats-label">

              Audit Logs

            </p>

            <h1 className="stats-value yellow">

              {auditLogs.length}

            </h1>

          </div>

          <div className="stats-card">

            <p className="stats-label">

              Completion Rate

            </p>

            <h1 className="stats-value green">

              {
                goals.length > 0

                ?

                Math.round(

                  (
                    goals.filter(

                      (goal)=>

                        goal.progressStatus ===
                        "Completed"

                    ).length /

                    goals.length
                  ) * 100

                )

                : 0
              }%

            </h1>

          </div>

        </div>

        {/* EXPORT */}
        <button
          className="export-btn"

          onClick={exportCSV}
        >

          Export Achievement Report

        </button>

        {/* ANALYTICS */}
        <div className="analytics-card">

          <h2 className="section-main-title">

            Analytics Overview

          </h2>

          <div className="analytics-grid">

            <div className="analytics-item">

              <h3>

                {
                  goals.filter(

                    (goal)=>

                      goal.progressStatus ===
                      "Completed"

                  ).length
                }

              </h3>

              <p>

                Completed Goals

              </p>

            </div>

            <div className="analytics-item">

              <h3>

                {
                  goals.filter(

                    (goal)=>

                      goal.status ===
                      "Pending Approval"

                  ).length
                }

              </h3>

              <p>

                Pending Approvals

              </p>

            </div>

            <div className="analytics-item">

              <h3>

                {
                  goals.filter(

                    (goal)=>

                      goal.status ===
                      "Rework Required"

                  ).length
                }

              </h3>

              <p>

                Rework Goals

              </p>

            </div>

            <div className="analytics-item">

              <h3>

                {
                  goals.filter(

                    (goal)=>

                      goal.shared === true

                  ).length
                }

              </h3>

              <p>

                Shared KPIs

              </p>

            </div>

          </div>

        </div>

        {/* GOALS */}
        <div className="goal-section">

          <h2 className="section-main-title">

            Goal Governance

          </h2>

          <div className="goal-grid">

            {goals.map((goal)=>(

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

                  {
                    goal.locked

                    ?

                    <div className="locked-badge">

                      Locked

                    </div>

                    :

                    <div className="unlocked-badge">

                      Editable

                    </div>
                  }

                </div>

                {/* DETAILS */}
                <div className="goal-details">

                  <p>

                    🎯 Target:
                    {" "}
                    {goal.target}

                  </p>

                  <p>

                    📊 Achievement:
                    {" "}
                    {
                      goal.achievement ||
                      "N/A"
                    }

                  </p>

                  <p>

                    📈 Progress:
                    {" "}
                    {goal.progressStatus}

                  </p>

                  <p>

                    📌 Status:
                    {" "}
                    {goal.status}

                  </p>

                </div>

                {/* BUTTON */}
                {
                  goal.locked && (

                    <button
                      className="unlock-btn"

                      onClick={() =>
                        unlockGoal(goal)
                      }
                    >

                      Unlock Goal

                    </button>
                  )
                }

              </div>
            ))}

          </div>

        </div>

        {/* AUDIT */}
        <div className="audit-section">

          <h2 className="section-main-title">

            Audit Trail

          </h2>

          <div className="audit-grid">

            {auditLogs.map(
              (log,index)=>(

                <div
                  key={index}
                  className="audit-card"
                >

                  <h3>

                    {
                      log.action ||
                      "Activity"
                    }

                  </h3>

                  <p>

                    Goal:
                    {" "}
                    {
                      log.goalTitle ||
                      "No Goal"
                    }

                  </p>

                  <p>

                    By:
                    {" "}
                    {
                      log.performedBy ||
                      "Unknown User"
                    }

                  </p>

                  <p>

                    Role:
                    {" "}
                    {
                      log.role ||
                      "Unknown Role"
                    }

                  </p>

                  <span>

                    {
                      log.timestamp

                      ?

                      new Date(
                        log.timestamp
                      ).toLocaleString()

                      :

                      "No Timestamp"
                    }

                  </span>

                </div>
              )
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default Admin;