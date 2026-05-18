import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Manager from "./pages/Manager";
import Admin from "./pages/Admin";
import SharedKPI from "./pages/SharedKPI";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* AUTH */}
        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* EMPLOYEE */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* MANAGER */}
        <Route
          path="/manager"
          element={<Manager />}
        />

        {/* SHARED KPI */}
        <Route
          path="/SharedKPI"
          element={<SharedKPI />}
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={<Admin />}
        />

        {/* INVALID ROUTES */}
        <Route
          path="*"
          element={
            <Navigate to="/" />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;