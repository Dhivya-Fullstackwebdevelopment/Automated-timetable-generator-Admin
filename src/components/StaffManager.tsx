import { useState } from "react";
import { useAppState } from "@/context/AppContext";
import type { StaffStatus, ShiftAvailability } from "@/types/timetable";
import { User, Trash2, Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export function StaffManager() {
  const { staff, departments, addStaff, updateStaff, deleteStaff } = useAppState();
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [subjectsStr, setSubjectsStr] = useState("");
  const [shift, setShift] = useState<ShiftAvailability>("Both");
  const [editingStaff, setEditingStaff] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<StaffStatus>("Active");
  const [filterDept, setFilterDept] = useState<string>("all");

  const handleAdd = () => {
    if (!name.trim() || !departmentId || !subjectsStr.trim()) return;
    addStaff({
      name: name.trim(),
      departmentId,
      subjects: subjectsStr.split(",").map(s => s.trim()).filter(Boolean),
      status: "Active",
      availableShift: shift,
    });
    setName("");
    setSubjectsStr("");
  };

  const handleStatusChange = (staffId: string, status: StaffStatus) => {
    const s = staff.find(x => x.id === staffId);
    if (s) updateStaff({ ...s, status });
    setEditingStaff(null);
  };

  const statusClass = (status: StaffStatus) => {
    switch (status) {
      case "Active": return "status-active";
      case "Sick Leave":
      case "Emergency Leave": return "status-leave";
      case "Resigned": return "status-resigned";
    }
  };

  const filtered = filterDept === "all" ? staff : staff.filter(s => s.departmentId === filterDept);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display">Staff Management</h2>
        <p className="text-muted-foreground mt-1">Add staff, manage leave and resignations</p>
      </div>

      <div className="card-elevated p-6">
        <h3 className="font-semibold font-display mb-4">Add New Staff</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input placeholder="Staff name" value={name} onChange={e => setName(e.target.value)} />
          <Select value={departmentId} onValueChange={setDepartmentId}>
            <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              {departments.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Subjects (comma sep)" value={subjectsStr} onChange={e => setSubjectsStr(e.target.value)} />
          <Select value={shift} onValueChange={v => setShift(v as ShiftAvailability)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Odd">Odd Semester</SelectItem>
              <SelectItem value="Even">Even Semester</SelectItem>
              <SelectItem value="Both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleAdd} className="mt-3">
          <Plus className="w-4 h-4 mr-1" /> Add Staff
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
            <div key={s.id} className="card-hover p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold font-display">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{dept?.name}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => { setEditingStaff(s.id); setEditStatus(s.status); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Status - {s.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <Select value={editStatus} onValueChange={v => setEditStatus(v as StaffStatus)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                            <SelectItem value="Emergency Leave">Emergency Leave</SelectItem>
                            <SelectItem value="Resigned">Resigned</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button onClick={() => handleStatusChange(s.id, editStatus)} className="w-full">
                          Update Status
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="icon" onClick={() => deleteStaff(s.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {s.subjects.map(sub => (
                  <Badge key={sub} variant="secondary" className="text-xs">{sub}</Badge>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusClass(s.status)}`}>
                  {s.status}
                </span>
                <span className="text-xs text-muted-foreground">Shift: {s.availableShift}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
