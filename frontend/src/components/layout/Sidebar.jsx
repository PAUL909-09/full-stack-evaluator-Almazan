// // frontend/src/components/layout/Sidebar.jsx
// import { Link, useLocation } from "react-router-dom";
// import { Home, Users, FolderPlus, FilePlus, CheckSquare } from "lucide-react";

// const menuItems = {
//   Admin: [
//     { to: "/admin/dashboard", icon: Home, label: "Dashboard" },
//     { to: "/admin/verify-users", icon: Users, label: "Verify Users" },
//   ],
//   Evaluator: [
//     { to: "/evaluator/dashboard", icon: Home, label: "Dashboard" },
//     { to: "/projects/create", icon: FolderPlus, label: "New Project" },
//     { to: "/tasks/create", icon: FilePlus, label: "New Task" },
//   ],
//   Employee: [
//     { to: "/employee/dashboard", icon: Home, label: "My Tasks" },
//   ],
// };

// export default function Sidebar({ user, onLinkClick }) {
//   const location = useLocation();
//   const currentPath = location.pathname;
//   const items = menuItems[user.role] || [];

//   // SAFE: Extract name or fallback to email
//   const displayName = user.name || user.email?.split("@")[0] || "User";
//   const initial = displayName.charAt(0).toUpperCase();

//   return (
//     <div className="flex flex-col h-full bg-white dark:bg-gray-800 transition-colors">
//       {/* Logo & Title */}
//       <div className="flex items-center justify-center p-6 border-b border-gray-200 dark:border-gray-700">
//         <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
//           Task Evaluator
//         </h2>
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 p-4 space-y-1">
//         {items.map((item) => {
//           const isActive = currentPath === item.to;
//           return (
//             <Link
//               key={item.to}
//               to={item.to}
//               onClick={onLinkClick}
//               className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group ${
//                 isActive
//                   ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
//                   : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
//               }`}
//             >
//               <item.icon
//                 className={`h-5 w-5 transition-colors ${
//                   isActive ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
//                 }`}
//               />
//               <span>{item.label}</span>
//             </Link>
//           );
//         })}
//       </nav>

//       {/* User Info */}
//       <div className="p-4 border-t border-gray-200 dark:border-gray-700">
//         <div className="flex items-center space-x-3">
//           <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
//             {initial}
//           </div>
//           <div>
//             <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
//               {displayName}
//             </p>
//             <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
//               {user.role}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// frontend/src/components/layout/Sidebar.jsx



import { Link, useLocation } from "react-router-dom";
import { Home, Users, FolderPlus, FilePlus, CheckSquare, BarChart, FolderOpen } from "lucide-react";

const menuItems = {
  Admin: [
    { to: "/admin/dashboard", icon: Home, label: "Dashboard" },
    { to: "/admin/verify-users", icon: Users, label: "Verify Users" },
    // 🆕 New Admin menu links
    { to: "/admin/users/analytics", icon: BarChart, label: "User Analytics" },
    { to: "/admin/users/details", icon: CheckSquare, label: "User Details" },
    { to: "/admin/users/projects", icon: FolderPlus, label: "User Projects" },
  ],
  Evaluator: [
    { to: "/evaluator/dashboard", icon: Home, label: "Dashboard" },
    { to: "/projects/create", icon: FolderPlus, label: "New Project" },
    { to: "/tasks/create", icon: FilePlus, label: "New Task" },
    { to: "/evaluator/projects", icon: FolderOpen, label: "Project List" },
  ],
  Employee: [
    { to: "/employee/dashboard", icon: Home, label: "My Tasks" },
  ],
};

export default function Sidebar({ user, onLinkClick }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const items = menuItems[user.role] || [];

  // SAFE: Extract name or fallback to email
  const displayName = user.name || user.email?.split("@")[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 transition-colors">
      {/* Logo & Title */}
      <div className="flex items-center justify-center p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
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
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              <item.icon
                className={`h-5 w-5 transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
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
      </div>
    </div>
  );
}
