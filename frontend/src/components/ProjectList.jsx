import React from "react";
import DataTable from "@/app/components/common/DataTable";

export default function ProjectList({ projects }) {
  const columns = [
    { key: "name", label: "Project Name" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
  ];

  return (
    <DataTable
      title="Assigned Projects"
      columns={columns}
      data={projects}
    />
  );
}
