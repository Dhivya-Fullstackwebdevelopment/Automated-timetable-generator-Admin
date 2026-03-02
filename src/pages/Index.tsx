import { useState } from "react";
import { AppProvider } from "@/context/AppContext";
import { DashboardHome } from "@/components/DashboardHome";
import { DepartmentManager } from "@/components/DepartmentManager";
import { StaffManager } from "@/components/StaffManager";
import { SubjectManager } from "@/components/SubjectManager";
import { TimetableGenerator } from "@/components/TimetableGenerator";
import {
  LayoutDashboard,
  Building2,
  Users,
  BookOpen,
  Calendar,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";

type Page = "dashboard" | "departments" | "staff" | "subjects" | "timetable";

const NAV_ITEMS: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "departments", label: "Departments", icon: Building2 },
  { id: "staff", label: "Staff", icon: Users },
  { id: "subjects", label: "Subjects", icon: BookOpen },
  { id: "timetable", label: "Timetable", icon: Calendar },
];

function AppContent() {
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DashboardHome />;
      case "departments": return <DepartmentManager />;
      case "staff": return <StaffManager />;
      case "subjects": return <SubjectManager />;
      case "timetable": return <TimetableGenerator />;
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-sidebar flex flex-col
        transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="p-5 flex items-center gap-3 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold font-display text-sidebar-foreground text-sm">TimeTable</h1>
            <p className="text-[10px] text-sidebar-foreground/60">Auto Scheduler</p>
          </div>
          <button className="ml-auto lg:hidden text-sidebar-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(item => {
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setPage(item.id); setSidebarOpen(false); }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }
                `}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <p className="text-[10px] text-sidebar-foreground/40 text-center">
            © 2026 Timetable System
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="font-display font-semibold text-sm capitalize">{page}</h2>
        </header>
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

const Index = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default Index;
