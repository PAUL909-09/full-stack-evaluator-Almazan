import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function EvaluationModal({
  open,
  onClose,
  taskId,
  onSave,
  evaluation,
}) {
  const [status, setStatus] = useState(evaluation?.status || "Approved");
  const [comments, setComments] = useState(evaluation?.comments || "");

  useEffect(() => {
    if (evaluation) {
      setStatus(evaluation.status);
      setComments(evaluation.comments);
    }
  }, [evaluation]);

  //   const handleSubmit = (e) => {
  //     e.preventDefault();
  //     onSave({ status, comments });
  //   };
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(taskId, { status, comments });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Evaluate Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="Approved">Approved</option>
              <option value="NeedsRevision">Needs Revision</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Comments</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Add evaluator comments..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
