// frontend/src/pages/TaskDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";

export default function TaskDetails() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [score, setScore] = useState("");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = authService.getCurrentUser();
  const { toast } = useToast();

  // Fixed: Added 'toast' to dependency array
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await api.get(`/tasks/${id}`);
        setTask(res.data);
      } catch (err) {
        toast({
          title: "Failed to load task",
          description: err.message || "Please try again.",
          variant: "destructive"
        });
      }
    };

    fetchTask();
  }, [id, toast]); // ESLint satisfied

  const evaluate = async () => {
    if (!score || isNaN(score) || score < 0 || score > 10) {
      toast({ title: "Invalid score", description: "Score must be 0–10", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/tasks/${id}/evaluations`, {
        evaluatorId: user.id,
        score: Number(score),
        comments: comments.trim()
      });
      toast({ title: "Success!", description: "Evaluation submitted." });
      setScore("");
      setComments("");
      // Optionally refetch task to show evaluation
    } catch (err) {
      toast({
        title: "Evaluation failed",
        description: err.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!task) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading task details...</div>
      </div>
    );
  }

  const canEvaluate = user.role === "Evaluator" && !task.evaluation;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">{task.title}</h1>
        <p className="text-gray-600">{task.description || "No description"}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Task Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Task Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Project:</span>{" "}
              <span className="text-gray-600">{task.project?.name || "N/A"}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Assigned To:</span>{" "}
              <span className="text-gray-600">{task.assignedTo?.name || "Unassigned"}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Status:</span>{" "}
              <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full
                ${task.status === "Done" ? "bg-green-100 text-green-800" :
                  task.status === "InProgress" ? "bg-yellow-100 text-yellow-800" :
                  "bg-gray-100 text-gray-800"}`}>
                {task.status}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Created By:</span>{" "}
              <span className="text-gray-600">{task.createdBy?.name || "Unknown"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Evaluation Section */}
        {canEvaluate ? (
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-lg">Evaluate Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="score" className="text-sm font-medium">Score (0–10)</Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="e.g. 8.5"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="comments" className="text-sm font-medium">Comments</Label>
                <Input
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Great work! Keep it up."
                  className="mt-1"
                />
              </div>
              <Button
                onClick={evaluate}
                disabled={isSubmitting || !score}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Submitting..." : "Submit Evaluation"}
              </Button>
            </CardContent>
          </Card>
        ) : task.evaluation ? (
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="text-lg">Evaluation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600 mb-2">
                {task.evaluation.score}/10
              </p>
              <p className="text-gray-600 italic">"{task.evaluation.comments}"</p>
              <p className="text-sm text-gray-500 mt-3">
                — {task.evaluation.evaluator?.name}, {new Date(task.evaluation.evaluatedAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}