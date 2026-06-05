type AdminTab = "matches" | "payments" | "config" | "export" | "players";

interface AdminTabsProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  pendingCount: number;
}

export default function AdminTabs({ activeTab, onTabChange, pendingCount }: AdminTabsProps) {
  const tabs: { key: AdminTab; label: string; icon: string }[] = [
    { key: "matches", label: "Partidos", icon: "⚽" },
    { key: "payments", label: "Pagos", icon: "💳" },
    { key: "players", label: "Jugadores", icon: "🏷️" },
    { key: "config", label: "Configuración", icon: "⚙️" },
    { key: "export", label: "Exportar", icon: "📄" },
  ];

  return (
    <div className="tabs">
      {tabs.map((t) => (
        <button
          key={t.key}
          className={"tab" + (activeTab === t.key ? " tab-active" : "")}
          onClick={() => onTabChange(t.key)}
        >
          {t.icon} {t.label}
          {t.key === "payments" && pendingCount > 0 && (
            <span className="tab-badge">{pendingCount}</span>
          )}
        </button>
      ))}
    </div>
  );
}
