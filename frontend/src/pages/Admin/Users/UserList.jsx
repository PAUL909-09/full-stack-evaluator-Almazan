import React from "react";
import DataTable from "@/app/components/common/DataTable";
import { Button } from "@/components/ui/button";

export default function UserList({ users, onViewDetails }) {
  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
  ];

  return (
    <DataTable
      title="All Users"
      columns={columns}
      data={users}
      actions={(user) => (
        <Button size="sm" onClick={() => onViewDetails(user)}>
          View Details
        </Button>
      )}
    />
  );
}
