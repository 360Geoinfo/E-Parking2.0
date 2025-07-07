import { Routes, Route, useLocation } from "react-router-dom";

// src/pages/
import { Link } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import Logo from "./assets/Logo/Logo.png";

import "./App.css";
import "./Tailwind.css";
import { links, routes } from "./consts";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Brunei");

const currentDate = dayjs().format("dddd, MMMM D, YYYY");
function App() {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };
  const location = useLocation();
  return (
    <div className="App">
      <div className="dashboard-container">
        <aside className="sidebar">
          <div className="sidebar-header">
            <img src={Logo} alt="Logo" className="logo-home" />
            <button
              className="back-button"
              onClick={() => window.history.back()}
            >
              &laquo;
            </button>
          </div>
          <nav className="sidebar-nav">
            <ul>
              {links.map((link) => (
                <li
                  key={link.name}
                  className={location.pathname === link.path ? "active" : ""}
                >
                  <Link
                    to={link.path}
                    className={`sidebar-link ${
                      location.pathname === link.path ? "active" : ""
                    }`}
                  >
                    <link.icon className="icon" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt className="icon" /> Logout
          </button>
        </aside>
        <main className="dashboard-content">
          <div className="top-bar">
            <div className="page-title">
              {links.find((link) => link.path === location.pathname)?.name ||
                "Dashboard"}
            </div>
            <div className="top-bar-right">
              <div className="date">{currentDate}</div>
              <div className="profile">
                <img
                  src="https://i.pravatar.cc/40"
                  alt="Profile"
                  className="profile-avatar"
                />
                <span className="profile-name">Admin</span>
              </div>
            </div>
          </div>
          <Routes>
            {routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<route.component />}
              />
            ))}
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
