import { Link } from "react-router-dom";
import { FiEdit2, FiTrash2, FiChevronRight, FiCheckCircle, FiClock, FiList, FiTrendingUp } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../services/api";

const statusColors = {
  "To Do": "bg-gray-100 text-gray-800",
  "In Progress": "bg-yellow-100 text-yellow-800",
  Done: "bg-green-100 text-green-800",
};

const StoryCard = ({ story, onUpdate, isOwner = false }) => {
  const handleDelete = async () => {
    if (window.confirm("Delete this story? All tasks will be deleted.")) {
      try {
        await api.delete(`/stories/${story.id}`);
        toast.success("Story deleted successfully");
        onUpdate();
      } catch (error) {
        toast.error("Failed to delete story");
      }
    }
  };

  const taskCount = story.taskCount || story.tasks?.length || 0;
  const completedCount = story.completedTasks || story.tasks?.filter(t => t.status === "Done").length || 0;
  const progressPercent = taskCount > 0 ? (completedCount / taskCount) * 100 : 0;
  const recentTasks = story.tasks?.slice(0, 3) || [];

  const getProgressColor = () => {
    if (progressPercent >= 80) return "bg-green-500";
    if (progressPercent >= 50) return "bg-blue-500";
    if (progressPercent >= 20) return "bg-yellow-500";
    return "bg-gray-400";
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100 group">
      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <Link to={`/stories/${story.id}`} className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition line-clamp-1">
              {story.title}
            </h3>
          </Link>
          {isOwner && (
            <button
              onClick={handleDelete}
              className="text-red-400 hover:text-red-600 transition opacity-0 group-hover:opacity-100"
              title="Delete story"
            >
              <FiTrash2 size={18} />
            </button>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {story.description || "No description"}
        </p>

        {/* Status and Task Count */}
        <div className="flex items-center justify-between mb-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[story.status] || statusColors["To Do"]}`}>
            {story.status || "To Do"}
          </span>
          
          <Link to={`/stories/${story.id}`} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition">
            <FiList size={14} />
            <span className="font-medium">{taskCount} task{taskCount !== 1 ? 's' : ''}</span>
            <FiChevronRight size={14} />
          </Link>
        </div>

        {/* Progress Section */}
        {taskCount > 0 ? (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span className="flex items-center gap-1">
                <FiTrendingUp size={12} />
                Progress
              </span>
              <span className="font-medium">{completedCount}/{taskCount} completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`${getProgressColor()} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="text-right text-xs text-gray-400 mt-1">
              {Math.round(progressPercent)}% complete
            </div>
          </div>
        ) : (
          <div className="mb-4 py-2 text-center bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-400">No tasks yet</p>
          </div>
        )}

        {/* Recent Tasks Preview */}
        {recentTasks.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-2">Recent Tasks</p>
            <div className="space-y-2">
              {recentTasks.map((task, idx) => (
                <div key={task.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {task.status === "Done" ? (
                      <FiCheckCircle className="text-green-500 text-xs flex-shrink-0" />
                    ) : task.status === "In Progress" ? (
                      <FiClock className="text-yellow-500 text-xs flex-shrink-0" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0"></div>
                    )}
                    <span className="text-gray-600 truncate">{task.title}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${
                    task.status === "Done" ? "bg-green-100 text-green-700" :
                    task.status === "In Progress" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {task.status === "Done" ? "✓" : task.status === "In Progress" ? "⚡" : "○"}
                  </span>
                </div>
              ))}
            </div>
            
            {taskCount > 3 && (
              <Link 
                to={`/stories/${story.id}`}
                className="text-xs text-blue-500 hover:text-blue-600 mt-2 inline-flex items-center gap-1"
              >
                View all {taskCount} tasks <FiChevronRight size={10} />
              </Link>
            )}
          </div>
        )}

        {/* Add Task Button for Owners */}
        {isOwner && taskCount === 0 && (
          <Link
            to={`/stories/${story.id}`}
            className="mt-3 inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600"
          >
            <FiList size={12} /> Add first task →
          </Link>
        )}
      </div>
    </div>
  );
};

export default StoryCard;