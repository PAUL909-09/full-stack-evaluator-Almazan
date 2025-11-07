// frontend/src/components/AssignEmployeeDropdown.jsx
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { getAllEmployees, getAssignedEmployees } from "@/services/projectService";
import { toast } from "@/components/ui/use-toast";

export default function AssignEmployeeDropdown({ projectId, value, onChange }) {
  const [employees, setEmployees] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [all, assignedIds] = await Promise.all([
          getAllEmployees(),
          getAssignedEmployees(projectId),
        ]);
        setEmployees(all);
        setAssigned(assignedIds);
      } catch (_) {
        toast({
          title: "Error",
          description: "Could not load employees.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId]);

  const toggle = (id) => {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading employees...
      </div>
    );
  }

  const available = employees.filter((e) => !assigned.includes(e.id));

  return (
    <div className="space-y-3">
      <Select onValueChange={toggle}>
        <SelectTrigger>
          <SelectValue placeholder="Choose employees..." />
        </SelectTrigger>
        <SelectContent>
          {available.map((emp) => (
            <SelectItem key={emp.id} value={emp.id}>
              {emp.name} ({emp.email})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((id) => {
            const emp = employees.find((e) => e.id === id);
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {emp?.name ?? "Unknown"}
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  className="ml-1 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
