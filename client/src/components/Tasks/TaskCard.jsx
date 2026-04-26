import { FiTrash2, FiCalendar, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../services/api";

const statusColors = {
  "To Do": "bg-gray-100 text-gray-800",
  "In Progress": "bg-yellow-100 text-yellow-800",
  Done: "bg-green-100 text-green-800",
};

const TaskCard = ({ task, onUpdate, canEdit = false, isOwner = false }) => {
  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/tasks/${task.id}`, { status: newStatus });
      toast.success("Task status updated");
      onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!isOwner) {
      toast.error("Only the Product Owner can delete tasks");
      return;
    }
    if (window.confirm("Delete this task?")) {
      try {
        await api.delete(`/tasks/${task.id}`);
        toast.success("Task deleted");
        onUpdate();
      } catch (error) {
        toast.error("Failed to delete task");
      }
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-800">{task.title}</h4>
        {isOwner && (
          <button onClick={handleDelete} className="text-red-400 hover:text-red-600">
            <FiTrash2 size={16} />
          </button>
        )}
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <FiUser className="text-gray-400" size={14} />
          <span>{task.assignee}</span>
        </div>
        {task.deadline && (
          <div className="flex items-center gap-2 text-gray-600">
            <FiCalendar className="text-gray-400" size={14} />
            <span>{new Date(task.deadline).toLocaleDateString()}</span>
          </div>
        )}
      </div>
      <div className="mt-3 flex justify-between items-center">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
          {task.status}
        </span>
        {canEdit && (
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>To Do</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>
        )}
      </div>
    </div>
  );
};

export default TaskCard;