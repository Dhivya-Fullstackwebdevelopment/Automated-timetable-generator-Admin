import { useEffect, useState } from "react";
import { User, Trash2, Plus, Edit } from "lucide-react";
import {
    getStaff,
    addStaffApi,
    updateStaffApi,
    deleteStaffApi,
} from "@/api/staffApi";
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
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/Reusable/DeletePopup";
import z from "zod";

type Dept = {
    id: number;
    name: string;
};

type Staff = {
    id: number;
    name: string;
    subjects: string;
    status: string;
    department: number;
    department_name: string;
};

const staffSchema = z.object({
    name: z.string().min(2, "Name is required"),
    department: z.number(),
    subjects: z.string().min(2, "Subjects is required"),
    status: z.enum(["ACTIVE", "SICK", "RESIGNED"]),
});

export function StaffManager() {
    const [departments, setDepartments] = useState<Dept[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [name, setName] = useState("");
    const [departmentId, setDepartmentId] = useState("");
    const [subjectsStr, setSubjectsStr] = useState("");
    const [status, setStatus] = useState("ACTIVE");
    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ name?: string }>({});

    const resetForm = () => {
        setName("");
        setDepartmentId("");
        setSubjectsStr("");
        setStatus("ACTIVE");
        setEditId(3);
        setErrors({});
    };

    const fetchDepartments = async () => {
        const res = await getDepartments();
        setDepartments(res.data.data);
    };

    const fetchStaff = async () => {
        const res = await getStaff();
        setStaff(res.data.data);
    };

    useEffect(() => {
        fetchDepartments();
        fetchStaff();
    }, []);

    const handleSubmit = async () => {
        const payload = {
            name,
            department: Number(departmentId),
            subjects: subjectsStr,
            status,
        };

        const result = staffSchema.safeParse(payload);

        if (!result.success) {
            const err = result.error.flatten().fieldErrors;
            setErrors({ name: err.name?.[0] });
            toast.error(err.name?.[0] || "Validation error ❌");
            return;
        }

        try {
            setLoading(true);

            if (editId) {
                await updateStaffApi(editId, payload);
                toast.success("Staff Updated Successfully ✅");
            } else {
                await addStaffApi(payload);
                toast.success("Staff Added Successfully ✅");
            }

            resetForm();
            fetchStaff();
        } catch {
            toast.error("API Error ❌");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (s: Staff) => {
        setName(s.name);
        setDepartmentId(String(s.department));
        setSubjectsStr(s.subjects);
        setStatus(s.status);
        setEditId(s.id);
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            setLoading(true);
            await deleteStaffApi(deleteId);
            toast.success("Staff Deleted Successfully 🗑️");

            setDeleteId(null);
            fetchStaff();
        } catch {
            toast.error("Delete failed ❌");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Staff Management</h2>

            {/* FORM */}
            <div className="card-elevated p-6">
                <h3 className="font-semibold mb-4">
                    {editId ? "Update Staff" : "Add Staff"}
                </h3>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <div>
                        <Input
                            placeholder="Staff name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm">{errors.name}</p>
                        )}
                    </div>

                    {/* DEPARTMENT */}
                    <Select value={departmentId} onValueChange={setDepartmentId}>
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

                    {/* SUBJECTS */}
                    <Input
                        placeholder="Subjects"
                        value={subjectsStr}
                        onChange={(e) => setSubjectsStr(e.target.value)}
                    />

                    {/* STATUS */}
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="SICK">Sick</SelectItem>
                            <SelectItem value="EMERGENCY">Emergency Leave</SelectItem>
                            <SelectItem value="RESIGNED">Resigned</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button onClick={handleSubmit} disabled={loading}>
                        <Plus className="w-4 h-4 mr-1" />
                        {loading
                            ? "Processing..."
                            : editId
                                ? "Update"
                                : "Add"}
                    </Button>
                    {editId && (
                        <Button
                            variant="outline"
                            onClick={resetForm}
                        >
                            Cancel
                        </Button>
                    )}
                </div>
            </div>

            {/* LIST */}
            {loading && <p className="text-sm">Loading...</p>}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {staff.map((s) => (
                    <div key={s.id} className="card-hover p-4">
                        <div className="flex justify-between">
                            <div className="flex gap-3">
                                <User />
                                <div>
                                    <p className="font-semibold">{s.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {s.department_name}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleEdit(s)}
                                >
                                    <Edit className="w-4 h-4 text-blue-500" />
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

                        <div className="mt-2 text-sm">
                            <strong>Subjects:</strong> {s.subjects}
                        </div>

                        <div className="mt-2">
                            <span className="text-xs px-2 py-1 rounded bg-secondary">
                                {s.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* DELETE POPUP */}
            <ConfirmDialog
                open={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Are you sure you want to delete?"
            />
        </div>
    );
}