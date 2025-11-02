import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import api from "@/api/axios";

export default function EvaluatorDashboard() {
  const [evaluations, setEvaluations] = useState([]);

  useEffect(() => {
    api.get("/evaluations")
      .then(res => setEvaluations(res.data))
      .catch(console.error);
  }, []);

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4">Evaluator Dashboard</h1>
      <div className="grid gap-3">
        {evaluations.map(ev => (
          <div key={ev.id} className="p-4 bg-white rounded shadow">
            <div className="font-semibold">Task ID: {ev.taskId}</div>
            <div className="text-sm text-gray-600">Score: {ev.score}</div>
            <div className="text-sm text-gray-600">Comments: {ev.comments}</div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}
