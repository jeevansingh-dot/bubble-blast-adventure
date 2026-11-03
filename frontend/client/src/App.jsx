import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LevelsPage from "./pages/LevelsPage.jsx";
import GamePage from "./pages/GamePage.jsx";
import LeaderboardPage from "./pages/LeaderboardPage.jsx";
import AchievementsPage from "./pages/AchievementsPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

// a page that only logged-in players can open
const guard = (page) => <ProtectedRoute>{page}</ProtectedRoute>;

export default function App() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 12px",
        }}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* only for logged-in players */}
          <Route path="/dashboard" element={guard(<DashboardPage />)} />
          <Route path="/levels" element={guard(<LevelsPage />)} />
          <Route path="/game/:levelId" element={guard(<GamePage />)} />
          <Route path="/leaderboard" element={guard(<LeaderboardPage />)} />
          <Route path="/achievements" element={guard(<AchievementsPage />)} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}