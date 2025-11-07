// src/pages/Evaluator/AssignEmployeesToProject.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authService } from "@/api/authService";
import { tasksService } from "@/services/tasksService"; // Fixed path
import { getEvaluatorProjects, getAllEmployees } from "@/services/projectService";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox"; // Fixed .jsx
import Badge from "@/components/ui/badge"; // Add badge
import { useToast } from "@/hooks/use-toast";

export default function AssignEmployeesToProject() {
  const { projectId: urlProjectId } = useParams(); // Optional: pre-select from URL
  const [selectedProjectId, setSelectedProjectId] = useState(urlProjectId || "");
  const [projects, setProjects] = useState([]);
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  // Load evaluator projects
  useEffect(() => {
    (async () => {
      try {
        const data = await getEvaluatorProjects();
        setProjects(data);
        // Auto-select if projectId in URL
        if (urlProjectId && data.some(p => p.id === urlProjectId)) {
          setSelectedProjectId(urlProjectId);
        }
      } catch {
        toast({ title: "Error", description: "Failed to load projects", variant: "destructive" });
      }
    })();
  }, [toast, urlProjectId]);

  // Load all employees
  useEffect(() => {
    (async () => {
      try {
        const data = await getAllEmployees();
        setAllEmployees(data);
      } catch {
        toast({ title: "Error", description: "Failed to load employees", variant: "destructive" });
      }
    })();
  }, [toast]);

  // Load already-assigned employees when project changes
  useEffect(() => {
    if (!selectedProjectId) {
      setAssignedEmployees([]);
      return;
    }
    (async () => {
      try {
        const data = await tasksService.getEmployeesByProject(selectedProjectId);
        setAssignedEmployees(data);
      } catch {
        toast({ title: "Error", description: "Failed to load assigned employees", variant: "destructive" });
        setAssignedEmployees([]);
      }
    })();
  }, [selectedProjectId, toast]);

  // Toggle employee selection
  const toggleEmployee = (empId, checked) => {
    setSelectedEmployeeIds((prev) =>
      checked ? [...prev, empId] : prev.filter((id) => id !== empId)
    );
  };

  // Bulk assign
  const handleAssign = async () => {
    if (!selectedProjectId || selectedEmployeeIds.length === 0) {
      toast({ title: "Select", description: "Pick a project and at least one employee.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const promises = selectedEmployeeIds.map((empId) =>
        tasksService.createTask({
          title: `Task for ${allEmployees.find((e) => e.id === empId)?.name || "Employee"}`,
          description: "Assigned via bulk assignment.",
          projectId: selectedProjectId,
          createdById: user.id,
          assignedToId: empId,
        })
      );

      await Promise.all(promises);

      toast({ title: "Success", description: `${selectedEmployeeIds.length} employee(s) assigned.` });

      // Refresh assigned list
      const fresh = await tasksService.getEmployeesByProject(selectedProjectId);
      setAssignedEmployees(fresh);
      setSelectedEmployeeIds([]);
      navigate("/evaluator/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Assignment failed";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Employees not yet assigned
  const availableEmployees = allEmployees.filter(
    (e) => !assignedEmployees.some((a) => a.id === e.id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Assign Employees to Project
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Project selector */}
            <div>
              <Label htmlFor="project">Select Project</Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger id="project" className="mt-1">
                  <SelectValue placeholder="Choose a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.length === 0 ? (
                    <SelectItem value="none" disabled>No projects</SelectItem>
                  ) : (
                    projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Currently assigned */}
            {selectedProjectId && (
              <div>
                <Label>Currently Assigned</Label>
                <div className="mt-2 space-y-2">
                  {assignedEmployees.length === 0 ? (
                    <p className="text-gray-500">No one yet.</p>
                  ) : (
                    assignedEmployees.map((emp) => {
                      const taskCount = emp.taskCount || 0;
                      return (
                        <div
                          key={emp.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <span>
                            {emp.name} ({emp.email})
                          </span>
                          <Badge variant="secondary">
                            {taskCount} task{taskCount !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Employee picker */}
            {selectedProjectId && (
              <div>
                <Label>Select Employees to Assign</Label>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {availableEmployees.length === 0 ? (
                    <p className="text-gray-500">All employees already assigned.</p>
                  ) : (
                    availableEmployees.map((emp) => (
                      <div key={emp.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`emp-${emp.id}`}
                          checked={selectedEmployeeIds.includes(emp.id)}
                          onCheckedChange={(c) => toggleEmployee(emp.id, c)}
                        />
                        <Label htmlFor={`emp-${emp.id}`} className="text-sm cursor-pointer">
                          {emp.name} ({emp.email})
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Submit */}
            <Button
              onClick={handleAssign}
              disabled={!selectedProjectId || selectedEmployeeIds.length === 0 || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5"
            >
              {loading
                ? "Assigning..."
                : `Assign ${selectedEmployeeIds.length} Employee(s)`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}