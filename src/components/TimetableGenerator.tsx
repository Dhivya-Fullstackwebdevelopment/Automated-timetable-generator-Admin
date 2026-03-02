import { useState, useRef } from "react";
import { useAppState } from "@/context/AppContext";
import type { Semester, Timetable } from "@/types/timetable";
import { DAYS, PERIODS } from "@/types/timetable";
import { Calendar, Download, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export function TimetableGenerator() {
  const { departments, timetables, generateTimetable, deleteTimetable } = useAppState();
  const [departmentId, setDepartmentId] = useState("");
  const [semester, setSemester] = useState<Semester | "">("");
  const [year, setYear] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [currentTT, setCurrentTT] = useState<Timetable | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const selectedDept = departments.find(d => d.id === departmentId);

  const handleGenerate = () => {
    if (!departmentId) return;
    const tt = generateTimetable({
      departmentId,
      semester: semester as Semester || undefined,
      year: year ? parseInt(year) : undefined,
      classLevel: classLevel || undefined,
    });
    setCurrentTT(tt);
  };

  const handleDownload = async () => {
    if (!tableRef.current) return;
    const canvas = await html2canvas(tableRef.current, { scale: 2, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("landscape", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);

    const deptName = selectedDept?.name || "Timetable";
    pdf.save(`${deptName}_Timetable.pdf`);
  };

  const viewTT = (tt: Timetable) => setCurrentTT(tt);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display">Timetable Generator</h2>
        <p className="text-muted-foreground mt-1">Generate conflict-free schedules automatically</p>
      </div>

      <div className="card-elevated p-6">
        <h3 className="font-semibold font-display mb-4">Generate New Timetable</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select value={departmentId} onValueChange={v => { setDepartmentId(v); setSemester(""); setYear(""); setClassLevel(""); }}>
            <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
            <SelectContent>
              {departments.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name} ({d.type})</SelectItem>
              ))}
            </SelectContent>
          </Select>

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
                <th className="timetable-header rounded-tl-lg">Day / Period</th>
                {PERIODS.map(p => (
                  <th key={p} className={`timetable-header ${p === 8 ? 'rounded-tr-lg' : ''}`}>
                    Period {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day, di) => (
                <tr key={day}>
                  <td className={`timetable-day ${di === DAYS.length - 1 ? 'rounded-bl-lg' : ''}`}>{day}</td>
                  {PERIODS.map((_, pi) => {
                    const cell = currentTT.grid[di]?.[pi];
                    if (!cell || !cell.subject) {
                      return <td key={pi} className="timetable-cell bg-muted/30">—</td>;
                    }
                    return (
                      <td key={pi} className={`timetable-cell ${cell.isLab ? 'bg-accent/10' : ''}`}>
                        <div className="font-semibold text-xs">{cell.subject}</div>
                        <div className="text-xs text-muted-foreground">{cell.staff}</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {timetables.length > 0 && (
        <div>
          <h3 className="font-semibold font-display mb-3">Generated Timetables History</h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {timetables.map(tt => {
              const dept = departments.find(d => d.id === tt.departmentId);
              return (
                <div key={tt.id} className="card-hover p-3 flex items-center justify-between cursor-pointer" onClick={() => viewTT(tt)}>
                  <div>
                    <p className="font-semibold text-sm">{dept?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {tt.semester && `${tt.semester} • `}
                      {tt.year && `Year ${tt.year} • `}
                      {tt.classLevel && `Class ${tt.classLevel} • `}
                      {new Date(tt.generatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); deleteTimetable(tt.id); }}>
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
