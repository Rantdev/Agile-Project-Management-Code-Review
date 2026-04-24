import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/Layout/Sidebar";
import StoryCard from "../components/Stories/StoryCard";
import Chat from "../components/Chat/Chat";
import api from "../services/api";
import toast from "react-hot-toast";
import { FiPlus, FiArrowLeft, FiUsers, FiMessageSquare } from "react-icons/fi";

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", status: "To Do" });

  const fetchData = async () => {
    try {
      const [projectRes, storiesRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/stories/project/${id}`),
      ]);
      setProject(projectRes.data.project);
      setStories(storiesRes.data.stories || []);
      
      const currentUserId = localStorage.getItem("userId") || 
                            JSON.parse(localStorage.getItem("user") || "{}").id;
      setIsOwner(projectRes.data.project.created_by === parseInt(currentUserId));
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
    try {
      await api.post("/stories", { ...form, project_id: id });
      toast.success("Story created successfully");
      setShowModal(false);
      setForm({ title: "", description: "", status: "To Do" });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create story");
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
          {/* Header */}
          <div className="mb-8">
            <Link to="/projects" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
              <FiArrowLeft /> Back to Projects
            </Link>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{project?.title}</h1>
                <p className="text-gray-500 mt-2">{project?.description}</p>
                <div className="flex gap-4 mt-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    project?.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : project?.status === "Completed"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {project?.status || "Planning"}
                  </span>
                  <Link to={`/team/${id}`} className="flex items-center gap-2 text-purple-600 hover:text-purple-700">
                    <FiUsers /> Manage Team
                  </Link>
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <FiMessageSquare /> {showChat ? "Hide Chat" : "Show Chat"}
                  </button>
                  {isOwner && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      Product Owner
                    </span>
                  )}
                </div>
              </div>
              
              {isOwner && (
                <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                  <FiPlus /> New Story
                </button>
              )}
            </div>
          </div>

          {/* Chat Section */}
          {showChat && (
            <div className="mb-8">
              <Chat projectId={id} projectName={project?.title} />
            </div>
          )}

          {/* Stories Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">User Stories</h2>
            {stories.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <div className="text-6xl mb-4">📖</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No stories yet</h3>
                <p className="text-gray-500">
                  {isOwner 
                    ? "Create your first user story to get started"
                    : "No stories have been created yet"}
                </p>
                {isOwner && (
                  <button onClick={() => setShowModal(true)} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg">
                    Create Story
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stories.map((story) => (
                  <StoryCard key={story.id} story={story} onUpdate={fetchData} isOwner={isOwner} />
                ))}
              </div>
            )}
          </div>

          {/* Create Story Modal */}
          {showModal && isOwner && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Create User Story</h2>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                    <FiPlus className="rotate-45" size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Story Title *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option>To Do</option>
                      <option>In Progress</option>
                      <option>Done</option>
                    </select>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      Cancel
                    </button>
                    <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                      Create Story
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;