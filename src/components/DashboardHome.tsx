import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  BookOpen,
  Calendar,
  GraduationCap,
  School,
} from "lucide-react";
import { toast } from "sonner";
import { BASE_URL } from "@/api/apiurl";
import axios from "axios";

interface Department {
  id: number;
  name: string;
  type: number;
}

interface DashboardData {
  departments: {
    total: number;
    list: Department[];
  };

  staff: {
    active: number;
    on_leave: number;
    resigned: number;
  };

  subjects: {
    total: number;
    lab_subjects: number;
  };

  timetables: {
    total: number;
  };
}

export function DashboardHome() {

  const [dashboardData, setDashboardData] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {

      setLoading(true);

      const response = await axios.get(
        `${BASE_URL}/api/timetable/dashboard/`
      );

      const data = response.data;
      if (data.status) {
        setDashboardData(data.data);

      } else {
        toast.error(
          data.message ||
          "Failed to fetch dashboard data"
        );
      }

    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
        "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const schoolDepts =
    dashboardData?.departments?.list.filter(
      (d) => d.type === 1
    ).length || 0;

  const collegeDepts =
    dashboardData?.departments?.list.filter(
      (d) => d.type === 2
    ).length || 0;

  const stats = [
    {
      label: "Departments",
      value:
        dashboardData?.departments?.total || 0,
      icon: Building2,
      sub: `${schoolDepts} School • ${collegeDepts} College`,
    },

    {
      label: "Active Staff",
      value:
        dashboardData?.staff?.active || 0,
      icon: Users,
      sub: `${dashboardData?.staff?.on_leave || 0
        } on leave • ${dashboardData?.staff?.resigned || 0
        } resigned`,
    },

    {
      label: "Subjects",
      value:
        dashboardData?.subjects?.total || 0,
      icon: BookOpen,
      sub: `${dashboardData?.subjects?.lab_subjects || 0
        } lab subjects`,
    },

   
  ];

  if (loading) {
    return (
      <div className="space-y-8">

        <div>
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />

          <div className="h-4 w-72 bg-muted animate-pulse rounded mt-2" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {Array.from({ length: 4 }).map((_, i) => (

            <div
              key={i}
              className="card-hover p-5 space-y-4"
            >

              <div className="flex items-center justify-between">

                <div className="w-11 h-11 rounded-xl bg-muted animate-pulse" />

                <div className="h-8 w-12 bg-muted animate-pulse rounded" />

              </div>

              <div className="h-4 w-24 bg-muted animate-pulse rounded" />

              <div className="h-3 w-32 bg-muted animate-pulse rounded" />

            </div>

          ))}

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Automated Timetable Management System
        </p>

      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {stats.map((stat) => (

          <div
            key={stat.label}
            className="card-hover p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-3xl font-bold font-display">
                {stat.value}
              </span>
            </div>

            <p className="font-semibold font-display">
              {stat.label}
            </p>

            <p className="text-xs text-muted-foreground mt-0.5">
              {stat.sub}
            </p>
          </div>

        ))}

      </div>

      {/* School & College */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* School */}
        <div className="card-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <School className="w-5 h-5 text-primary" />
            <h3 className="font-bold font-display">
              School
            </h3>
          </div>

          <p className="text-sm text-muted-foreground">
            Manage class-wise timetables
            (1–12) with subject and teacher allocation.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">

            {dashboardData?.departments?.list
              ?.filter((d) => d.type === 1)
              ?.map((d) => (
                <span
                  key={d.id}
                  className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground font-medium"
                >
                  {d.name}
                </span>
              ))}
          </div>
        </div>

        {/* College */}
        <div className="card-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h3 className="font-bold font-display">
              College
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Department-wise scheduling with
            Odd/Even semester support,
            lab allocations, and staff tracking.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {dashboardData?.departments?.list
              ?.filter((d) => d.type === 2)
              ?.map((d) => (
                <span
                  key={d.id}
                  className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground font-medium"
                >
                  {d.name}
                </span>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}