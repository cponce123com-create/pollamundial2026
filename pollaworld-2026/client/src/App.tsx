import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import Header from "./components/Header";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Participants from "./pages/Participants";
import RankingPage from "./pages/Ranking";
import Admin from "./pages/Admin";
import { api } from "./lib/api";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.me()
      .then(() => setAuthed(true))
      .catch(() => {
        setAuthed(false);
        navigate("/login");
      })
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="placeholder-page">
        <p className="placeholder-text">Cargando...</p>
      </div>
    );
  }

  if (!authed) return null;

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.me()
      .then((data) => {
        if (data.user.role === "admin") {
          setIsAdmin(true);
        } else {
          navigate("/dashboard");
        }
      })
      .catch(() => navigate("/login"))
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="placeholder-page">
        <p className="placeholder-text">Cargando...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return <>{children}</>;
}

export default function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/participants"
            element={
              <ProtectedRoute>
                <Participants />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ranking"
            element={
              <ProtectedRoute>
                <RankingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
        </Routes>
      </main>
      <Toaster position="top-right" theme="dark" />
    </div>
  );
}
