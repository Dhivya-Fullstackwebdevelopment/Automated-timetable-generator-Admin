import { useAppState } from "@/context/AppContext";
import { Building2, Users, BookOpen, Calendar, GraduationCap, School } from "lucide-react";

export function DashboardHome() {
  const { departments, staff, subjects, timetables } = useAppState();

  const schoolDepts = departments.filter(d => d.type === "School").length;
  const collegeDepts = departments.filter(d => d.type === "College").length;
  const activeStaff = staff.filter(s => s.status === "Active").length;
  const onLeave = staff.filter(s => s.status === "Sick Leave" || s.status === "Emergency Leave").length;
  const resigned = staff.filter(s => s.status === "Resigned").length;

  const stats = [
    { label: "Departments", value: departments.length, icon: Building2, sub: `${schoolDepts} School • ${collegeDepts} College` },
    { label: "Active Staff", value: activeStaff, icon: Users, sub: `${onLeave} on leave • ${resigned} resigned` },
    { label: "Subjects", value: subjects.length, icon: BookOpen, sub: `${subjects.filter(s => s.isLab).length} lab subjects` },
    { label: "Timetables", value: timetables.length, icon: Calendar, sub: "Generated schedules" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Automated Timetable Management System</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => (
          <div key={stat.label} className="card-hover p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-3xl font-bold font-display">{stat.value}</span>
            </div>
            <p className="font-semibold font-display">{stat.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <School className="w-5 h-5 text-primary" />
            <h3 className="font-bold font-display">School</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage class-wise timetables (1–12) with subject and teacher allocation.
            No semester system — simple, direct scheduling.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {departments.filter(d => d.type === "School").map(d => (
              <span key={d.id} className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">
                {d.name}
              </span>
            ))}
          </div>
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h3 className="font-bold font-display">College</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Department-wise scheduling with Odd/Even semester support, year selection,
            lab allocations, and staff availability tracking.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {departments.filter(d => d.type === "College").map(d => (
              <span key={d.id} className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">
                {d.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
