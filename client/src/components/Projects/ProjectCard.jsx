import { Link } from "react-router-dom";
import { FiTrash2, FiUsers, FiFolder } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../services/api";

const statusColors = {
  Planning: "bg-yellow-100 text-yellow-800",
  Active: "bg-green-100 text-green-800",
  Completed: "bg-blue-100 text-blue-800",
  Archived: "bg-gray-100 text-gray-800",
};

const ProjectCard = ({ project, onUpdate }) => {
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await api.delete(`/projects/${project.id}`);
        toast.success("Project deleted successfully");
        onUpdate();
      } catch (error) {
        toast.error("Failed to delete project");
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6">
      <div className="flex justify-between items-start mb-3">
        <Link to={`/projects/${project.id}`}>
          <h3 className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition">
            {project.title}
          </h3>
        </Link>
        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 transition"
        >
          <FiTrash2 />
        </button>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">
        {project.description || "No description"}
      </p>

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            statusColors[project.status] || statusColors.Planning
          }`}
        >
          {project.status || "Planning"}
        </span>

        <div className="flex gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <FiUsers className="text-sm" />
            {project.team_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <FiFolder className="text-sm" />
            {project.story_count || 0}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;