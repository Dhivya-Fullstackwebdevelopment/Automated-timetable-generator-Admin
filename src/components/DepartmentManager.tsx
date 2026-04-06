import { useEffect, useState } from "react";
import {
  Building2,
  Trash2,
  Plus,
  Pencil,
} from "lucide-react";

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

import { toast } from "@/components/ui/use-toast";
import { ConfirmDialog } from "@/components/Reusable/DeletePopup";

type Dept = {
  id: number;
  name: string;
  type: number;
};

export function DepartmentManager() {
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("2");
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  //list department
  const fetchDepartments = async () => {
    const res = await getDepartments();
    setDepartments(res.data.data);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Add / Update
  const handleSubmit = async () => {
    if (!name.trim()) return;

    const payload = {
      name,
      type: Number(type),
    };

    try {
      if (editId) {
        await updateDepartmentApi(editId, payload);
        toast({ title: "Department Updated successfully ✅" });
      } else {
        await addDepartmentApi(payload);
        toast({ title: "Department Added successfully ✅" });
      }

      setName("");
      setType("2");
      setEditId(null);
      fetchDepartments();
    } catch {
      toast({ title: "Something went wrong ❌" });
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

    await deleteDepartmentApi(deleteId);
    toast({ title: "Department Deleted successfully 🗑️" });

    setDeleteId(null);
    fetchDepartments();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Departments</h2>

      {/* ADD / EDIT */}
      <div className="card-elevated p-6">
        <div className="flex gap-3 flex-wrap">
          <Input
            placeholder="Department name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">School</SelectItem>
              <SelectItem value="2">College</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleSubmit}>
            <Plus className="w-4 h-4 mr-1" />
            {editId ? "Update" : "Add"}
          </Button>
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
    </div>
  );
}