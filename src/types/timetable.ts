export type InstitutionType = "School" | "College";

export type StaffStatus = "Active" | "Sick Leave" | "Emergency Leave" | "Resigned";

export type Semester = "Odd" | "Even";

export type ShiftAvailability = "Odd" | "Even" | "Both";

export interface Department {
  id: string;
  name: string;
  type: InstitutionType;
}

export interface Staff {
  id: string;
  name: string;
  departmentId: string;
  subjects: string[];
  status: StaffStatus;
  availableShift: ShiftAvailability;
}

export interface Subject {
  id: string;
  name: string;
  departmentId: string;
  semester?: Semester;
  weeklyHours: number;
  isLab: boolean;
  year?: number; // for college: 1,2,3,4
  classLevel?: string; // for school: "1"-"12"
}

export interface TimetableCell {
  subject: string;
  staff: string;
  isLab?: boolean;
}

export type TimetableRow = TimetableCell[];

export interface Timetable {
  id: string;
  departmentId: string;
  semester?: Semester;
  year?: number;
  classLevel?: string;
  grid: TimetableRow[]; // 6 days x 8 periods
  generatedAt: string;
}

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
export const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
