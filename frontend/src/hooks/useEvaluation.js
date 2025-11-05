import { useState, useEffect, useCallback } from "react";
import EvaluationService from "../services/EvaluatorService";
import { toast } from "react-toastify";

export function useEvaluation(taskId) {
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchEvaluation = useCallback(async () => {
    setLoading(true);
    try {
      const data = await EvaluationService.getEvaluation(taskId);
      setEvaluation(data);
    } catch (error) {
      console.error("Failed to fetch evaluation:", error);
      toast.error("Unable to load evaluation.");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const saveEvaluation = useCallback(
    async (data) => {
      try {
        if (evaluation) {
          await EvaluationService.updateEvaluation(taskId, data);
          toast.success("Evaluation updated successfully!");
        } else {
          await EvaluationService.createEvaluation(taskId, data);
          toast.success("Evaluation created successfully!");
        }
        await fetchEvaluation();
      } catch (error) {
        console.error("Error saving evaluation:", error);
        toast.error("Failed to save evaluation.");
      }
    },
    [taskId, evaluation, fetchEvaluation]
  );

  const deleteEvaluation = useCallback(async () => {
    try {
      await EvaluationService.deleteEvaluation(taskId);
      toast.info("Evaluation deleted.");
      setEvaluation(null);
    } catch (error) {
      console.error("Error deleting evaluation:", error);
      toast.error("Failed to delete evaluation.");
    }
  }, [taskId]);

  useEffect(() => {
    fetchEvaluation();
  }, [fetchEvaluation]);

  return { evaluation, loading, saveEvaluation, deleteEvaluation };
}
