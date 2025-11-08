import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProjectById } from "@/services/projectService";
import { getEmployees } from "@/services/userService";

import { getAssignmentsByProject, assignEmployees, removeAssignment } from "@/services/projectAssignmentService";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "react-toastify";

export default function ManageAssignments() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  useEffect(() => {
    loadAll();
  }, [projectId]);

  async function loadAll() {
    try {
      const [proj, allEmps, assigned] = await Promise.all([
        getProjectById(projectId),
        getEmployees(),
        getAssignmentsByProject(projectId),
      ]);
      setProject(proj);
      setEmployees(allEmps);
      setAssignments(assigned);
    } catch {
      toast.error("Failed to load data");
    }
  }

  async function handleAssign() {
    if (!selectedEmployee) return toast.warn("Select an employee first!");
    try {
      await assignEmployees(projectId, [selectedEmployee]);
      toast.success("Employee assigned!");
      setSelectedEmployee("");
      loadAll();
    } catch (err) {
      toast.error(err.response?.data || "Failed to assign");
    }
  }

  async function handleRemove(id) {
    if (!window.confirm("Remove this assignment?")) return;
    try {
      await removeAssignment(id);
      toast.info("Removed assignment");
      loadAll();
    } catch {
      toast.error("Failed to remove assignment");
    }
  }

  return (
    <div className="container max-w-5xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Assignments — {project?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* ADD EMPLOYEE */}
            <div>
              <label className="block text-sm font-semibold mb-2">Add Employee</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="border rounded-md p-2 w-full"
              >
                <option value="">Select an employee</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.email})
                  </option>
                ))}
              </select>
              <Button onClick={handleAssign} className="mt-3">
                Assign Employee
              </Button>
            </div>

            {/* LIST ASSIGNED EMPLOYEES */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Assigned Employees</h2>
              {assignments.length === 0 ? (
                <p>No one assigned yet.</p>
              ) : (
                <ul className="space-y-2">
                  {assignments.map((a) => (
                    <li
                      key={a.id}
                      className="flex justify-between items-center bg-gray-50 p-3 rounded"
                    >
                      <div>
                        <p className="font-medium">{a.name}</p>
                        <p className="text-sm text-gray-600">{a.email}</p>
                      </div>
                      <Button variant="destructive" onClick={() => handleRemove(a.id)}>
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
