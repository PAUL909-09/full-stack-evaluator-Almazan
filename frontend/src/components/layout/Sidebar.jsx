// frontend/src/components/layout/Sidebar.jsx
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
  ClipboardCheck,
  UserPlus,
  List,
  FolderKanban
} from "lucide-react";
import { useState } from "react";
import { authService } from "@/services/authService"; // FIXED PATH
import { useNavigate } from "react-router-dom"; // ADD THIS

const baseMenu = {
  Admin: [
    { to: "/admin/dashboard", icon: Home, label: "Dashboard" },
    { to: "/admin/verify-users", icon: Users, label: "Verify Users" },
    { to: "/admin/users/analytics", icon: BarChart, label: "User Analytics" },
    { to: "/admin/projects/analytics", icon: FolderKanban, label: "Project Analytics" },
  ],
  Evaluator: [
    { to: "/evaluator/dashboard", icon: Home, label: "Dashboard" },
    { to: "/evaluator/tasks", icon: CheckSquare, label: "Manage Tasks" },
    { to: "/evaluator/projects", icon: FolderOpen, label: "Manage Projects" },
    {
      to: "/evaluator/pending",
      icon: ClipboardCheck,
      label: "Pending Evaluations",
    },
    {
      to: "/evaluator/evaluation-history",
      icon: BarChart,
      label: "My Evaluations",
    },
  ],
  Employee: [
    { to: "/employee/dashboard", icon: Home, label: "My Tasks" },
    { to: "/employee/tasks", icon: List, label: "My Tasks" },
  ],
};

export default function Sidebar({ user, onLinkClick }) {
  const location = useLocation();
  const navigate = useNavigate(); // ADD THIS
  const [openProfile, setOpenProfile] = useState(false);
  const currentPath = location.pathname;

  const items = baseMenu[user?.role] ?? [];

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

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
          const Icon = item.icon;

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
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profile Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div
          className="flex items-center justify-between cursor-pointer select-none"
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
                {user?.role || "Guest"}
              </p>
            </div>
          </div>
          {openProfile ? (
            <ChevronUp className="text-gray-500 w-4 h-4" />
          ) : (
            <ChevronDown className="text-gray-500 w-4 h-4" />
          )}
        </div>

        {openProfile && (
          <div className="mt-3 ml-2 space-y-2 animate-fadeIn">
            
            <button
              onClick={handleLogout} // FIXED: wrapped in function
              className="flex items-center space-x-2 text-sm text-red-600 hover:text-red-700 w-full text-left"
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
