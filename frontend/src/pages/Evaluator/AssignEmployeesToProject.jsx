import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { getProjectById } from "@/services/projectService";
import { assignEmployees } from "@/services/projectAssignmentService";
import { getEmployees } from "@/services/userService";

export default function AssignEmployeesToProject() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate projectId
  useEffect(() => {
    if (!projectId) {
      toast.error("Project ID is missing in URL.");
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const [users, projectData] = await Promise.all([
          getEmployees(), // /api/users?role=Employee
          getProjectById(projectId),
        ]);

        if (!projectData) {
          toast.error("Project not found.");
          navigate("/evaluator/my-projects");
          return;
        }

        setEmployees(users ?? []);
        setProject(projectData);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load project or employee data.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [projectId, navigate]);

  // Toggle employee selection
  const toggleEmployee = (id) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  // Assign selected employees
  const handleAssign = async () => {
    if (!projectId) {
      toast.error("Invalid project ID.");
      return;
    }

    if (selectedEmployeeIds.length === 0) {
      toast.warn("Please select at least one employee.");
      return;
    }

    try {
      await assignEmployees(projectId, selectedEmployeeIds);
      toast.success("Employees assigned successfully!");
      navigate(`/evaluator/manage-assignments/${projectId}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to assign employees.");
    }
  };

  if (loading) {
    return (
      <p className="text-center text-gray-500 mt-10 animate-pulse">
        Loading...
      </p>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white shadow-md rounded-2xl p-6">
      <h2 className="text-2xl font-bold mb-4">Assign Employees to Project</h2>
      <p className="text-gray-600 mb-6">
        Project: <strong>{project?.name || "N/A"}</strong>
      </p>

      <div className="space-y-3 mb-6">
        {employees.length === 0 ? (
          <p>No employees available.</p>
        ) : (
          employees.map((emp) => (
            <label
              key={emp.id}
              className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedEmployeeIds.includes(emp.id)}
                onChange={() => toggleEmployee(emp.id)}
              />
              <span>
                {emp.name}{" "}
                <small className="text-gray-500">({emp.email})</small>
              </span>
            </label>
          ))
        )}
      </div>

      <button
        onClick={handleAssign}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
      >
        Assign Selected Employees
      </button>
    </div>
  );
}
