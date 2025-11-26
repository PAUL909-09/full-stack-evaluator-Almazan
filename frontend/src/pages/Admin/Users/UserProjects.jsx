import React, { useState, useEffect } from "react";
import DataTable from "@/components/table/DataTable";
import ProjectEmployees from "./ProjectEmployees";
import { Button } from "@/components/ui/button";
import { getUserProjects } from "@/services/projectService"; // Changed to named import for the specific function
import { toast } from "react-toastify";

export default function UserProjects({ userId }) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await getUserProjects(userId); // Updated function name to match the service
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        // Optional: Show a toast notification to the user
        toast.error("Error: Failed to load projects. Please try again.");
      }
    }
    if (userId) fetchProjects();
  }, [userId]);

  const columns = [
    { key: "name", label: "Project Name" },
    { key: "status", label: "Status" },
    { key: "deadline", label: "Deadline" },
  ];

  return (
    <div className="space-y-6">
      {!selectedProject ? (
        <DataTable
          title="Assigned Projects"
          columns={columns}
          data={projects}
          actions={(proj) => (
            <Button size="sm" onClick={() => setSelectedProject(proj)}>
              View Employees
            </Button>
          )}
        />
      ) : (
        <ProjectEmployees project={selectedProject} onBack={() => setSelectedProject(null)} />
      )}
    </div>
  );
}
