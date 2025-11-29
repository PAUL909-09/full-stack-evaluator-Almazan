// frontend/src/services/evaluationService.js
import api from "@/api/axios";

class EvaluationService {
  // Get existing evaluation for a specific task
  async getEvaluation(taskId) {
    const response = await api.get(`/evaluations/${taskId}`);
    return response.data;
  }

  // Create first evaluation for a submitted task
  async createEvaluation(data) {
    const response = await api.post(`/evaluations`, data);
    return response.data;
  }

  // Update evaluation (e.g., after employee revision)
  async updateEvaluation(taskId, data) {
    const response = await api.put(`/evaluations/${taskId}`, data);
    return response.data;
  }

  // Delete an evaluation (evaluator only)
  async deleteEvaluation(taskId) {
    const response = await api.delete(`/evaluations/${taskId}`);
    return response.status === 200;
  }

  // Get all tasks pending evaluation (for evaluator dashboard)
  async getPendingTasks() {
    const response = await api.get(`/evaluations/pending`);
    return response.data;
  }

  // Get history of all evaluations performed by the current evaluator
  async getMyEvaluationHistory() {
    const response = await api.get(`/evaluations/my-history`);
    return response.data;
  }
}

export default new EvaluationService();