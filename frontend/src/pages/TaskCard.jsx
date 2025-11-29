// src/components/TaskCard.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function TaskCard({ task, onUpdateStatus }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-bold">{task.title}</h3>
      <p>Status: {task.status}</p>
      <Link to={`/tasks/${task.id}`}><Button variant="outline">Details</Button></Link>
      {onUpdateStatus && (
        <Button onClick={() => onUpdateStatus(task.id, "Done")}>Mark Done</Button>
      )}
    </div>
  );
}