import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Sidebar, TopBar } from "../components/shared/Layout";
import DashboardCards from "../components/shared/DashboardCards";
import { ManageHeaders } from "../components/admin/UserProfileCard";
import { dashboardService } from "../services/apiService";

// ─── Shared Page Wrapper ──────────────────────────────────────────────────────
function DashboardPage({ territory, extraTabs }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [topbarStats, setTopbarStats] = useState(null);
  const [sidebarWidth] = useState(220);

  // Expose setter so DashboardCards can update topbar
  useEffect(() => {
    window.setTopbarStats = setTopbarStats;
    return () => { delete window.setTopbarStats; };
  }, []);

  const tabs = [
    { id:"dashboard", label:"📊 Dashboard" },
    ...(extraTabs || []),
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#020817", fontFamily:"DM Sans, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>
      <Sidebar />
      <TopBar stats={topbarStats} sidebarWidth={sidebarWidth}/>

      {/* Main content */}
      <div style={{ marginLeft:sidebarWidth, paddingTop:60 }}>
        <div style={{ padding:"24px 28px" }}>
          {/* Tabs */}
          {tabs.length > 1 && (
            <div style={{ display:"flex", gap:4, marginBottom:24, borderBottom:"1px solid #1e293b", paddingBottom:0 }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding:"10px 18px", background:"transparent", border:"none",
                    cursor:"pointer", fontFamily:"DM Sans", fontSize:13, fontWeight:600,
                    color: activeTab === tab.id ? "#818cf8" : "#475569",
                    borderBottom: activeTab === tab.id ? "2px solid #6366f1" : "2px solid transparent",
                    transition:"all 0.15s", marginBottom:-1
                  }}>
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Tab Content */}
          {activeTab === "dashboard" && <DashboardCards territory={territory}/>}
          {activeTab === "employees" && <ManageHeaders/>}
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN Dashboard ──────────────────────────────────────────────────────────
export function AdminDashboard() {
  return (
    <DashboardPage
      territory="india"
      extraTabs={[
        { id:"employees", label:"👔 Manage Headers" },
      ]}
    />
  );
}

// ─── NATIONAL Dashboard ───────────────────────────────────────────────────────
export function NationalDashboard() {
  const { user } = useAuth();
  return <DashboardPage territory={user?.territory || "india"}/>;
}

// ─── STATE Dashboard ──────────────────────────────────────────────────────────
export function StateDashboard() {
  const { user } = useAuth();
  return <DashboardPage territory={user?.territory || "state"}/>;
}

// ─── REGIONAL Dashboard ───────────────────────────────────────────────────────
export function RegionalDashboard() {
  const { user } = useAuth();
  return <DashboardPage territory={user?.territory || "regional"}/>;
}
