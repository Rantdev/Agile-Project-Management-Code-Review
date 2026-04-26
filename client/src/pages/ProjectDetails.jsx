import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/Layout/Sidebar";
import api from "../services/api";
import toast from "react-hot-toast";
import { FiPlus, FiArrowLeft, FiUsers, FiEdit2, FiTrash2 } from "react-icons/fi";

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", status: "To Do" });

  const fetchData = async () => {
    try {
      const [projectRes, storiesRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/stories/project/${id}`)
      ]);
      setProject(projectRes.data.project);
      setStories(storiesRes.data.stories || []);
      const currentUserId = JSON.parse(localStorage.getItem("user") || "{}").id;
      setIsOwner(projectRes.data.project.created_by === currentUserId);
    } catch (error) {
      toast.error("Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Story title is required");
      return;
    }

    try {
      if (editingStory) {
        await api.put(`/stories/${editingStory.id}`, form);
        toast.success("Story updated successfully");
      } else {
        await api.post("/stories", { ...form, project_id: id });
        toast.success("Story created successfully");
      }
      setShowModal(false);
      setEditingStory(null);
      setForm({ title: "", description: "", status: "To Do" });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || "Operation failed");
    }
  };

  const handleDeleteStory = async (storyId) => {
    if (window.confirm("Delete this story? All tasks will be deleted.")) {
      try {
        await api.delete(`/stories/${storyId}`);
        toast.success("Story deleted");
        fetchData();
      } catch (error) {
        toast.error("Failed to delete story");
      }
    }
  };

  const statusColors = {
    "To Do": "bg-gray-100 text-gray-800",
    "In Progress": "bg-yellow-100 text-yellow-800",
    "Done": "bg-green-100 text-green-800",
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

  if (!project) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="text-center py-12">Project not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <Link to="/projects" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
            <FiArrowLeft /> Back to Projects
          </Link>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{project.title}</h1>
                <p className="text-gray-500 mt-2">{project.description || "No description"}</p>
                <div className="flex gap-4 mt-3">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {project.status || "Planning"}
                  </span>
                  <Link to={`/team/${id}`} className="flex items-center gap-2 text-purple-600 hover:text-purple-700">
                    <FiUsers /> Manage Team
                  </Link>
                </div>
              </div>
              {isOwner && (
                <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                  <FiPlus /> New Story
                </button>
              )}
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">User Stories</h2>
          {stories.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <p className="text-gray-500">No stories yet. Create your first story!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stories.map((story) => (
                <div key={story.id} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <Link to={`/stories/${story.id}`} className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition">
                        {story.title}
                      </h3>
                    </Link>
                    {isOwner && (
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingStory(story); setForm({ title: story.title, description: story.description || "", status: story.status || "To Do" }); setShowModal(true); }} className="text-blue-500 hover:text-blue-700">
                          <FiEdit2 />
                        </button>
                        <button onClick={() => handleDeleteStory(story.id)} className="text-red-500 hover:text-red-700">
                          <FiTrash2 />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{story.description || "No description"}</p>
                  <span className={`inline-block mt-3 px-2 py-1 rounded-full text-xs font-medium ${statusColors[story.status] || statusColors["To Do"]}`}>
                    {story.status || "To Do"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{editingStory ? "Edit Story" : "Create Story"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Story Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="3" className="w-full px-4 py-2 border rounded-lg" />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                <option>To Do</option><option>In Progress</option><option>Done</option>
              </select>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); setEditingStory(null); }} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">{editingStory ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;