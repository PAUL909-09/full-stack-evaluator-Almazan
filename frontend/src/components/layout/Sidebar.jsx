// src/components/layout/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { authService } from "@/api/authService";

export default function Sidebar() {
  const user = authService.getCurrentUser();
  const location = useLocation();

  if (!user) return null;

  const menu = {
    Admin: [
      { to: "/dashboard", label: "All Tasks", icon: "Tasks" },
      { to: "/admin/tasks/create", label: "Create Task", icon: "Plus" },
    ],
    Evaluator: [
      { to: "/evaluations", label: "My Evaluations", icon: "Star" },
    ],
    Employee: [
      { to: "/dashboard", label: "My Tasks", icon: "Check" },
    ],
  }[user.role] || [];

  return (
    <aside className="w-64 bg-white border-r border-gray-200">
      <div className="p-5 border-b">
        <h1 className="text-xl font-bold">Task Evaluator</h1>
      </div>
      <nav className="p-4 space-y-1">
        {menu.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              location.pathname === item.to
                ? "bg-blue-50 text-blue-700 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}