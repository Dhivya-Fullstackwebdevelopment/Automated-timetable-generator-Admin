import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Department, Staff, Subject, Timetable, TimetableCell, Semester } from "@/types/timetable";
import { DAYS, PERIODS } from "@/types/timetable";

interface AppState {
  departments: Department[];
  staff: Staff[];
  subjects: Subject[];
  timetables: Timetable[];
  addDepartment: (dept: Omit<Department, "id">) => void;
  deleteDepartment: (id: string) => void;
  addStaff: (s: Omit<Staff, "id">) => void;
  updateStaff: (s: Staff) => void;
  deleteStaff: (id: string) => void;
  addSubject: (s: Omit<Subject, "id">) => void;
  deleteSubject: (id: string) => void;
  generateTimetable: (params: {
    departmentId: string;
    semester?: Semester;
    year?: number;
    classLevel?: string;
  }) => Timetable;
  deleteTimetable: (id: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export const useAppState = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
};

const uid = () => Math.random().toString(36).slice(2, 10);

// Sample data
const INITIAL_DEPARTMENTS: Department[] = [
  { id: "d1", name: "Computer Science", type: "College" },
  { id: "d2", name: "Mathematics", type: "College" },
  { id: "d3", name: "Class 10", type: "School" },
];

const INITIAL_STAFF: Staff[] = [
  { id: "s1", name: "Dr. Priya", departmentId: "d1", subjects: ["Data Structures", "Python"], status: "Active", availableShift: "Both" },
  { id: "s2", name: "Mr. Kumar", departmentId: "d1", subjects: ["DBMS", "OS"], status: "Active", availableShift: "Odd" },
  { id: "s3", name: "Mrs. Lakshmi", departmentId: "d1", subjects: ["Networks", "Python"], status: "Active", availableShift: "Even" },
  { id: "s4", name: "Dr. Ramesh", departmentId: "d2", subjects: ["Calculus", "Linear Algebra"], status: "Active", availableShift: "Both" },
  { id: "s5", name: "Mrs. Kavitha", departmentId: "d3", subjects: ["Maths", "Science"], status: "Active", availableShift: "Both" },
  { id: "s6", name: "Mr. Raj", departmentId: "d3", subjects: ["English", "Social"], status: "Active", availableShift: "Both" },
];

const INITIAL_SUBJECTS: Subject[] = [
  { id: "sub1", name: "Data Structures", departmentId: "d1", semester: "Odd", weeklyHours: 5, isLab: false, year: 2 },
  { id: "sub2", name: "Python", departmentId: "d1", semester: "Odd", weeklyHours: 4, isLab: false, year: 2 },
  { id: "sub3", name: "DBMS", departmentId: "d1", semester: "Odd", weeklyHours: 4, isLab: false, year: 2 },
  { id: "sub4", name: "OS", departmentId: "d1", semester: "Odd", weeklyHours: 4, isLab: false, year: 2 },
  { id: "sub5", name: "Networks", departmentId: "d1", semester: "Even", weeklyHours: 4, isLab: false, year: 2 },
  { id: "sub6", name: "DS Lab", departmentId: "d1", semester: "Odd", weeklyHours: 3, isLab: true, year: 2 },
  { id: "sub7", name: "Maths", departmentId: "d3", weeklyHours: 6, isLab: false, classLevel: "10" },
  { id: "sub8", name: "Science", departmentId: "d3", weeklyHours: 6, isLab: false, classLevel: "10" },
  { id: "sub9", name: "English", departmentId: "d3", weeklyHours: 6, isLab: false, classLevel: "10" },
  { id: "sub10", name: "Social", departmentId: "d3", weeklyHours: 5, isLab: false, classLevel: "10" },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [staff, setStaff] = useState<Staff[]>(INITIAL_STAFF);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [timetables, setTimetables] = useState<Timetable[]>([]);

  const addDepartment = useCallback((dept: Omit<Department, "id">) => {
    setDepartments(prev => [...prev, { ...dept, id: uid() }]);
  }, []);

  const deleteDepartment = useCallback((id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
  }, []);

  const addStaff = useCallback((s: Omit<Staff, "id">) => {
    setStaff(prev => [...prev, { ...s, id: uid() }]);
  }, []);

  const updateStaff = useCallback((s: Staff) => {
    setStaff(prev => prev.map(x => x.id === s.id ? s : x));
  }, []);

  const deleteStaff = useCallback((id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id));
  }, []);

  const addSubject = useCallback((s: Omit<Subject, "id">) => {
    setSubjects(prev => [...prev, { ...s, id: uid() }]);
  }, []);

  const deleteSubject = useCallback((id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  }, []);

  const deleteTimetable = useCallback((id: string) => {
    setTimetables(prev => prev.filter(t => t.id !== id));
  }, []);

  const generateTimetable = useCallback((params: {
    departmentId: string;
    semester?: Semester;
    year?: number;
    classLevel?: string;
  }): Timetable => {
    const dept = departments.find(d => d.id === params.departmentId);
    const activeStaff = staff.filter(s =>
      s.departmentId === params.departmentId && s.status === "Active"
    );

    let deptSubjects = subjects.filter(s => s.departmentId === params.departmentId);
    if (params.semester) {
      deptSubjects = deptSubjects.filter(s => s.semester === params.semester);
    }
    if (params.year) {
      deptSubjects = deptSubjects.filter(s => s.year === params.year);
    }
    if (params.classLevel) {
      deptSubjects = deptSubjects.filter(s => s.classLevel === params.classLevel);
    }

    // Build allocation pool
    const pool: { subject: string; staff: string; isLab: boolean }[] = [];
    for (const sub of deptSubjects) {
      const eligible = activeStaff.filter(st => st.subjects.includes(sub.name));
      if (eligible.length === 0) continue;
      for (let h = 0; h < sub.weeklyHours; h++) {
        const teacher = eligible[h % eligible.length];
        pool.push({ subject: sub.name, staff: teacher.name, isLab: sub.isLab });
      }
    }

    // Shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const totalSlots = DAYS.length * PERIODS.length;
    const grid: TimetableCell[][] = DAYS.map(() =>
      PERIODS.map(() => ({ subject: "", staff: "" }))
    );

    // Track staff assignments to avoid double booking
    const staffSlots: Record<string, Set<string>> = {};

    let poolIdx = 0;
    for (let d = 0; d < DAYS.length && poolIdx < pool.length; d++) {
      for (let p = 0; p < PERIODS.length && poolIdx < pool.length; p++) {
        const item = pool[poolIdx];
        const slotKey = `${d}-${p}`;

        if (!staffSlots[item.staff]) staffSlots[item.staff] = new Set();

        if (staffSlots[item.staff].has(slotKey)) {
          // Try to find another slot - simple skip for now
          continue;
        }

        if (item.isLab && p < PERIODS.length - 1 && grid[d][p].subject === "" && grid[d][p + 1].subject === "") {
          grid[d][p] = { subject: item.subject, staff: item.staff, isLab: true };
          grid[d][p + 1] = { subject: item.subject, staff: item.staff, isLab: true };
          staffSlots[item.staff].add(slotKey);
          staffSlots[item.staff].add(`${d}-${p + 1}`);
          poolIdx++;
          p++; // skip next
        } else if (!item.isLab) {
          grid[d][p] = { subject: item.subject, staff: item.staff };
          staffSlots[item.staff].add(slotKey);
          poolIdx++;
        } else {
          poolIdx++; // skip lab if can't fit
        }
      }
    }

    const tt: Timetable = {
      id: uid(),
      departmentId: params.departmentId,
      semester: params.semester,
      year: params.year,
      classLevel: params.classLevel,
      grid,
      generatedAt: new Date().toISOString(),
    };

    setTimetables(prev => [...prev, tt]);
    return tt;
  }, [departments, staff, subjects]);

  return (
    <AppContext.Provider value={{
      departments, staff, subjects, timetables,
      addDepartment, deleteDepartment,
      addStaff, updateStaff, deleteStaff,
      addSubject, deleteSubject,
      generateTimetable, deleteTimetable,
    }}>
      {children}
    </AppContext.Provider>
  );
}
