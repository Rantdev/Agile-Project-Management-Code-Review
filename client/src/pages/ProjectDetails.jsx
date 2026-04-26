import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/Layout/Sidebar";
import StoryCard from "../components/Stories/StoryCard";
import ChatBox from "../components/Chat/ChatBox";
import api from "../services/api";
import toast from "react-hot-toast";
import { FiPlus, FiArrowLeft, FiUsers, FiMessageSquare, FiMessageCircle } from "react-icons/fi";

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
      setLoading(true);
      const [projectRes, storiesRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/stories/project/${id}`)
      ]);
      
      setProject(projectRes.data.project);
      setStories(storiesRes.data.stories || []);
      console.log("Stories with tasks:", storiesRes.data.stories);
      
      const currentUserId = JSON.parse(localStorage.getItem("user") || "{}").id;
      setIsOwner(projectRes.data.project.created_by === currentUserId);
    } catch (error) {
      console.error("Failed to load project details:", error);
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
      await api.post("/stories", { ...form, project_id: id });
      toast.success("Story created successfully");
      setShowModal(false);
      setForm({ title: "", description: "", status: "To Do" });
      fetchData();
    } catch (error) {
      console.error("Failed to create story:", error);
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

  if (!project) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Project not found</p>
            <Link to="/projects" className="text-blue-600 mt-4 inline-block">Back to Projects</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 bg-gray-50">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <Link to="/projects" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
              <FiArrowLeft /> Back to Projects
            </Link>
            
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{project?.title}</h1>
                  <p className="text-gray-500 mt-2">{project?.description || "No description"}</p>
                  <div className="flex flex-wrap gap-3 mt-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      project?.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : project?.status === "Completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {project?.status || "Planning"}
                    </span>
                    <Link
                      to={`/team/${id}`}
                      className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 transition"
                    >
                      <FiUsers size={14} /> Manage Team
                    </Link>
                    <button
                      onClick={() => setShowChat(!showChat)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition ${
                        showChat 
                          ? "bg-blue-100 text-blue-800" 
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <FiMessageCircle size={14} /> {showChat ? "Hide Chat" : "Show Chat"}
                    </button>
                    {isOwner && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800">
                        Product Owner
                      </span>
                    )}
                  </div>
                </div>
                
                {isOwner && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-xl flex items-center gap-2 hover:from-blue-700 hover:to-purple-700 transition shadow-md"
                  >
                    <FiPlus /> New Story
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Chat Section */}
          {showChat && (
            <div className="mb-8 animate-fade-in">
              <ChatBox projectId={id} projectName={project?.title} />
            </div>
          )}

          {/* Stories Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">User Stories</h2>
              <span className="text-sm text-gray-400">{stories.length} stories</span>
            </div>
            
            {stories.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="text-6xl mb-4">📖</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No stories yet</h3>
                <p className="text-gray-500">
                  {isOwner 
                    ? "Create your first user story to get started"
                    : "No stories have been created yet"}
                </p>
                {isOwner && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition"
                  >
                    Create Story
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {stories.map((story) => (
                  <StoryCard key={story.id} story={story} onUpdate={fetchData} isOwner={isOwner} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Story Modal */}
      {showModal && isOwner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Create User Story</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Story Title *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option>To Do</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition">
                  Create Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;