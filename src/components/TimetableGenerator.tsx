import { useState, useRef, useEffect } from "react";
import type { Semester } from "@/types/timetable";
import {
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react";

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

import { toast } from "sonner";

interface TimetablePeriod {
  subject: string;
  staff: string;
  room?: string;
  year?: string;

  staff_status: string;

  status?: string;

  original_staff?: string | null;

  substitute?: string | null;
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

  const [semester, setSemester] =
    useState<Semester | "">("");

  const [year, setYear] = useState("");

  const [classLevel, setClassLevel] = useState("");

  const [currentTT, setCurrentTT] =
    useState<CurrentTT | null>(null);

  const tableRef = useRef<HTMLDivElement>(null);

  const [timetables, setTimetables] =
    useState<TimetableEntry[]>([]);

  const selectedDept = departments.find(
    (d) => String(d.id) === departmentId
  );

  const [generateLoading, setGenerateLoading] =
    useState(false);

  const [regenerateLoading, setRegenerateLoading] =
    useState(false);

  const [downloadLoading, setDownloadLoading] =
    useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    const res = await getDepartments();

    setDepartments(res.data.data);
  };

  const handleGenerate = async (
    isRegenerate = false
  ) => {

    if (!departmentId) {
      toast.error("Please select department");
      return;
    }

    try {

      if (isRegenerate) {
        setRegenerateLoading(true);
      } else {
        setGenerateLoading(true);
      }

      let payload: any = {
        type: selectedDept?.type,
        department: Number(departmentId),
      };

      if (selectedDept?.type === 2) {
        payload.year = Number(year);
        payload.semester = semester.toUpperCase();
      }

      const res =
        await generateTimetableApi(payload);

      if (!res.data.status) {
        toast.error(
          res.data.message ||
          "Failed to generate timetable"
        );

        return;
      }

      const apiData: TimetableDayData[] =
        res.data.data;

      const generatedAt = Date.now();

      const newCurrentTT: CurrentTT = {
        semester,
        year,
        classLevel,
        generatedAt,
        rows: apiData,
      };

      setCurrentTT(newCurrentTT);

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

      toast.success("Timetable generated successfully");

    } catch (error: any) {

      toast.error(
        error?.response?.data?.message ||
        "Failed to generate timetable"
      );

    } finally {

      if (isRegenerate) {
        setRegenerateLoading(false);
      } else {
        setGenerateLoading(false);
      }
    }
  };

  const handleDownload = async () => {

    if (!tableRef.current) return;

    try {

      setDownloadLoading(true);

      const canvas = await html2canvas(
        tableRef.current,
        {
          scale: 2,
          backgroundColor: "#ffffff",
        }
      );

      const imgData =
        canvas.toDataURL("image/png");

      const pdf = new jsPDF(
        "landscape",
        "mm",
        "a4"
      );

      const pdfWidth =
        pdf.internal.pageSize.getWidth();

      const pdfHeight =
        (canvas.height * pdfWidth) /
        canvas.width;

      pdf.addImage(
        imgData,
        "PNG",
        0,
        10,
        pdfWidth,
        pdfHeight
      );

      pdf.save("Timetable.pdf");

      toast.success("PDF downloaded");

    } catch (error) {

      toast.error("Failed to download PDF");

    } finally {

      setDownloadLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-display">
          Timetable Generator
        </h2>

        <p className="text-muted-foreground mt-1">
          Generate conflict-free schedules automatically
        </p>
      </div>

      {/* Generate Section */}
      <div className="card-elevated p-6">

        <h3 className="font-semibold font-display mb-4">
          Generate New Timetable
        </h3>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          {/* Department */}
          <Select
            value={departmentId}
            onValueChange={setDepartmentId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>

            <SelectContent>
              {departments.map((d) => (
                <SelectItem
                  key={d.id}
                  value={String(d.id)}
                >
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Semester */}
          {selectedDept?.type === 2 && (
            <>
              <Select
                value={semester}
                onValueChange={(v) =>
                  setSemester(v as Semester)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semester" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Odd">
                    Odd Semester
                  </SelectItem>

                  <SelectItem value="Even">
                    Even Semester
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Year */}
              <Select
                value={year}
                onValueChange={setYear}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="1">
                    1st Year
                  </SelectItem>

                  <SelectItem value="2">
                    2nd Year
                  </SelectItem>

                  <SelectItem value="3">
                    3rd Year
                  </SelectItem>

                  <SelectItem value="4">
                    4th Year
                  </SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-4">

          <Button
            onClick={() => handleGenerate(false)}
            disabled={generateLoading}
          >
            {generateLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-1" />
                Generate Timetable
              </>
            )}
          </Button>

          {currentTT && (
            <>
              <Button
                variant="outline"
                onClick={() => handleGenerate(true)}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Regenerate
              </Button>

              <Button
                variant="outline"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-1" />
                Download PDF
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Timetable */}
      {currentTT && (

        <div
          className="card-elevated p-6 overflow-x-auto"
          ref={tableRef}
        >

          <div className="mb-4">

            <h3 className="font-bold text-lg">
              {selectedDept?.name} Timetable
            </h3>

            <p className="text-xs text-muted-foreground">
              Generated:
              {" "}
              {new Date(
                currentTT.generatedAt
              ).toLocaleString()}
            </p>

          </div>

          <table className="w-full border-collapse min-w-[900px]">

            <thead>

              <tr>

                <th className="timetable-header">
                  Day / Period
                </th>

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

                  <th
                    key={i}
                    className="timetable-header"
                  >
                    Period {i + 1}

                    <div className="text-xs text-white">
                      {time}
                    </div>
                  </th>

                ))}

              </tr>

            </thead>

            <tbody>

              {currentTT.rows.map((dayData) => (

                <tr key={dayData.day}>

                  <td className="timetable-day">
                    {dayData.day}
                  </td>

                  {dayData.periods.map((p, pi) => (

                    <td
                      key={pi}
                      className="timetable-cell"
                    >

                      {/* Subject */}
                      <div className="font-semibold text-xs">
                        {p.subject}
                      </div>

                      {/* Staff */}
                      <div className="text-xs text-muted-foreground mt-1">
                        {p.staff}
                      </div>

                      {/* Room */}
                      {p.room && (
                        <div className="text-[10px] text-blue-600 mt-1">
                          {p.room}
                        </div>
                      )}

                      {/* Staff Status */}
                      <div
                        className={`mt-2 inline-block px-2 py-1 rounded text-[10px] font-semibold
                        ${
                          p.staff_status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {p.staff_status}
                      </div>

                      {/* Substitute */}
                      {p.status === "substituted" && (
                        <div className="mt-2 text-[10px] text-orange-600 font-medium">
                          Substitute: {p.substitute}
                        </div>
                      )}

                      {/* Original Staff */}
                      {p.original_staff && (
                        <div className="text-[10px] text-gray-500 mt-1">
                          Original:
                          {" "}
                          {p.original_staff}
                        </div>
                      )}

                    </td>

                  ))}

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}