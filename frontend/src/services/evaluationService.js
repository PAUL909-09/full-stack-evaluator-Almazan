// frontend/src/services/evaluationService.js
import api from "@/api/axios";

class EvaluationService {
  async getEvaluation(taskId) {
    const response = await api.get(`/evaluations/${taskId}`);
    return response.data;
  }

  async createEvaluation(data) {  // taskId is in the body, so no need in URL
    const response = await api.post(`/evaluations`, data);
    return response.data;
  }

  async updateEvaluation(taskId, data) {
    const response = await api.put(`/evaluations/${taskId}`, data);
    return response.data;
  }

  async deleteEvaluation(taskId) {
    const response = await api.delete(`/evaluations/${taskId}`);
    return response.status === 200;  // Backend returns 200 OK
  }

  async getPendingTasks() {
    const response = await api.get(`/evaluations/pending`);
    return response.data;
  }
}

export default new EvaluationService();
