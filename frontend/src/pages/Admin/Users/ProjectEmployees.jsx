import React, { useState, useEffect } from "react";
import DataTable from "@/components/table/DataTable";
import { Button } from "@/components/ui/button";
import { getEmployeesByProject } from "@/services/projectService";

export default function ProjectEmployees({ project, onBack }) {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      const data = await getEmployeesByProject(project.id);
      setEmployees(data);
    };
    fetchEmployees();
  }, [project]);

  const columns = [
    { key: "name", label: "Employee Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          {project.name} — Employees
        </h2>
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
      </div>

      <DataTable columns={columns} data={employees} title="Team Members" />
    </div>
  );
}
