type AdminTab = "matches" | "payments" | "config" | "export" | "players" | "testing";

interface AdminTabsProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  pendingCount: number;
}

export default function AdminTabs({ activeTab, onTabChange, pendingCount }: AdminTabsProps) {
  const tabs = [
    { id: "payments" as AdminTab, label: "Pagos", icon: "💳", badge: pendingCount },
    { id: "matches" as AdminTab, label: "Partidos", icon: "⚽" },
    { id: "config" as AdminTab, label: "Config", icon: "⚙️" },
    { id: "export" as AdminTab, label: "Exportar", icon: "📤" },
    { id: "players" as AdminTab, label: "Jugadores", icon: "🏷️" },
    { id: "testing" as AdminTab, label: "Testing", icon: "🧪" },
  ];

  return (
    <div className="admin-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`admin-tab ${activeTab === tab.id ? "active" : ""} ${tab.id === "testing" ? "admin-tab-testing" : ""}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon} {tab.label}
          {tab.badge ? <span className="admin-tab-badge">{tab.badge}</span> : null}
        </button>
      ))}
    </div>
  );
}
