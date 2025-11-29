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

const Modal = ({
  open,
  title,
  description,
  children,
  onClose,
  onSave,
  saveLabel = "Save",
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#A0DCFC]/30 p-0">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-[#0A66B3] to-[#A0DCFC] px-6 py-4">
          <DialogHeader className="text-white">
            <DialogTitle className="text-xl font-semibold tracking-wide">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-white/90 text-sm mt-1">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        </div>

        {/* Modal Body */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="px-6 py-5"
        >
          {children}
        </motion.div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 bg-[#FCFDFD] border-t border-gray-100 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </Button>
          {onSave && (
            <Button
              onClick={onSave}
              className="bg-gradient-to-r from-[#0A66B3] to-[#3FA9F5] text-white font-medium shadow-md hover:opacity-90"
            >
              {saveLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
