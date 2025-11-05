import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/tasks`;

class EvaluationService {
  async getEvaluation(taskId) {
    const response = await axios.get(`${API_URL}/${taskId}/evaluations`);
    return response.data;
  }

  async createEvaluation(taskId, data) {
    const response = await axios.post(`${API_URL}/${taskId}/evaluations`, data);
    return response.data;
  }

  async updateEvaluation(taskId, data) {
    const response = await axios.put(`${API_URL}/${taskId}/evaluations`, data);
    return response.data;
  }

  async deleteEvaluation(taskId) {
    const response = await axios.delete(`${API_URL}/${taskId}/evaluations`);
    return response.status === 204;
  }
}

export default new EvaluationService();
