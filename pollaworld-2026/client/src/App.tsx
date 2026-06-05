import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Participants from "./pages/Participants";
import RankingPage from "./pages/Ranking";
import Admin from "./pages/Admin";
import Teams from "./pages/Teams";
import { AuthProvider, useAuth } from "./lib/AuthContext";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="placeholder-page">
        <p className="placeholder-text">Cargando...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="placeholder-page">
        <p className="placeholder-text">Cargando...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/participants" element={<Participants />} />
      <Route path="/ranking" element={<RankingPage />} />
      <Route path="/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Header />
        <main className="main-content">
          <AppRoutes />
        </main>
        <Toaster position="top-right" theme="dark" />
      </div>
    </AuthProvider>
  );
}
