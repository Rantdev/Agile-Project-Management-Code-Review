import { useEffect, useState } from "react";
import Sidebar from "../components/Layout/Sidebar";
import api from "../services/api";
import toast from "react-hot-toast";
import { FiCheckCircle, FiClock, FiAlertCircle, FiCalendar, FiFolder } from "react-icons/fi";

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, done: 0 });

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks/my-tasks");
      const tasksList = res.data.tasks || [];
      setTasks(tasksList);
      setStats({
        total: tasksList.length,
        todo: tasksList.filter(t => t.status === "To Do").length,
        inProgress: tasksList.filter(t => t.status === "In Progress").length,
        done: tasksList.filter(t => t.status === "Done").length,
      });
    } catch (error) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const updateStatus = async (taskId, newStatus)=> {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success("Task updated");
      fetchTasks();
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Done": return "bg-green-100 text-green-800";
      case "In Progress": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64 flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Tasks</h1>
          <p className="text-gray-500 mb-8">Tasks assigned to you</p>

          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-4 text-center border-l-4 border-blue-500">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-gray-500 text-sm">Total</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 text-center border-l-4 border-gray-500">
              <p className="text-2xl font-bold">{stats.todo}</p>
              <p className="text-gray-500 text-sm">To Do</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 text-center border-l-4 border-yellow-500">
              <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
              <p className="text-gray-500 text-sm">In Progress</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 text-center border-l-4 border-green-500">
              <p className="text-2xl font-bold text-green-600">{stats.done}</p>
              <p className="text-gray-500 text-sm">Completed</p>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <FiCheckCircle className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No tasks assigned to you yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1"><FiFolder /> {task.project_title || "N/A"}</span>
                        {task.deadline && <span className="flex items-center gap-1"><FiCalendar /> {new Date(task.deadline).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <select
                      value={task.status}
                      onChange={(e) => updateStatus(task.id, e.target.value)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(task.status)}`}
                    >
                      <option>To Do</option>
                      <option>In Progress</option>
                      <option>Done</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTasks;