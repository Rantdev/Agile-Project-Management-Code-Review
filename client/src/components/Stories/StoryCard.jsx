import { Link } from "react-router-dom";
import { FiEdit2, FiTrash2, FiChevronRight } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../services/api";

const statusColors = {
  "To Do": "bg-gray-100 text-gray-800",
  "In Progress": "bg-yellow-100 text-yellow-800",
  Done: "bg-green-100 text-green-800",
};

const StoryCard = ({ story, onUpdate }) => {
  const handleDelete = async () => {
    if (window.confirm("Delete this story? All tasks will be deleted.")) {
      try {
        await api.delete(`/stories/${story.id}`);
        toast.success("Story deleted");
        onUpdate();
      } catch (error) {
        toast.error("Failed to delete story");
      }
    }
  };

  return (
    <div className="card p-5">
      <div className="flex justify-between items-start mb-2">
        <Link to={`/stories/${story.id}`}>
          <h3 className="text-lg font-semibold text-gray-800 hover:text-purple-600 transition">
            {story.title}
          </h3>
        </Link>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-3">{story.description}</p>

      <div className="flex items-center justify-between">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[story.status] || statusColors["To Do"]
            }`}
        >
          {story.status || "To Do"}
        </span>

        <Link
          to={`/stories/${story.id}`}
          className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
        >
          View Tasks <FiChevronRight />
        </Link>
      </div>
    </div>
  );
};

export default StoryCard;