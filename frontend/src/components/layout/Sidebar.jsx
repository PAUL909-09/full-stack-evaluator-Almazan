import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  FolderPlus,
  FilePlus,
  CheckSquare,
  BarChart,
  FolderOpen,
  LogOut,
  ChevronUp,
  ChevronDown,
  User,
  ClipboardCheck
} from "lucide-react";
import { useState } from "react";
import { authService } from "@/api/authService";

const menuItems = {
  Admin: [
    { to: "/admin/dashboard", icon: Home, label: "Dashboard" },
    { to: "/admin/verify-users", icon: Users, label: "Verify Users" },
    { to: "/admin/users/analytics", icon: BarChart, label: "User Analytics" },
    { to: "/admin/users/details", icon: CheckSquare, label: "User Details" },
    { to: "/admin/users/projects", icon: FolderPlus, label: "User Projects" },
  ],
  Evaluator: [
    { to: "/evaluator/dashboard", icon: Home, label: "Dashboard" },
    { to: "/projects/create", icon: FolderPlus, label: "New Project" },
    { to: "/tasks/create", icon: FilePlus, label: "New Task" },
    { to: "/evaluator/projects", icon: FolderOpen, label: "Project List" },
    { to: "/evaluator/tasks", icon: CheckSquare, label: "Task List" },
    { to: "/evaluator/pending", icon: ClipboardCheck, label: "Pending Evaluations" },
  ],
  Employee: [{ to: "/employee/dashboard", icon: Home, label: "My Tasks" }],
};

export default function Sidebar({ user, onLinkClick }) {
  const location = useLocation();
  const [openProfile, setOpenProfile] = useState(false);
  const currentPath = location.pathname;
  const items = menuItems[user.role] || [];

  const displayName = user.name || user.email?.split("@")[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 transition-colors">
      {/* Logo */}
      <div className="flex items-center justify-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-[#0A66B3] to-[#A0DCFC]">
        <h2 className="text-2xl font-bold text-white drop-shadow-md">
          Task Evaluator
        </h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const isActive = currentPath === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onLinkClick}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-gradient-to-r from-[#0A66B3] to-[#4CB5F5] text-white shadow-lg shadow-[#0A66B3]/30"
                  : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-[#0A66B3]"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profile Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setOpenProfile(!openProfile)}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0A66B3] to-[#A0DCFC] rounded-full flex items-center justify-center text-white font-bold text-sm">
              {initial}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {displayName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user.role}
              </p>
            </div>
          </div>
          {openProfile ? (
            <ChevronUp className="text-gray-500 w-4 h-4" />
          ) : (
            <ChevronDown className="text-gray-500 w-4 h-4" />
          )}
        </div>

        {/* Dropdown */}
        {openProfile && (
          <div className="mt-3 ml-2 space-y-1 animate-fadeIn">
            <button
              onClick={() => alert('Profile feature coming soon!')}
              className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 hover:text-[#0A66B3]"
            >
              <User className="h-4 w-4" />
              <span>View Profile</span>
            </button>
            <button
              onClick={authService.logout}
              className="flex items-center space-x-2 text-sm text-red-600 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
