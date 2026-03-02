import { useState } from "react";
import { useAppState } from "@/context/AppContext";
import type { Semester } from "@/types/timetable";
import { BookOpen, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function SubjectManager() {
  const { subjects, departments, addSubject, deleteSubject } = useAppState();
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [semester, setSemester] = useState<Semester | "">("");
  const [weeklyHours, setWeeklyHours] = useState("4");
  const [isLab, setIsLab] = useState(false);
  const [year, setYear] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [filterDept, setFilterDept] = useState<string>("all");

  const selectedDept = departments.find(d => d.id === departmentId);

  const handleAdd = () => {
    if (!name.trim() || !departmentId) return;
    addSubject({
      name: name.trim(),
      departmentId,
      semester: semester || undefined,
      weeklyHours: parseInt(weeklyHours) || 4,
      isLab,
      year: year ? parseInt(year) : undefined,
      classLevel: classLevel || undefined,
    });
    setName("");
    setWeeklyHours("4");
    setIsLab(false);
    setYear("");
    setClassLevel("");
  };

  const filtered = filterDept === "all" ? subjects : subjects.filter(s => s.departmentId === filterDept);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display">Subject Management</h2>
        <p className="text-muted-foreground mt-1">Add subjects per department, semester, and year</p>
      </div>

      <div className="card-elevated p-6">
        <h3 className="font-semibold font-display mb-4">Add New Subject</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Input placeholder="Subject name" value={name} onChange={e => setName(e.target.value)} />
          <Select value={departmentId} onValueChange={setDepartmentId}>
            <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              {departments.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Weekly hours" type="number" value={weeklyHours} onChange={e => setWeeklyHours(e.target.value)} />
          
          {selectedDept?.type === "College" && (
            <>
              <Select value={semester} onValueChange={v => setSemester(v as Semester)}>
                <SelectTrigger><SelectValue placeholder="Semester" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Odd">Odd Semester</SelectItem>
                  <SelectItem value="Even">Even Semester</SelectItem>
                </SelectContent>
              </Select>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1st Year</SelectItem>
                  <SelectItem value="2">2nd Year</SelectItem>
                  <SelectItem value="3">3rd Year</SelectItem>
                  <SelectItem value="4">4th Year</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}

          {selectedDept?.type === "School" && (
            <Select value={classLevel} onValueChange={setClassLevel}>
              <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>Class {i + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Switch checked={isLab} onCheckedChange={setIsLab} id="lab" />
          <Label htmlFor="lab">Lab subject (2 continuous periods)</Label>
        </div>
        <Button onClick={handleAdd} className="mt-3">
          <Plus className="w-4 h-4 mr-1" /> Add Subject
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Filter:</span>
        <Select value={filterDept} onValueChange={setFilterDept}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(d => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(s => {
          const dept = departments.find(d => d.id === s.departmentId);
          return (
            <div key={s.id} className="card-hover p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-semibold font-display">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {dept?.name} • {s.weeklyHours}h/week
                    {s.semester && ` • ${s.semester}`}
                    {s.year && ` • Year ${s.year}`}
                    {s.classLevel && ` • Class ${s.classLevel}`}
                    {s.isLab && " • 🔬 Lab"}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteSubject(s.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
