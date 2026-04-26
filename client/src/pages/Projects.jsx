import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Layout/Sidebar";
import api from "../services/api";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiFolder } from "react-icons/fi";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", status: "Planning" });

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.projects || []);
    } catch (error) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Project title is required");
      return;
    }

    try {
      if (editingProject) {
        await api.put(`/projects/${editingProject.id}`, form);
        toast.success("Project updated successfully");
      } else {
        await api.post("/projects", form);
        toast.success("Project created successfully");
      }
      setShowModal(false);
      setEditingProject(null);
      setForm({ title: "", description: "", status: "Planning" });
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.error || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await api.delete(`/projects/${id}`);
        toast.success("Project deleted successfully");
        fetchProjects();
      } catch (error) {
        toast.error("Failed to delete project");
      }
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setForm({ title: project.title, description: project.description || "", status: project.status || "Planning" });
    setShowModal(true);
  };

  const statusColors = {
    Planning: "bg-yellow-100 text-yellow-800",
    Active: "bg-green-100 text-green-800",
    Completed: "bg-blue-100 text-blue-800",
    Archived: "bg-gray-100 text-gray-800",
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Projects</h1>
              <p className="text-gray-500 mt-1">Manage all your projects</p>
            </div>
            <button
              onClick={() => {
                setEditingProject(null);
                setForm({ title: "", description: "", status: "Planning" });
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <FiPlus /> New Project
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <FiFolder className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-4">Create your first project to get started</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6">
                  <Link to={`/projects/${project.id}`}>
                    <h2 className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition">
                      {project.title}
                    </h2>
                  </Link>
                  <p className="text-gray-600 mt-2 line-clamp-2">{project.description || "No description"}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[project.status] || statusColors.Planning}`}>
                      {project.status || "Planning"}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(project)} className="text-blue-500 hover:text-blue-700">
                        <FiEdit2 />
                      </button>
                      <button onClick={() => handleDelete(project.id)} className="text-red-500 hover:text-red-700">
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{editingProject ? "Edit Project" : "Create Project"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Project Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="3" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                <option>Planning</option><option>Active</option><option>Completed</option><option>Archived</option>
              </select>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); setEditingProject(null); }} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">{editingProject ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;