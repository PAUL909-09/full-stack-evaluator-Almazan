import { useEffect, useState } from "react";
import EvaluationService from "@/services/EvaluatorService";

export function usePendingCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function fetchCount() {
      try {
        const data = await EvaluationService.getPendingTasks();
        setCount(data.length);
      } catch {
        setCount(0);
      }
    }

    fetchCount();
    const interval = setInterval(fetchCount, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return count;
}
