import React, { useState, useEffect } from "react";
import UserProjects from "./UserProjects";
import { Button } from "@/components/ui/button";
import { getUserProjects } from "@/services/projectService";

export default function UserDetails({ user, onBack }) {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await getUserProjects(user.id);
      setProjects(data);
    };
    fetchProjects();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">
          {user.name} — {user.role}
        </h2>
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 space-y-2">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>

      <UserProjects userId={user.id} projects={projects} />
    </div>
  );
}
