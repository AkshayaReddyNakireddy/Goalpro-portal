import { useState } from "react";

import {
  createUserWithEmailAndPassword,
} from "firebase/auth";

import {
  collection,
  addDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import "../styles/login.css";

function Register() {

  const navigate =
    useNavigate();

  const [name,
  setName] =
    useState("");

  const [email,
  setEmail] =
    useState("");

  const [password,
  setPassword] =
    useState("");

  const [role,
  setRole] =
    useState("employee");

  // REGISTER
  const handleRegister =
  async () => {

    if (
      !name ||
      !email ||
      !password
    ) {

      alert(
        "Please fill all fields"
      );

      return;
    }

    try {

      // FIREBASE AUTH
      await createUserWithEmailAndPassword(

        auth,

        email,

        password
      );

      // SAVE USER
      await addDoc(

        collection(
          db,
          "users"
        ),

        {

          name,

          email,

          role,

          createdAt:
            new Date()
              .toISOString(),

        }
      );

      alert(
        "Registration Successful"
      );

      navigate("/");

    }

    catch (error) {

      alert(
        error.message
      );
    }
  };

  return (

    <div className="auth-container">

      <div className="auth-card">

        {/* LEFT */}
        <div className="auth-left">

          <h1 className="brand-title">

            GoalPro

          </h1>

          <p className="brand-subtitle">

            Enterprise Goal Management Portal

          </p>

          <div className="brand-features">

            <div className="feature-item">

              ✔ Goal Creation & Approval

            </div>

            <div className="feature-item">

              ✔ Shared KPI Synchronization

            </div>

            <div className="feature-item">

              ✔ Quarterly Check-ins

            </div>

            <div className="feature-item">

              ✔ Audit Trail & Governance

            </div>

          </div>

        </div>

        {/* RIGHT */}
        <div className="auth-right">

          <h1 className="auth-title">

            Create Account

          </h1>

          <p className="auth-subtitle">

            Register to continue

          </p>

          {/* NAME */}
          <input
            type="text"
            placeholder="Full Name"

            value={name}

            onChange={(e) =>
              setName(
                e.target.value
              )
            }

            className="auth-input"
          />

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email Address"

            value={email}

            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }

            className="auth-input"
          />

          {/* PASSWORD */}
          <input
            type="password"
            placeholder="Password"

            value={password}

            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }

            className="auth-input"
          />

          {/* ROLE */}
          <select
            value={role}

            onChange={(e) =>
              setRole(
                e.target.value
              )
            }

            className="auth-select"
          >

            <option value="employee">

              Employee

            </option>

            <option value="manager">

              Manager

            </option>

            <option value="admin">

              Admin / HR

            </option>

          </select>

          {/* BUTTON */}
          <button
            onClick={
              handleRegister
            }
            className="auth-btn"
          >

            Register

          </button>

          {/* FOOTER */}
          <p className="auth-footer">

            Already have an account?

            {" "}

            <Link to="/">

              Login Here

            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;