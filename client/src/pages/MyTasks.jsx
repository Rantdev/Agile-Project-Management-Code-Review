import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Layout/Sidebar";
import api from "../services/api";
import toast from "react-hot-toast";
import { FiCalendar, FiUser, FiFolder, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
    overdue: 0
  });

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      console.log("Fetching my tasks...");
      const res = await api.get("/tasks/my-tasks");
      console.log("Tasks response:", res.data);
      setTasks(res.data.tasks || []);
      
      // Calculate stats
      const tasksList = res.data.tasks || [];
      const now = new Date();
      const stats = {
        total: tasksList.length,
        todo: tasksList.filter(t => t.status === "To Do").length,
        inProgress: tasksList.filter(t => t.status === "In Progress").length,
        done: tasksList.filter(t => t.status === "Done").length,
        overdue: tasksList.filter(t => {
          if (t.status === "Done") return false;
          if (!t.deadline) return false;
          return new Date(t.deadline) < now;
        }).length
      };
      setStats(stats);
    } catch (error) {
      console.error("Failed to load tasks:", error);
      toast.error("Failed to load your tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success("Task status updated");
      fetchMyTasks(); // Refresh the list
    } catch (error) {
      console.error("Failed to update task:", error);
      toast.error("Failed to update task status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Done": return "bg-green-100 text-green-800";
      case "In Progress": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Done": return <FiCheckCircle className="text-green-600" />;
      case "In Progress": return <FiClock className="text-yellow-600" />;
      default: return <FiAlertCircle className="text-gray-600" />;
    }
  };

  const isOverdue = (deadline, status) => {
    if (status === "Done") return false;
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
            <p className="text-gray-500 mt-1">Tasks assigned to you</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
              <p className="text-gray-500 text-sm">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-500">
              <p className="text-gray-500 text-sm">To Do</p>
              <p className="text-2xl font-bold text-gray-800">{stats.todo}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
              <p className="text-gray-500 text-sm">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
              <p className="text-gray-500 text-sm">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.done}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
              <p className="text-gray-500 text-sm">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            </div>
          </div>

          {/* Tasks List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No tasks assigned</h3>
              <p className="text-gray-500">You don't have any tasks yet. Tasks assigned to you will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(task.status)}
                        <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                        {isOverdue(task.deadline, task.status) && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            Overdue
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiFolder className="text-gray-400" />
                          <span>Project: {task.project_title || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiUser className="text-gray-400" />
                          <span>Story: {task.story_title || "N/A"}</span>
                        </div>
                        {task.deadline && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <FiCalendar className="text-gray-400" />
                            <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(task.status)}`}
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>
                  </div>
                  
                  {task.deadline && !isOverdue(task.deadline, task.status) && task.status !== "Done" && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FiClock className="text-gray-400" />
                        <span>Due in {Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24))} days</span>
                      </div>
                    </div>
                  )}
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