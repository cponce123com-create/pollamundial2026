import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Toaster } from "sonner";
import Header from "./components/Header";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import { useSSE } from "./lib/useSSE";

// Lazy-loaded pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Participants = lazy(() => import("./pages/Participants"));
const RankingPage = lazy(() => import("./pages/Ranking"));
const Admin = lazy(() => import("./pages/Admin"));
const Teams = lazy(() => import("./pages/Teams"));
const Profile = lazy(() => import("./pages/Profile"));

function PageLoader() {
  return (
    <div className="placeholder-page">
      <div className="skeleton-loader" aria-label="Cargando..." />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/participants" element={<Participants />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
      </Routes>
    </Suspense>
  );
}

function SSEConnector() {
  useSSE();
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="app">
        <SSEConnector />
        <Header />
        <main className="main-content">
          <AppRoutes />
        </main>
        <Toaster position="top-right" theme="dark" />
      </div>
    </AuthProvider>
  );
}
