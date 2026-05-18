import { useEffect, useState } from "react";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
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
} from "react-router-dom";

import "../styles/dashboard.css";

function Dashboard() {

  const navigate =
    useNavigate();

  // STATES
  const [goals,
  setGoals] =
    useState([]);

  const [notifications,
  setNotifications] =
    useState([]);

  const [title,
  setTitle] =
    useState("");

  const [description,
  setDescription] =
    useState("");

  const [thrustArea,
  setThrustArea] =
    useState("");

  const [target,
  setTarget] =
    useState("");

  const [uom,
  setUom] =
    useState("");

  const [weightage,
  setWeightage] =
    useState("");

  const [shared,
  setShared] =
    useState(false);

  const [selectedCycle,
  setSelectedCycle] =
    useState("Q1");

  const [achievementInputs,
  setAchievementInputs] =
    useState({});

  // FETCH GOALS
  const fetchGoals =
  async () => {

    const q = query(

      collection(
        db,
        "goals"
      ),

      where(
        "employeeEmail",
        "==",
        auth.currentUser.email
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

    setGoals(data);
  };

  // FETCH NOTIFICATIONS
  const fetchNotifications =
  async () => {

    const q = query(

      collection(
        db,
        "notifications"
      ),

      where(
        "email",
        "==",
        auth.currentUser.email
      ),

      orderBy(
        "createdAt",
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

    setNotifications(data);
  };

  useEffect(() => {

    fetchGoals();

    fetchNotifications();

  }, []);

  // LIVE WEIGHTAGE DISPLAY
  const liveWeightage =

    goals.reduce(

      (sum, goal)=>

        sum +
        Number(goal.weightage),

      0
    )

    +

    Number(weightage || 0);

  // CREATE GOAL
  const createGoal =
  async () => {

    // MAX GOALS
    if(goals.length >= 8){

      alert(
        "Maximum 8 goals allowed per employee"
      );

      return;
    }

    // REQUIRED FIELDS
    if(
      !title ||
      !description ||
      !thrustArea ||
      !target ||
      !uom ||
      !weightage
    ){

      alert(
        "Please fill all fields"
      );

      return;
    }

    // MIN WEIGHTAGE
    if(Number(weightage) < 10){

      alert(
        "Minimum weightage per goal must be 10%"
      );

      return;
    }

    // EXISTING DB WEIGHTAGE
    const existingWeightage =

      goals.reduce(

        (sum, goal)=>

          sum +
          Number(goal.weightage),

        0
      );

    // FINAL
    const finalWeightage =

      existingWeightage +

      Number(weightage);

    // MAX VALIDATION
    if(finalWeightage > 100){

      alert(
        `Total weightage exceeded. Current total: ${finalWeightage}%`
      );

      return;
    }

    await addDoc(

      collection(
        db,
        "goals"
      ),

      {

        title,

        description,

        thrustArea,

        target,

        uom,

        weightage,

        shared,

        employeeEmail:
          auth.currentUser.email,

        status:
          "Pending Approval",

        progressStatus:
          "Not Started",

        achievements:{},

        managerFeedback:"",

        locked:false,

        createdAt:
          new Date()
            .toISOString(),
      }
    );

    alert(
      "Goal Created Successfully"
    );

    setTitle("");
    setDescription("");
    setThrustArea("");
    setTarget("");
    setUom("");
    setWeightage("");
    setShared(false);

    fetchGoals();
  };

  // UPDATE ACHIEVEMENT
  const updateAchievement =
  async (goal) => {

    const achievement =

      achievementInputs[
        goal.id
      ];

    if(!achievement){

      alert(
        "Please enter achievement"
      );

      return;
    }

    const updatedAchievements = {

      ...goal.achievements,

      [selectedCycle.toLowerCase()]:
        achievement,
    };

    const progress =

      Math.min(

        Math.round(

          (
            Number(achievement)

            /

            Number(goal.target)
          ) * 100
        ),

        150
      );

    let progressStatus =
      "Not Started";

    if(progress >= 100){

      progressStatus =
        "Completed";
    }

    else if(progress >= 75){

      progressStatus =
        "On Track";
    }

    else if(progress >= 40){

      progressStatus =
        "Needs Attention";
    }

    else{

      progressStatus =
        "Critical";
    }

    await updateDoc(

      doc(
        db,
        "goals",
        goal.id
      ),

      {

        achievements:
          updatedAchievements,

        progressStatus,
      }
    );

    alert(
      "Achievement Updated"
    );

    fetchGoals();
  };

  // KPI %
  const calculateProgress = (
    target,
    achievement
  ) => {

    const planned =
      Number(target);

    const actual =
      Number(achievement);

    if(
      !planned ||
      !actual
    ){

      return 0;
    }

    return Math.min(

      Math.round(

        (
          actual /
          planned
        ) * 100
      ),

      150
    );
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

              Enterprise Performance Portal

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

              Employee Dashboard

            </h1>

            <p className="banner-subtitle">

              Goal management,
              KPI tracking and
              quarterly check-ins

            </p>

          </div>

        </div>

        {/* NOTIFICATIONS */}
        <div className="notification-section">

          <h2>

            Notifications

          </h2>

          {
            notifications.length === 0

            ?

            <div className="empty-notification">

              No notifications yet

            </div>

            :

            notifications.map((notification)=>(

              <div
                key={notification.id}
                className="notification-card"
              >

                <div className="notification-top">

                  <h4>

                    {notification.type}

                  </h4>

                  {
                    !notification.read

                    &&

                    <span className="unread-dot">

                    </span>
                  }

                </div>

                <p>

                  {notification.message}

                </p>

              </div>
            ))
          }

        </div>

        {/* CHECK-IN */}
        <div className="cycle-banner">

          <h2>

            Active Check-in Cycle:
            {" "}
            <span>

              {selectedCycle}

            </span>

          </h2>

          <select
            value={selectedCycle}

            onChange={(e)=>

              setSelectedCycle(
                e.target.value
              )
            }

            className="cycle-select"
          >

            <option value="Q1">

              Q1 Check-in

            </option>

            <option value="Q2">

              Q2 Check-in

            </option>

            <option value="Q3">

              Q3 Check-in

            </option>

            <option value="Q4">

              Q4 / Annual

            </option>

          </select>

        </div>

        {/* CREATE GOAL */}
        <div className="goal-form-card">

          <h2 className="section-title">

            Create Goal

          </h2>

          <div className="form-grid">

            <input
              type="text"
              placeholder="Goal Title"
              value={title}
              onChange={(e)=>
                setTitle(
                  e.target.value
                )
              }
              className="input-field"
            />

            <select
              value={thrustArea}
              onChange={(e)=>
                setThrustArea(
                  e.target.value
                )
              }
              className="input-field"
            >

              <option value="">

                Select Thrust Area

              </option>

              <option value="Business Growth">

                Business Growth

              </option>

              <option value="Operational Excellence">

                Operational Excellence

              </option>

              <option value="Customer Success">

                Customer Success

              </option>

              <option value="Innovation">

                Innovation

              </option>

              <option value="Engineering Excellence">

                Engineering Excellence

              </option>

            </select>

            <input
              type="number"
              placeholder="Target"
              value={target}
              onChange={(e)=>
                setTarget(
                  e.target.value
                )
              }
              className="input-field"
            />

            <input
              type="text"
              placeholder="UoM"
              value={uom}
              onChange={(e)=>
                setUom(
                  e.target.value
                )
              }
              className="input-field"
            />

            <input
              type="number"
              placeholder="Weightage %"
              value={weightage}
              onChange={(e)=>
                setWeightage(
                  e.target.value
                )
              }
              className="input-field"
            />

          </div>

          <textarea
            placeholder="Goal Description"
            value={description}
            onChange={(e)=>
              setDescription(
                e.target.value
              )
            }
            className="textarea-field"
          ></textarea>

          <div className="shared-toggle">

            <input
              type="checkbox"
              checked={shared}
              onChange={(e)=>
                setShared(
                  e.target.checked
                )
              }
            />

            <label>

              Shared KPI

            </label>

          </div>

          {/* WEIGHTAGE */}
          <div className="weightage-info">

            Total KPI Weightage:
            {" "}

            <span>

              {liveWeightage}%

            </span>

          </div>

          {/* STATUS */}
          <div className="weightage-status">

            {
              liveWeightage === 100

              ?

              <span className="weightage-success">

                Goal sheet completed successfully (100%)

              </span>

              :

              <span className="weightage-warning">

                Final total must reach exactly 100%

              </span>
            }

          </div>

          <button
            className="create-btn"
            onClick={createGoal}
          >

            Create Goal

          </button>

        </div>

        {/* GOALS */}
        <div className="goal-grid">

          {goals.map((goal)=>(

            <div
              key={goal.id}
              className="goal-card"
            >

              <div className="goal-top">

                <div>

                  <h2 className="goal-title">

                    {goal.title}

                  </h2>

                  <p className="goal-status">

                    {goal.status}

                  </p>

                </div>

                {
                  goal.shared

                  &&

                  <div className="performance-badge">

                    Shared KPI

                  </div>
                }

              </div>

              {/* DETAILS */}
              <div className="goal-details">

                <p>

                  🚀 Thrust Area:
                  {" "}
                  {goal.thrustArea}

                </p>

                <p>

                  🎯 Planned Target:
                  {" "}
                  {goal.target}
                  {" "}
                  {goal.uom}

                </p>

                <p>

                  ⚖ Weightage:
                  {" "}
                  {goal.weightage}%

                </p>

                <p>

                  📈 Progress Status:
                  {" "}
                  {goal.progressStatus}

                </p>

              </div>

              {/* KPI */}
              <div className="progress-engine">

                <h3>

                  KPI Performance

                </h3>

                <p>

                  📊 Achievement:
                  {" "}

                  {
                    goal.achievements?.[
                      selectedCycle.toLowerCase()
                    ]
                    || 0
                  }

                  {" "}
                  {goal.uom}

                </p>

                <p>

                  Current Progress:
                  {" "}

                  {

                    calculateProgress(

                      goal.target,

                      goal.achievements?.[
                        selectedCycle.toLowerCase()
                      ]
                    )
                  }

                  %

                </p>

                <div className="progress-bar">

                  <div
                    className="progress-fill"
                    style={{

                      width:
                        `${

                          calculateProgress(

                            goal.target,

                            goal.achievements?.[
                              selectedCycle.toLowerCase()
                            ]
                          )
                        }%`
                    }}
                  >

                  </div>

                </div>

              </div>

              {/* ACHIEVEMENT */}
              <div className="achievement-box">

                <h3 className="section-title">

                  {selectedCycle}
                  {" "}
                  Achievement Update

                </h3>

                <input
                  type="number"
                  placeholder={`Enter achievement (${goal.uom})`}
                  onChange={(e)=>

                    setAchievementInputs({

                      ...achievementInputs,

                      [goal.id]:
                        e.target.value,
                    })
                  }
                  className="input-field"
                />

                <button
                  className="update-btn"
                  onClick={()=>
                    updateAchievement(goal)
                  }
                >

                  Update Achievement

                </button>

                {
                  goal.shared

                  &&

                  <div className="shared-readonly-box">

                    Shared KPI goals allow only weightage modification.

                  </div>
                }

                {/* HISTORY */}
                <div className="history-box">

                  <h4>

                    Check-in History

                  </h4>

                  <p>

                    Q1:
                    {" "}

                    {
                      goal.achievements?.q1
                      || "No update"
                    }

                    {" "}
                    {goal.uom}

                  </p>

                  <p>

                    Q2:
                    {" "}

                    {
                      goal.achievements?.q2
                      || "No update"
                    }

                    {" "}
                    {goal.uom}

                  </p>

                  <p>

                    Q3:
                    {" "}

                    {
                      goal.achievements?.q3
                      || "No update"
                    }

                    {" "}
                    {goal.uom}

                  </p>

                  <p>

                    Q4:
                    {" "}

                    {
                      goal.achievements?.q4
                      || "No update"
                    }

                    {" "}
                    {goal.uom}

                  </p>

                </div>

                {/* FEEDBACK */}
                {
                  goal.managerFeedback

                  &&

                  <div className="feedback-box">

                    <h3>

                      Manager Feedback

                    </h3>

                    <p>

                      {goal.managerFeedback}

                    </p>

                  </div>
                }

              </div>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}

export default Dashboard;