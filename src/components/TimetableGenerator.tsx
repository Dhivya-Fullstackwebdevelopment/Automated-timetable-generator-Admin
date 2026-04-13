import { useState, useRef, useEffect } from "react";
import type { Semester, Timetable } from "@/types/timetable";
import { Calendar, Download, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { generateTimetableApi } from "@/api/timetableApi";
import { getDepartments } from "@/api/departmentApi";

// ✅ Define proper types
interface TimetablePeriod {
  subject: string;
  staff: string;
}

interface TimetableDayData {
  day: string;
  periods: TimetablePeriod[];
}

interface TimetableEntry {
  id: number;
  departmentId: string;
  semester: string;
  year: string;
  classLevel: string;
  generatedAt: number;
  data: TimetableDayData[];
}

interface CurrentTT {
  semester: string;
  year: string;
  classLevel: string;
  generatedAt: number;
  rows: TimetableDayData[];
}

export function TimetableGenerator() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [semester, setSemester] = useState<Semester | "">("");
  const [year, setYear] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [currentTT, setCurrentTT] = useState<CurrentTT | null>(null); // ✅ null by default
  const tableRef = useRef<HTMLDivElement>(null);
  const [timetables, setTimetables] = useState<TimetableEntry[]>([]);

  const selectedDept = departments.find((d) => String(d.id) === departmentId);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    const res = await getDepartments();
    setDepartments(res.data.data);
  };

  const handleGenerate = async () => {
    const isSchool = selectedDept?.type === 1;

    if (!departmentId) {
      alert("Please select a department");
      return;
    }

    if (!isSchool && (!year || !semester)) {
      alert("Please select semester and year");
      return;
    }

    if (isSchool && !classLevel) {
      alert("Please select a class");
      return;
    }

    try {
      const res = await generateTimetableApi({
        department: Number(departmentId),
        year: Number(year),
        semester: semester.toUpperCase(),
      });

      const apiData: TimetableDayData[] = res.data.data;
      const generatedAt = Date.now();

      const newCurrentTT: CurrentTT = {
        semester,
        year,
        classLevel,
        generatedAt,
        rows: apiData,
      };

      setCurrentTT(newCurrentTT);

      // ✅ Save to history
      setTimetables((prev) => [
        ...prev,
        {
          id: generatedAt,
          departmentId,
          semester,
          year,
          classLevel,
          generatedAt,
          data: apiData,
        },
      ]);
    } catch (error) {
      console.error(error);
      alert("Failed to generate timetable ❌");
    }
  };

  const handleDownload = async () => {
    if (!tableRef.current) return;
    const canvas = await html2canvas(tableRef.current, {
      scale: 2,
      backgroundColor: "#ffffff",
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("landscape", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);

    const deptName = selectedDept?.name || "Timetable";
    pdf.save(`${deptName}_Timetable.pdf`);
  };

  const viewTT = (tt: TimetableEntry) => {
    setCurrentTT({
      semester: tt.semester,
      year: tt.year,
      classLevel: tt.classLevel,
      generatedAt: tt.generatedAt,
      rows: tt.data,
    });
  };

  const deleteTimetable = (id: number) => {
    setTimetables((prev) => prev.filter((tt) => tt.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display">Timetable Generator</h2>
        <p className="text-muted-foreground mt-1">
          Generate conflict-free schedules automatically
        </p>
      </div>

      <div className="card-elevated p-6">
        <h3 className="font-semibold font-display mb-4">
          Generate New Timetable
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select value={departmentId} onValueChange={(v) => setDepartmentId(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((d) => (
                <SelectItem key={d.id} value={String(d.id)}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedDept?.type === 2 && (
            <>
              <Select value={semester} onValueChange={(v) => setSemester(v as Semester)}>
                <SelectTrigger>
                  <SelectValue placeholder="Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Odd">Odd Semester</SelectItem>
                  <SelectItem value="Even">Even Semester</SelectItem>
                </SelectContent>
              </Select>

              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1st Year</SelectItem>
                  <SelectItem value="2">2nd Year</SelectItem>
                  <SelectItem value="3">3rd Year</SelectItem>
                  <SelectItem value="4">4th Year</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}

          {selectedDept?.type === 1 && (
            <Select value={classLevel} onValueChange={setClassLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    Class {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex gap-3 mt-4">
          <Button onClick={handleGenerate} disabled={!departmentId}>
            <Calendar className="w-4 h-4 mr-1" /> Generate Timetable
          </Button>

          {currentTT && (
            <>
              <Button variant="outline" onClick={handleGenerate}>
                <RefreshCw className="w-4 h-4 mr-1" /> Regenerate
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-1" /> Download PDF
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ✅ Table - now uses currentTT.rows */}
      {currentTT && (
        <div className="card-elevated p-6 overflow-x-auto" ref={tableRef}>
          <div className="mb-4">
            <h3 className="font-bold font-display text-lg">
              {selectedDept?.name} — Timetable
              {currentTT.semester && ` (${currentTT.semester} Semester)`}
              {currentTT.year && ` — Year ${currentTT.year}`}
              {currentTT.classLevel && ` — Class ${currentTT.classLevel}`}
            </h3>
            <p className="text-xs text-muted-foreground">
              Generated: {new Date(currentTT.generatedAt).toLocaleString()}
            </p>
          </div>

          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr>
                <th className="timetable-header">Day / Period</th>
                {[
                  "09:00 AM - 09:50 AM",
                  "09:50 AM - 10:40 AM",
                  "10:50 AM - 11:40 AM",
                  "11:40 AM - 12:30 PM",
                  "01:20 PM - 02:10 PM",
                  "02:10 PM - 03:00 PM",
                  "03:10 PM - 04:00 PM",
                  "04:00 PM - 04:50 PM",
                ].map((time, i) => (
                  <th key={i} className="timetable-header">
                    Period {i + 1}
                    <div className="text-xs text-white">{time}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* ✅ Iterate over currentTT.rows instead of currentTT directly */}
              {currentTT.rows.map((dayData, di) => (
                <tr key={dayData.day}>
                  <td className="timetable-day">{dayData.day}</td>
                  {dayData.periods.map((p, pi) => (
                    <td key={pi} className="timetable-cell">
                      <div className="font-semibold text-xs">{p.subject}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.staff}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* History */}
      {timetables.length > 0 && (
        <div>
          <h3 className="font-semibold font-display mb-3">
            Generated Timetables History
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {timetables.map((tt) => {
              const dept = departments.find(
                (d) => String(d.id) === tt.departmentId
              );
              return (
                <div
                  key={tt.id}
                  className="card-hover p-3 flex items-center justify-between cursor-pointer"
                  onClick={() => viewTT(tt)}
                >
                  <div>
                    <p className="font-semibold text-sm">{dept?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {tt.semester && `${tt.semester} • `}
                      {tt.year && `Year ${tt.year} • `}
                      {tt.classLevel && `Class ${tt.classLevel} • `}
                      {new Date(tt.generatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTimetable(tt.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}