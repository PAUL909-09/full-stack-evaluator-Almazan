// frontend/src/pages/Evaluator/EvaluationHistory.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import evaluationService from "@/services/evaluationService";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { toast } from "react-toastify";

const statusColors = {
  Approved: "bg-emerald-600",
  NeedsRevision: "bg-orange-500",
  Rejected: "bg-red-600",
  Pending: "bg-blue-600",
};

export default function EvaluationHistory() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "Evaluator")) {
      toast.error("Access denied. Evaluators only.");
      navigate("/");
      return;
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (authLoading || !user) return;

    const loadHistory = async () => {
      try {
        console.log("Fetching history for user:", user); // DEBUG
        const data = await evaluationService.getMyEvaluationHistory();
        console.log("Raw API response:", data); // SEE WHAT'S COMING BACK

        setEvaluations(data || []);
        
        if (!data || data.length === 0) {
          toast.info("No evaluations yet. Try evaluating a submitted task!");
        }
      } catch (error) {
        console.error("Failed to load history:", error);
        toast.error("Failed to load evaluation history: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [authLoading, user]);

  if (authLoading || loading) {
    return <div className="p-8 text-lg">Loading your evaluation history…</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Evaluation History</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, <strong>{user?.name || "Evaluator"}</strong>! Here are all tasks you've evaluated.
          </p>
        </div>
        <Button onClick={() => navigate(-1)} variant="outline">
          ← Back
        </Button>
      </div>

      {evaluations.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-xl text-gray-500">
            No evaluations found.
          </p>
          <p className="text-sm text-gray-400 mt-4">
            Tip: Go to "Pending Tasks" and evaluate a submitted task first!
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {evaluations.map((evaluation) => (
            <Card key={eval.evaluationId || evaluation.taskId} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold">
                    {evaluation.taskTitle}
                  </CardTitle>
                  <Badge className={`${statusColors[evaluation.status] || "bg-gray-500"} text-white`}>
                    {evaluation.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {evaluation.taskDescription}
                </p>

                {evaluation.comments && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-medium">Your Comments:</p>
                    <p className="text-sm italic">"{evaluation.comments}"</p>
                  </div>
                )}

                <div className="text-xs text-gray-500 space-y-1 pt-3 border-t">
                  <p>Task ID: {evaluation.taskId}</p>
                  <p>Evaluated: {new Date(evaluation.evaluatedAt).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}