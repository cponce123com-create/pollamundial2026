import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Header from "./components/Header";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Participants from "./pages/Participants";
import RankingPage from "./pages/Ranking";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/participants" element={<Participants />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Toaster position="top-right" theme="dark" />
    </div>
  );
}
