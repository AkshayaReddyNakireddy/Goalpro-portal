import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
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
  Link,
} from "react-router-dom";

import "../styles/Admin.css";

function Admin() {

  const navigate =
    useNavigate();

  const [goals,
  setGoals] =
    useState([]);

  const [auditLogs,
  setAuditLogs] =
    useState([]);

  // ANALYTICS
  const [completionRate,
  setCompletionRate] =
    useState(0);

  const [pendingApprovals,
  setPendingApprovals] =
    useState(0);

  const [lockedGoals,
  setLockedGoals] =
    useState(0);

  const [q1Average,
  setQ1Average] =
    useState(0);

  const [q2Average,
  setQ2Average] =
    useState(0);

  const [q3Average,
  setQ3Average] =
    useState(0);

  const [q4Average,
  setQ4Average] =
    useState(0);

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

    // COMPLETION RATE
    const completed =

      data.filter(
        goal =>

          goal.progressStatus ===
          "Completed"
      ).length;

    setCompletionRate(

      data.length

      ?

      Math.round(

        (
          completed /
          data.length
        ) * 100
      )

      :

      0
    );

    // PENDING
    setPendingApprovals(

      data.filter(
        goal =>

          goal.status ===
          "Pending Approval"
      ).length
    );

    // LOCKED
    setLockedGoals(

      data.filter(
        goal =>

          goal.locked === true
      ).length
    );

    // QUARTER AVERAGES
    setQ1Average(
      calculateQuarterAverage(
        data,
        "q1"
      )
    );

    setQ2Average(
      calculateQuarterAverage(
        data,
        "q2"
      )
    );

    setQ3Average(
      calculateQuarterAverage(
        data,
        "q3"
      )
    );

    setQ4Average(
      calculateQuarterAverage(
        data,
        "q4"
      )
    );
  };

  // FETCH AUDIT LOGS
  const fetchAuditLogs =
  async () => {

    const q = query(

      collection(
        db,
        "auditLogs"
      ),

      orderBy(
        "timestamp",
        "desc"
      )
    );

    const querySnapshot =
      await getDocs(q);

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

    setAuditLogs(data);
  };

  useEffect(() => {

    fetchGoals();

    fetchAuditLogs();

  }, []);

  // KPI AVERAGE
  const calculateQuarterAverage = (
    goals,
    quarter
  ) => {

    let total = 0;

    let count = 0;

    goals.forEach(goal => {

      const target =
        Number(goal.target);

      const achievement =
        Number(

          goal.achievements?.[
            quarter
          ]
        );

      if(
        target &&
        achievement
      ){

        total +=

          Math.min(

            (
              achievement /
              target
            ) * 100,

            150
          );

        count++;
      }
    });

    return count

      ?

      Math.round(
        total / count
      )

      :

      0;
  };

  // UNLOCK GOAL
  const unlockGoal =
  async (goalId) => {

    await updateDoc(

      doc(
        db,
        "goals",
        goalId
      ),

      {

        locked:false,

        status:"Reopened"
      }
    );

    const unlockedGoal =

      goals.find(
        goal =>
          goal.id === goalId
      );

    // NOTIFICATION
    await addDoc(

      collection(
        db,
        "notifications"
      ),

      {

        email:
          unlockedGoal.employeeEmail,

        type:
          "unlock",

        message:
          `Your goal "${unlockedGoal.title}" was reopened by Admin.`,

        createdAt:
          serverTimestamp(),

        read:false,
      }
    );

    // AUDIT
    await addDoc(

      collection(
        db,
        "auditLogs"
      ),

      {

        action:
          "Goal Reopened",

        goalTitle:
          unlockedGoal.title,

        performedBy:
          auth.currentUser.email,

        role:
          "Admin",

        timestamp:
          new Date().toISOString(),
      }
    );

    alert(
      "Goal unlocked successfully"
    );

    fetchGoals();

    fetchAuditLogs();
  };

  // EXPORT CSV
  const exportCSV = () => {

    const headers = [

      "Employee",

      "Goal",

      "Target",

      "Q1",

      "Q2",

      "Q3",

      "Q4",

      "Status"
    ];

    const rows =
      goals.map(goal => [

        goal.employeeEmail,

        goal.title,

        goal.target,

        goal.achievements?.q1 || "",

        goal.achievements?.q2 || "",

        goal.achievements?.q3 || "",

        goal.achievements?.q4 || "",

        goal.progressStatus
      ]);

    let csvContent =

      "data:text/csv;charset=utf-8," +

      [
        headers.join(","),

        ...rows.map(
          row =>
            row.join(",")
        )
      ].join("\n");

    const encodedUri =
      encodeURI(csvContent);

    const link =
      document.createElement("a");

    link.setAttribute(
      "href",
      encodedUri
    );

    link.setAttribute(
      "download",
      "achievement_report.csv"
    );

    document.body.appendChild(link);

    link.click();
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
      <div className="admin-sidebar">

        <div>

          <h1 className="admin-logo">

            GoalPro

          </h1>

          <p className="admin-subtitle">

            Enterprise Admin Portal

          </p>

        </div>

        <button
          className="logout-btn"

          onClick={logout}
        >

          Logout

        </button>

      </div>

      {/* MAIN */}
      <div className="admin-main">

        {/* HEADER */}
        <div className="admin-header">

          <div>

            <h1>

              Admin Dashboard

            </h1>

            <p>

              Governance,
              Analytics &
              Performance Oversight

            </p>

          </div>

          <div className="header-actions">

            <button
              className="export-btn"

              onClick={exportCSV}
            >

              Export Achievement Report

            </button>

            <Link to="/sharedkpi">

              <button
                className="shared-kpi-btn"

                onClick={()=>

                  localStorage.setItem(
                    "sharedKpiFrom",
                    "admin"
                  )
                }
              >

                Shared KPI Portal

              </button>

            </Link>

          </div>

        </div>

        {/* OVERVIEW */}
        <div className="overview-grid">

          <div className="overview-card">

            <h3>

              Total Goals

            </h3>

            <p>

              {goals.length}

            </p>

          </div>

          <div className="overview-card">

            <h3>

              Pending Approvals

            </h3>

            <p>

              {pendingApprovals}

            </p>

          </div>

          <div className="overview-card">

            <h3>

              Completion Rate

            </h3>

            <p>

              {completionRate}%

            </p>

          </div>

          <div className="overview-card">

            <h3>

              Locked Goals

            </h3>

            <p>

              {lockedGoals}

            </p>

          </div>

        </div>

        {/* ANALYTICS */}
        <div className="analytics-section">

          <h2 className="analytics-title">

            Enterprise Analytics Dashboard

          </h2>

          <div className="analytics-grid">

            <div className="analytics-card">

              <h3>

                QoQ Achievement Trend

              </h3>

              <div className="trend-list">

                <p>Q1: {q1Average}%</p>

                <p>Q2: {q2Average}%</p>

                <p>Q3: {q3Average}%</p>

                <p>Q4: {q4Average}%</p>

              </div>

            </div>

            <div className="analytics-card">

              <h3>

                Quarterly Completion Rate

              </h3>

              <div className="completion-circle">

                {completionRate}%

              </div>

              <p>

                Employees completed quarterly check-ins

              </p>

            </div>

            <div className="analytics-card">

              <h3>

                Goal Distribution

              </h3>

              <p>

                Shared KPIs:
                {" "}

                {
                  goals.filter(
                    goal =>
                      goal.shared
                  ).length
                }

              </p>

              <p>

                Locked Goals:
                {" "}
                {lockedGoals}

              </p>

              <p>

                Completed Goals:
                {" "}

                {
                  goals.filter(
                    goal =>

                      goal.progressStatus ===
                      "Completed"
                  ).length
                }

              </p>

            </div>

            <div className="analytics-card">

              <h3>

                Manager Effectiveness

              </h3>

              <p>

                Approved Goals

              </p>

              <div className="manager-score">

                {
                  goals.filter(
                    goal =>

                      goal.status ===
                      "Approved"
                  ).length
                }

                {" / "}

                {goals.length}

              </div>

            </div>

          </div>

        </div>

        {/* GOVERNANCE */}
        <div className="governance-section">

          <h2>

            Governance & Compliance

          </h2>

          <div className="governance-grid">

            <div className="governance-card">

              <h3>

                Pending Approvals

              </h3>

              <p>

                {pendingApprovals}
                {" "}
                goals awaiting manager approval

              </p>

            </div>

            <div className="governance-card">

              <h3>

                Escalations Triggered

              </h3>

              <p>

                {
                  goals.filter(
                    goal =>

                      goal.progressStatus ===
                      "Critical"
                  ).length
                }

                {" "}
                critical performance goals

              </p>

            </div>

            <div className="governance-card">

              <h3>

                Audit Trail Entries

              </h3>

              <p>

                {auditLogs.length}
                {" "}
                activity records available

              </p>

            </div>

          </div>

        </div>

        {/* AUDIT TIMELINE */}
        <div className="audit-section">

          <h2>

            Enterprise Audit Timeline

          </h2>

          <div className="audit-list">

            {
              auditLogs.length === 0

              ?

              <div className="empty-audit">

                No audit logs available

              </div>

              :

              auditLogs.map((log)=>(

                <div
                  key={log.id}
                  className="audit-card"
                >

                  <div className="audit-top">

                    <h3>

                      {log.action}

                    </h3>

                    <span>

                      {log.role}

                    </span>

                  </div>

                  <p>

                    Goal:
                    {" "}
                    {log.goalTitle}

                  </p>

                  <p>

                    Performed By:
                    {" "}
                    {log.performedBy}

                  </p>

                  <p>

                    {
                      new Date(
                        log.timestamp
                      ).toLocaleString()
                    }

                  </p>

                </div>
              ))
            }

          </div>

        </div>

        {/* GOAL TABLE */}
        <div className="goal-table-section">

          <h2>

            Goal Governance Table

          </h2>

          <div className="goal-table">

            {goals.map((goal)=>(

              <div
                key={goal.id}
                className="goal-row"
              >

                <div>

                  <h3>

                    {goal.title}

                  </h3>

                  <p>

                    {goal.employeeEmail}

                  </p>

                </div>

                <div className="goal-actions">

                  <span className="status-badge">

                    {goal.status}

                  </span>

                  {
                    goal.locked

                    &&

                    <button
                      className="unlock-btn"

                      onClick={()=>

                        unlockGoal(
                          goal.id
                        )
                      }
                    >

                      Unlock Goal

                    </button>
                  }

                </div>

              </div>
            ))}

          </div>

        </div>

      </div>

    </div>
  );
}

export default Admin;