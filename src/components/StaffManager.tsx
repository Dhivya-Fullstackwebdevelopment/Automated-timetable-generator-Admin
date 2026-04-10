import { useEffect, useRef, useState } from "react";
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
import axios from "axios";
import { BASE_URL } from "@/api/apiurl";

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
    const [departmentId, setDepartmentId] = useState("3");
    const [subjectsStr, setSubjectsStr] = useState("");
    const [status, setStatus] = useState("ACTIVE");
    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; subjects?: string }>({});
    const [filters, setFilters] = useState({
        name: "",
        department: "",
        status: "",
        subjects: [] as string[],

    });
    const formRef = useRef<HTMLDivElement | null>(null);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

    const filteredStaff = staff.filter((s) => {
        return (
            (!filters.name ||
                s.name.toLowerCase().includes(filters.name.toLowerCase())) &&

            (!filters.department ||
                String(s.department) === filters.department) &&

            (!filters.status || s.status === filters.status) &&

            (
                filters.subjects.length === 0 ||
                filters.subjects.some((sub) =>
                    s.subjects.toLowerCase().includes(sub.toLowerCase())
                )
            )
        );
    });

    const resetForm = () => {
        setName("");
        setSubjectsStr("");
        setStatus("ACTIVE");
        setEditId(null);
        setDepartmentId("3");
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

    const fetchSubjects = async () => {
        try {
            const res = await axios.get(
                `${BASE_URL}/api/subject/list/`
            );

            setSubjects(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch subjects ❌");
        }
    };

    useEffect(() => {
        fetchDepartments();
        fetchStaff();
        fetchSubjects()
    }, []);

    const handleSubmit = async () => {
        const payload = {
            name,
            department: Number(departmentId),
            subjects: selectedSubjects.join(", "),
            status,
        };

        const result = staffSchema.safeParse(payload);

        if (!result.success) {
            const err = result.error.flatten().fieldErrors;
            setErrors({
                name: err.name?.[0],
                subjects: err.subjects?.[0],
            });
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
        setSelectedSubjects(s.subjects.split(",").map((x) => x.trim()));
        setStatus(s.status);
        setEditId(s.id);
        setTimeout(() => {
            formRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }, 100);
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
            <div ref={formRef} className="card-elevated p-6">
                <h3 className="font-semibold mb-4">
                    {editId ? "Update Staff" : "Add Staff"}
                </h3>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                    <div>
                        <Input
                            placeholder="Staff name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setErrors((prev) => ({ ...prev, name: undefined }));
                            }} />
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
                    <div>
                        <Select
                            onValueChange={(value) => {
                                if (!selectedSubjects.includes(value)) {
                                    setSelectedSubjects([...selectedSubjects, value]);
                                }
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Subjects" />
                            </SelectTrigger>

                            <SelectContent>
                                {subjects.map((sub) => (
                                    <SelectItem key={sub.id} value={sub.name}>
                                        {sub.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Selected Subjects */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {selectedSubjects.map((sub, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-1 text-xs bg-blue-100 rounded cursor-pointer"
                                    onClick={() =>
                                        setSelectedSubjects(selectedSubjects.filter((s) => s !== sub))
                                    }
                                >
                                    {sub} ❌
                                </span>
                            ))}
                        </div>
                    </div>

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
            <div className="card-elevated p-4">
                <h3 className="font-semibold mb-3">Filter Staff</h3>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                    {/* Name */}
                    <Input
                        placeholder="Search name"
                        value={filters.name}
                        onChange={(e) =>
                            setFilters({ ...filters, name: e.target.value })
                        }
                    />

                    {/* Department */}
                    <Select
                        value={filters.department}
                        onValueChange={(v) =>
                            setFilters({ ...filters, department: v })
                        }
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

                    {/* Status */}
                    <Select
                        value={filters.status}
                        onValueChange={(v) =>
                            setFilters({ ...filters, status: v })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="SICK">Sick</SelectItem>
                            <SelectItem value="EMERGENCY">Emergency</SelectItem>
                            <SelectItem value="RESIGNED">Resigned</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Subjects */}
                    <div>
                        <Select
                            onValueChange={(value) => {
                                if (!filters.subjects.includes(value)) {
                                    setFilters({
                                        ...filters,
                                        subjects: [...filters.subjects, value],
                                    });
                                }
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Filter Subjects" />
                            </SelectTrigger>

                            <SelectContent>
                                {subjects.map((sub) => (
                                    <SelectItem key={sub.id} value={sub.name}>
                                        {sub.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Selected filter chips */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {filters.subjects.map((sub, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-1 text-xs bg-green-100 rounded cursor-pointer"
                                    onClick={() =>
                                        setFilters({
                                            ...filters,
                                            subjects: filters.subjects.filter((s) => s !== sub),
                                        })
                                    }
                                >
                                    {sub} ❌
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Clear */}
                <Button
                    variant="outline"
                    className="mt-3"
                    onClick={() =>
                        setFilters({
                            name: "",
                            department: "",
                            status: "",
                            subjects: [],
                        })
                    }
                >
                    Clear Filters
                </Button>
            </div>

            {/* LIST */}
            {loading && <p className="text-sm">Loading...</p>}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredStaff.map((s) => (
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