// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { authService } from "@/api/authService";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import { Menu, LogOut, Moon, Sun } from "lucide-react";
import { useDarkMode } from "@/hooks/useDarkMode";

const iconVariants = {
  open: { rotate: 90 },
  closed: { rotate: 0 },
};

export default function Topbar({ onToggleSidebar, sidebarOpen }) {
  const { isDark, toggle } = useDarkMode();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b px-6 py-4 flex justify-between items-center transition-colors">
      <div className="flex items-center space-x-4">
        {/* Hamburger */}
        <button
          onClick={onToggleSidebar}
          className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
          aria-label="Toggle menu"
        >
          <motion.div
            variants={iconVariants}
            animate={sidebarOpen ? "open" : "closed"}
            transition={{ duration: 0.3 }}
          >
            <Menu className="h-6 w-6" />
          </motion.div>
        </button>

        <Link to="/" className="flex items-center space-x-3">
          <img src={logo} alt="Logo" className="h-9" />
          <span className="text-xl font-bold text-gray-800 dark:text-white hidden md:block">
            Task Evaluator
          </span>
        </Link>
      </div>

      <div className="flex items-center space-x-3">
        {/* Dark Mode Toggle */}
        <Button
          onClick={toggle}
          variant="ghost"
          size="sm"
          className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Logout */}
        <Button
          onClick={authService.logout}
          variant="ghost"
          size="sm"
          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}
