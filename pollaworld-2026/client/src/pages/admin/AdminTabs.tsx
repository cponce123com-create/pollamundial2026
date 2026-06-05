type AdminTab = "matches" | "payments" | "config" | "export";

interface AdminTabsProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  pendingCount: number;
}

export default function AdminTabs({ activeTab, onTabChange, pendingCount }: AdminTabsProps) {
  const tabs: { key: AdminTab; label: string; icon: string }[] = [
    { key: "matches", label: "Partidos", icon: "\u26bd" },
    { key: "payments", label: "Pagos", icon: "\ud83d\udcb3" },
    { key: "config", label: "Configuraci\u00f3n", icon: "\u2699\ufe0f" },
    { key: "export", label: "Exportar", icon: "\ud83d\udcc4" },
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
