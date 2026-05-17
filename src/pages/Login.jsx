import { useState } from "react";

import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  collection,
  getDocs,
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

function Login() {

  const navigate =
    useNavigate();

  const [email,
  setEmail] =
    useState("");

  const [password,
  setPassword] =
    useState("");

  // LOGIN
  const handleLogin =
  async () => {

    if (
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
      await signInWithEmailAndPassword(

        auth,

        email,

        password
      );

      // GET ROLE
      const querySnapshot =
        await getDocs(
          collection(
            db,
            "users"
          )
        );

      let role = "";

      querySnapshot.forEach(
        (docItem) => {

          const user =
            docItem.data();

          if (
            user.email ===
            email
          ) {

            role =
              user.role;
          }
        }
      );

      // ROUTING
      if (
        role ===
        "employee"
      ) {

        navigate(
          "/dashboard"
        );
      }

      else if (
        role ===
        "manager"
      ) {

        navigate(
          "/manager"
        );
      }

      else if (
        role ===
        "admin"
      ) {

        navigate(
          "/admin"
        );
      }

      else {

        alert(
          "Role not found"
        );
      }

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

            Enterprise Goal Management Platform

          </p>

          <div className="brand-features">

            <div className="feature-item">

              ✔ Goal Creation & Approval

            </div>

            <div className="feature-item">

              ✔ Quarterly Achievement Tracking

            </div>

            <div className="feature-item">

              ✔ Shared KPI Synchronization

            </div>

            <div className="feature-item">

              ✔ Audit Trail & Governance

            </div>

          </div>

        </div>

        {/* RIGHT */}
        <div className="auth-right">

          <h1 className="auth-title">

            Welcome Back

          </h1>

          <p className="auth-subtitle">

            Login to continue

          </p>

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

          {/* BUTTON */}
          <button
            onClick={
              handleLogin
            }
            className="auth-btn"
          >

            Login

          </button>

          {/* FOOTER */}
          <p className="auth-footer">

            Don’t have an account?

            {" "}

            <Link to="/register">

              Register Here

            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;