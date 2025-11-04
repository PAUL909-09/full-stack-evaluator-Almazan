import React, { useState, useEffect } from "react";
import DataTable from "@/components/table/DataTable";
import ProjectEmployees from "./ProjectEmployees";
import { Button } from "@/components/ui/button";
import { getUserProjects } from "@/services/projectService"; // Changed to named import for the specific function
import { useToast } from "@/hooks/use-toast"; 

export default function UserProjects({ userId }) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const { toast } = useToast(); // Added for error toasting

  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await getUserProjects(userId); // Updated function name to match the service
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        // Optional: Show a toast notification to the user
        toast({
          title: "Error",
          description: "Failed to load projects. Please try again.",
          variant: "destructive", // Uses the destructive variant for errors
        });
      }
    }
    if (userId) fetchProjects();
  }, [userId, toast]); // Added 'toast' to the dependency array

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
