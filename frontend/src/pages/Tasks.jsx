import React, { useState, useEffect } from "react";
import axios from "axios";
import Loading from "../components/Loading";

const API_URL = 'http://localhost:5215/tasks'; 

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(API_URL);

        if (Array.isArray(response.data)) {
          setTasks(response.data);
        } else {
          throw new Error("Expected array of tasks");
        }
      } catch (err) {
        console.error("Fetch failed:", err);
        setError(err.response?.data || err.message);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) return <Loading text="Loading tasks..." />;

  if (error) {
    return (
      <div className="text-red-500 text-center mt-6">
        ❌ Error: {error}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        Tasks <span className="text-gray-500">({tasks.length})</span>
      </h2>

      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks yet.</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`p-4 border rounded-lg shadow-sm ${
                task.isDone
                  ? "bg-green-100 border-green-300"
                  : "bg-white border-gray-300"
              }`}
            >
              <strong className="block">{task.title}</strong>
              <small className="text-gray-600">
                Status:{" "}
                {task.isDone ? (
                  <span className="text-green-600 font-medium">✅ Done</span>
                ) : (
                  <span className="text-yellow-600 font-medium">⏳ Pending</span>
                )}{" "}
                | User ID: {task.userId}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Tasks;
