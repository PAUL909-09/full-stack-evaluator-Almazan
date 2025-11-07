// frontend/src/pages/Evaluator/AssignEmployeesToProject.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { authService } from "@/api/authService";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";  // Assuming you have a Checkbox component; if not, use a library like shadcn/ui
import { useToast } from "@/hooks/use-toast";
import { getEvaluatorProjects, getEmployeesByProject, getAllEmployees } from "@/services/projectService";

export default function AssignEmployeesToProject() {
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projects, setProjects] = useState([]);
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  // Fetch evaluator's projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projData = await getEvaluatorProjects();
        setProjects(projData);
      } catch (err) {
        toast({
          title: "Failed to load projects",
          description: err.message || "Please refresh the page.",
          variant: "destructive"
        });
      }
    };
    fetchProjects();
  }, [toast]);

  // Fetch all employees on mount
  useEffect(() => {
    const fetchAllEmployees = async () => {
      try {
        const empData = await getAllEmployees();
        setAllEmployees(empData);
      } catch (err) {
        toast({
          title: "Failed to load employees",
          description: err.message || "Please refresh the page.",
          variant: "destructive"
        });
      }
    };
    fetchAllEmployees();
  }, [toast]);

  // Fetch assigned employees when project changes
  useEffect(() => {
    if (!selectedProjectId) {
      setAssignedEmployees([]);
      return;
    }
    const fetchAssigned = async () => {
      try {
        const assigned = await getEmployeesByProject(selectedProjectId);
        setAssignedEmployees(assigned);
      } catch (err) {
        toast({
          title: "Failed to load assigned employees",
          description: err.message || "Please select a different project.",
          variant: "destructive"
        });
        setAssignedEmployees([]);
      }
    };
    fetchAssigned();
  }, [selectedProjectId, toast]);

  // Handle employee selection (checkboxes)
  const handleEmployeeSelect = (employeeId, checked) => {
    setSelectedEmployeeIds(prev =>
      checked
        ? [...prev, employeeId]
        : prev.filter(id => id !== employeeId)
    );
  };

  // Assign selected employees (create tasks)
  const handleAssign = async () => {
    if (!selectedProjectId || selectedEmployeeIds.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select a project and at least one employee.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Create a task for each selected employee
      const taskPromises = selectedEmployeeIds.map(employeeId =>
        api.post("/tasks", {
          title: `Task for ${allEmployees.find(e => e.id === employeeId)?.name || 'Employee'}`,  // Default title
          description: "Assigned via bulk assignment.",  // Default description
          projectId: selectedProjectId,
          createdById: user.id,
          assignedToId: employeeId,
        })
      );

      await Promise.all(taskPromises);

      toast({
        title: "Assignment Successful!",
        description: `${selectedEmployeeIds.length} employee(s) assigned to the project.`,
      });

      // Refresh assigned employees and reset selections
      const updatedAssigned = await getEmployeesByProject(selectedProjectId);
      setAssignedEmployees(updatedAssigned);
      setSelectedEmployeeIds([]);
      navigate("/evaluator/dashboard");  // Optional: Redirect after success
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Failed to assign employees";
      setError(message);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Filter out already assigned employees from the selection list
  const availableEmployees = allEmployees.filter(
    emp => !assignedEmployees.some(assigned => assigned.id === emp.id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-800">Assign Employees to Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Project Selection */}
            <div>
              <Label htmlFor="project" className="text-sm font-medium">Select Project</Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger id="project" className="mt-1">
                  <SelectValue placeholder="Choose a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.length === 0 ? (
                    <SelectItem value="none" disabled>No projects available</SelectItem>
                  ) : (
                    projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Currently Assigned Employees */}
            {selectedProjectId && (
              <div>
                <Label className="text-sm font-medium">Currently Assigned Employees</Label>
                <div className="mt-2 space-y-2">
                  {assignedEmployees.length === 0 ? (
                    <p className="text-gray-500">No employees assigned yet.</p>
                  ) : (
                    assignedEmployees.map(emp => (
                      <div key={emp.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <span>{emp.name} ({emp.email}) - {emp.taskTitle} ({emp.status})</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Select Employees to Assign */}
            {selectedProjectId && (
              <div>
                <Label className="text-sm font-medium">Select Employees to Assign</Label>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {availableEmployees.length === 0 ? (
                    <p className="text-gray-500">All employees are already assigned.</p>
                  ) : (
                    availableEmployees.map(emp => (
                      <div key={emp.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`emp-${emp.id}`}
                          checked={selectedEmployeeIds.includes(emp.id)}
                          onCheckedChange={(checked) => handleEmployeeSelect(emp.id, checked)}
                        />
                        <Label htmlFor={`emp-${emp.id}`} className="text-sm">
                          {emp.name} ({emp.email})
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <Button
              onClick={handleAssign}
              disabled={!selectedProjectId || selectedEmployeeIds.length === 0 || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5"
            >
              {loading ? "Assigning..." : `Assign ${selectedEmployeeIds.length} Employee(s)`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}