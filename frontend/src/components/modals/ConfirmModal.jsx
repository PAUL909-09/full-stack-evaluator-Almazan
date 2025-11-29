import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

/**
 * A reusable confirmation modal with animation and dynamic design.
 * Props:
 * - open: boolean → whether modal is visible
 * - title: string → modal title
 * - message: string → message to display
 * - type: "warning" | "success" | "error" (optional) → changes icon & color
 * - onConfirm: () => void → confirm action
 * - onCancel: () => void → cancel/close action
 */
const ConfirmModal = ({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  type = "warning",
  onConfirm,
  onCancel,
}) => {
  const colors = {
    warning: {
      gradient: "from-yellow-500 to-amber-400",
      icon: <AlertTriangle className="w-10 h-10 text-yellow-300" />,
    },
    success: {
      gradient: "from-green-600 to-emerald-400",
      icon: <CheckCircle2 className="w-10 h-10 text-green-200" />,
    },
    error: {
      gradient: "from-red-600 to-pink-500",
      icon: <XCircle className="w-10 h-10 text-red-200" />,
    },
  };

  const { gradient, icon } = colors[type] || colors.warning;

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-sm text-center bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden p-0">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`bg-gradient-to-r ${gradient} py-5`}
        >
          <DialogHeader className="flex flex-col items-center space-y-2 text-white">
            {icon}
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          </DialogHeader>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="px-6 py-5"
        >
          <DialogDescription className="text-gray-700 dark:text-gray-300 text-base">
            {message}
          </DialogDescription>
        </motion.div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex justify-center space-x-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-gray-300 text-gray-600 hover:bg-gray-100 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className={`bg-gradient-to-r ${gradient} text-white font-medium shadow-md hover:opacity-90 transition-all`}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmModal;
