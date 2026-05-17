import { useEffect, useState } from "react";

import {
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";

import {
  db,
  auth,
} from "../firebase";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import "../styles/sharedkpi.css";

function SharedKPI() {

  const navigate =
    useNavigate();

  const [searchParams] =
    useSearchParams();

  const [employees,
  setEmployees] =
    useState([]);

  const [selectedEmployees,
  setSelectedEmployees] =
    useState([]);

  const [title,
  setTitle] =
    useState("");

  const [target,
  setTarget] =
    useState("");

  const [weightage,
  setWeightage] =
    useState("");

  const [thrustArea,
  setThrustArea] =
    useState("");

  const [description,
  setDescription] =
    useState("");

  // FETCH EMPLOYEES
  const fetchEmployees =
  async () => {

    try{

      const querySnapshot =
        await getDocs(
          collection(
            db,
            "users"
          )
        );

      const users = [];

      querySnapshot.forEach(
        (docItem) => {

          const data =
            docItem.data();

          // ONLY EMPLOYEES
          if(
            data.role ===
            "employee"
          ){

            users.push(data);
          }
        }
      );

      setEmployees(users);

    }

    catch(error){

      console.log(error);
    }
  };

  useEffect(() => {

    fetchEmployees();

  }, []);

  // SELECT EMPLOYEE
  const toggleEmployee =
  (email) => {

    if(
      selectedEmployees.includes(
        email
      )
    ){

      setSelectedEmployees(

        selectedEmployees.filter(

          (emp)=>

            emp !== email
        )
      );
    }

    else{

      setSelectedEmployees([

        ...selectedEmployees,

        email,
      ]);
    }
  };

  // CREATE SHARED KPI
  const createSharedKPI =
  async () => {

    try{

      if(
        !title ||
        !target ||
        !weightage
      ){

        alert(
          "Fill all required fields"
        );

        return;
      }

      if(
        selectedEmployees.length === 0
      ){

        alert(
          "Select employees"
        );

        return;
      }

      const sharedGroupId =
        Date.now().toString();

      // CREATE KPI FOR EACH EMPLOYEE
      for(
        let employeeEmail
        of selectedEmployees
      ){

        await addDoc(

          collection(
            db,
            "goals"
          ),

          {

            employeeEmail,

            title,

            target,

            weightage,

            thrustArea,

            description,

            achievement:
              "",

            progressStatus:
              "Not Started",

            status:
              "Approved",

            locked:true,

            shared:true,

            sharedGroupId,

            managerFeedback:
              "",

            createdBy:
              auth.currentUser.email,
          }
        );
      }

      alert(
        "Shared KPI Assigned Successfully"
      );

      // RESET
      setTitle("");
      setTarget("");
      setWeightage("");
      setThrustArea("");
      setDescription("");

      setSelectedEmployees([]);

    }

    catch(error){

      console.log(error);

      alert(
        "Error creating Shared KPI"
      );
    }
  };

  // FIXED BACK NAVIGATION
  const goBackDashboard =
  () => {

    const from =
      searchParams.get(
        "from"
      );

    // ADMIN
    if(from === "admin"){

      navigate("/admin");
    }

    // MANAGER
    else{

      navigate("/manager");
    }
  };

  return (

    <div className="sharedkpi-container">

      {/* SIDEBAR */}
      <div className="sidebar">

        <div>

          {/* LOGO */}
          <div className="logo-section">

            <h1 className="logo-title">

              GoalPro

            </h1>

            <p className="logo-subtitle">

              Shared KPI Management

            </p>

          </div>

          {/* MENU */}
          <div className="menu">

            <div className="menu-item active">

              Shared KPI

            </div>

            <div
              className="menu-item"

              onClick={
                goBackDashboard
              }
            >

              Back To Dashboard

            </div>

          </div>

        </div>

      </div>

      {/* MAIN */}
      <div className="main-content">

        {/* HEADER */}
        <div className="top-banner">

          <div>

            <h1 className="banner-title">

              Shared KPI Assignment

            </h1>

            <p className="banner-subtitle">

              Assign organization-wide KPIs to employees

            </p>

          </div>

          <div className="profile-card">

            <div className="profile-circle">

              K

            </div>

            <div>

              <p className="profile-role">

                KPI Governance

              </p>

              <h3 className="profile-name">

                Shared Goal Sync

              </h3>

            </div>

          </div>

        </div>

        {/* MAIN CARD */}
        <div className="shared-card">

          <h2 className="section-title">

            Create Shared KPI

          </h2>

          {/* FORM */}
          <div className="form-grid">

            <input
              type="text"
              placeholder="KPI Title"

              value={title}

              onChange={(e)=>
                setTitle(
                  e.target.value
                )
              }

              className="input-field"
            />

            <input
              type="text"
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
              type="number"
              placeholder="Weightage"

              value={weightage}

              onChange={(e)=>
                setWeightage(
                  e.target.value
                )
              }

              className="input-field"
            />

            <input
              type="text"
              placeholder="Thrust Area"

              value={thrustArea}

              onChange={(e)=>
                setThrustArea(
                  e.target.value
                )
              }

              className="input-field"
            />

          </div>

          {/* DESCRIPTION */}
          <textarea
            placeholder="Description"

            value={description}

            onChange={(e)=>
              setDescription(
                e.target.value
              )
            }

            className="textarea-field"
          ></textarea>

          {/* EMPLOYEES */}
          <div className="employee-section">

            <h3 className="employee-title">

              Select Employees

            </h3>

            <div className="employee-grid">

              {employees.map(
                (employee,index)=>(

                  <div
                    key={index}

                    className={

                      selectedEmployees.includes(
                        employee.email
                      )

                      ?

                      "employee-card selected"

                      :

                      "employee-card"
                    }

                    onClick={()=>
                      toggleEmployee(
                        employee.email
                      )
                    }
                  >

                    <h3>

                      {
                        employee.name ||

                        "Employee"
                      }

                    </h3>

                    <p>

                      {employee.email}

                    </p>

                  </div>
                )
              )}

            </div>

          </div>

          {/* BUTTON */}
          <button
            className="assign-btn"

            onClick={
              createSharedKPI
            }
          >

            Assign Shared KPI

          </button>

        </div>

      </div>

    </div>
  );
}

export default SharedKPI;