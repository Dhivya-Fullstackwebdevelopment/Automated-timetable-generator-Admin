import { useEffect, useState } from "react";
import {
  Building2,
  Trash2,
  Plus,
  Pencil,
} from "lucide-react";
import { z } from "zod";
import {
  getDepartments,
  addDepartmentApi,
  updateDepartmentApi,
  deleteDepartmentApi,
} from "@/api/departmentApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/Reusable/DeletePopup";

type Dept = {
  id: number;
  name: string;
  type: number;
};

const departmentSchema = z.object({
  name: z.string().min(1, "Department is required"),
  type: z.string(),
});

export function DepartmentManager() {
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("2");
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});
  const isSchoolClass = name.toLowerCase().includes("class");
  const label = isSchoolClass ? "School Class" : "Department";   //list department
  const fetchDepartments = async () => {
    const res = await getDepartments();
    setDepartments(res.data.data);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Add / Update
  const handleSubmit = async () => {
    const result = departmentSchema.safeParse({ name, type });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      setErrors({
        name: fieldErrors.name?.[0],
      });

      return;
    }

    // clear errors if valid
    setErrors({});

    const payload = {
      name,
      type: Number(type),
    };

    try {
      setLoading(true);

      if (editId) {
        await updateDepartmentApi(editId, payload);
        toast.success(`${label} Updated successfully ✅`);
      } else {
        await addDepartmentApi(payload);
        toast.success(`${label} Added successfully ✅`);
      }

      setName("");
      setType("2");
      setEditId(null);
      fetchDepartments();
    } catch {
      toast.error("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };
  //Edit click
  const handleEdit = (dept: Dept) => {
    setName(dept.name);
    setType(String(dept.type));
    setEditId(dept.id);
  };

  // Delete confirm
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setLoading(true);
      await deleteDepartmentApi(deleteId);

      toast.success(`${label} Deleted successfully 🗑️`);

      setDeleteId(null);
      fetchDepartments();
    } finally {
      setLoading(false);
    }
  };

  {
    loading && (
      <p className="text-sm text-muted-foreground">Loading...</p>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{isSchoolClass ? "School Classes" : "Departments"}</h2>

      {/* ADD / EDIT */}
      <div className="card-elevated p-6">
        <h3 className="font-semibold font-display mb-4">
          {editId
            ? isSchoolClass
              ? "Edit School Class"
              : "Edit Department"
            : isSchoolClass
              ? "Add School Class"
              : "Add New Department"}
        </h3>
        <div className="flex flex-row gap-3">
          <div className="flex flex-col w-full">
            <Input
              placeholder="Enter class (Class 10, 11, 12) or department (BSc, MBA)"
              value={name}
              onChange={(e) => {
                const value = e.target.value;
                setName(value);
                setErrors({});
                if (value.toLowerCase().includes("class")) {
                  setType("1");
                }
              }}
            />

            {errors.name && (
              <span className="text-red-500 text-sm mt-1">
                {errors.name}
              </span>
            )}
          </div>

          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">School</SelectItem>
              <SelectItem value="2">College</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleSubmit} disabled={loading}>
            <Plus className="w-4 h-4 mr-1" />
            {loading ? "Processing..." : editId ? "Update" : "Add"}
          </Button>
          {editId && (
            <Button
              variant="outline"
              onClick={() => {
                setEditId(null);
                setName("");
                setType("2");
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* LIST */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => (
          <div key={dept.id} className="card-hover p-4 flex justify-between">
            <div className="flex gap-3">
              <Building2 />
              <div>
                <p>{dept.name}</p>
                <span>{dept.type === 1 ? "School" : "College"}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="icon" variant="ghost" onClick={() => handleEdit(dept)}>
                <Pencil className="w-4 h-4 text-blue-500" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => setDeleteId(dept.id)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* CONFIRM DELETE */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Are you sure you want to delete?"
      />
    </div >
  );
}