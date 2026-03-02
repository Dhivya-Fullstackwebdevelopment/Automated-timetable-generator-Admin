import { useState } from "react";
import { useAppState } from "@/context/AppContext";
import type { InstitutionType } from "@/types/timetable";
import { Building2, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function DepartmentManager() {
  const { departments, addDepartment, deleteDepartment } = useAppState();
  const [name, setName] = useState("");
  const [type, setType] = useState<InstitutionType>("College");

  const handleAdd = () => {
    if (!name.trim()) return;
    addDepartment({ name: name.trim(), type });
    setName("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display">Departments</h2>
        <p className="text-muted-foreground mt-1">Manage school and college departments</p>
      </div>

      <div className="card-elevated p-6">
        <h3 className="font-semibold font-display mb-4">Add New Department</h3>
        <div className="flex gap-3 flex-wrap">
          <Input
            placeholder="Department name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="max-w-xs"
            onKeyDown={e => e.key === "Enter" && handleAdd()}
          />
          <Select value={type} onValueChange={v => setType(v as InstitutionType)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="School">School</SelectItem>
              <SelectItem value="College">College</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map(dept => (
          <div key={dept.id} className="card-hover p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold font-display">{dept.name}</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  {dept.type}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => deleteDepartment(dept.id)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
