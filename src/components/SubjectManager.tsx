import { useEffect, useState } from "react";
import { BookOpen, Trash2, Plus, Pencil } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

import {
  getSubjects,
  addSubjectApi,
  updateSubjectApi,
  deleteSubjectApi,
} from "@/api/subjectApi";

import { getDepartments } from "@/api/departmentApi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "./Reusable/DeletePopup";

const subjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  department: z.number(),
  hours_per_week: z.number().min(1, "Hours required"),
  semester: z.string().optional(),
  year: z.number().optional(),
  is_lab: z.boolean(),
});

export function SubjectManager() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("3");
  const [weeklyHours, setWeeklyHours] = useState("4");
  const [semester, setSemester] = useState("");
  const [year, setYear] = useState("");
  const [isLab, setIsLab] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const selectedDept = departments.find(
    (d) => String(d.id) === departmentId
  );

  const isSchoolClass = selectedDept?.type === 1;

  const fetchSubjects = async () => {
    const res = await getSubjects();
    setSubjects(res.data.data);
  };

  const fetchDepartments = async () => {
    const res = await getDepartments();
    setDepartments(res.data.data);
  };

  useEffect(() => {
    fetchSubjects();
    fetchDepartments();
  }, []);

  // RESET
  const resetForm = () => {
    setName("");
    setDepartmentId("3");
    setWeeklyHours("4");
    setSemester("");
    setYear("");
    setIsLab(false);
    setEditId(null);
    setErrors({});
  };

  // SUBMIT
  const handleSubmit = async () => {
    const payload = {
      name,
      department: Number(departmentId),
      hours_per_week: Number(weeklyHours),
      semester: isSchoolClass ? "" : semester,
      year: isSchoolClass ? 0 : Number(year),
      is_lab: isSchoolClass ? false : isLab,
    };
    
    let newErrors: any = {};

    if (!name) newErrors.name = "Subject name is required";

    if (!isSchoolClass) {
      if (!semester) newErrors.semester = "Semester required";
      if (!year) newErrors.year = "Year required";
    }

    const result = subjectSchema.safeParse(payload);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      setErrors({
        name: fieldErrors.name?.[0],
        hours_per_week: fieldErrors.hours_per_week?.[0],
      });

      toast.error("Please fill required fields ❌");
      return;
    }
    try {
      setLoading(true);

      if (editId) {
        await updateSubjectApi(editId, payload);
        toast.success("Subject Updated Successfully ✅");
      } else {
        await addSubjectApi(payload);
        toast.success("Subject Added Successfully ✅");
      }

      resetForm();
      fetchSubjects();
    } catch {
      toast.error("API Error ❌");
    } finally {
      setLoading(false);
    }
  };

  // EDIT
  const handleEdit = (s: any) => {
    setName(s.name);
    setDepartmentId(String(s.department));
    setWeeklyHours(String(s.hours_per_week));
    setSemester(s.semester);
    setYear(String(s.year));
    setIsLab(s.is_lab);
    setEditId(s.id);
  };

  // DELETE
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteSubjectApi(deleteId);
      toast.success("Subject Deleted Successfully 🗑️");

      setDeleteId(null);
      fetchSubjects();
    } catch {
      toast.error("Delete failed ❌");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Subject Management</h2>

      {/* FORM */}
      <div className="card-elevated p-6">
        <h3 className="font-semibold mb-4">
          {editId ? "Update Subject" : "Add Subject"}
        </h3>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* NAME */}
          <div>
            <Input
              placeholder="Subject name"
              value={name}
              onChange={(e) => {
                const value = e.target.value;
                setName(value);
                setErrors((p: any) => ({ ...p, name: undefined }));
                if (value.toLowerCase().startsWith("class")) {
                  setSemester("");
                  setYear("");
                  setIsLab(false);
                }
              }}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>

          {/* DEPARTMENT */}
          <Select
            value={departmentId}
            onValueChange={(v) => {
              setDepartmentId(v);
              setErrors((p: any) => ({ ...p, department: undefined }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((d) => (
                <SelectItem key={d.id} value={String(d.id)}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* HOURS */}
          <div>
            <Input
              type="number"
              placeholder="Hours per week"
              value={weeklyHours}
              onChange={(e) => {
                setWeeklyHours(e.target.value);
                setErrors((p: any) => ({
                  ...p,
                  hours_per_week: undefined,
                }));
              }}
            />
            {errors.hours_per_week && (
              <p className="text-red-500 text-sm">
                {errors.hours_per_week}
              </p>
            )}
          </div>

          {/* SEMESTER */}
          {!isSchoolClass && (
            <>
              <div>
                <Select
                  value={semester}
                  onValueChange={(v) => {
                    setSemester(v);
                    setErrors((p: any) => ({ ...p, semester: undefined }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ODD">Odd</SelectItem>
                    <SelectItem value="EVEN">Even</SelectItem>
                  </SelectContent>
                </Select>
                {errors.semester && (
                  <p className="text-red-500 text-sm">{errors.semester}</p>
                )}
              </div>

              {/* YEAR */}
              <div>
                <Input
                  type="number"
                  placeholder="Year"
                  value={year}
                  onChange={(e) => {
                    setYear(e.target.value);
                    setErrors((p: any) => ({ ...p, year: undefined }));
                  }}
                />
                {errors.year && (
                  <p className="text-red-500 text-sm">{errors.year}</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* LAB */}
        {!isSchoolClass && (
          <div className="flex items-center gap-2 mt-3">
            <Switch checked={isLab} onCheckedChange={setIsLab} />
            <Label>Lab subject</Label>
          </div>
        )}

        {/* BUTTONS */}
        <div className="flex gap-2 mt-4">
          <Button onClick={handleSubmit} disabled={loading}>
            <Plus className="w-4 h-4 mr-1" />
            {loading ? "Processing..." : editId ? "Update" : "Add"}
          </Button>

          {editId && (
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* LIST */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((s) => (
          <div key={s.id} className="card-hover p-4 flex justify-between">
            <div className="flex gap-3">
              <BookOpen />
              <div>
                <p>{s.name}</p>
                <span className="text-sm text-muted-foreground">
                  {s.department_name} • {s.hours_per_week}h • {s.semester} • Year {s.year}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="icon" variant="ghost" onClick={() => handleEdit(s)}>
                <Pencil className="w-4 h-4 text-blue-500" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => setDeleteId(s.id)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Are you sure you want to delete this subject?"
      />
    </div>
  );
}