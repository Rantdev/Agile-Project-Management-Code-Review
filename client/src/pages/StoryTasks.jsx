import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/Layout/Sidebar";
import TaskBoard from "../components/Tasks/TaskBoard";
import api from "../services/api";
import toast from "react-hot-toast";
import { FiPlus, FiArrowLeft } from "react-icons/fi";

const StoryTasks = () => {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [form, setForm] = useState({ title: "", assignee: "", deadline: "", status: "To Do" });

  const fetchData = async () => {
    try {
      const storyRes = await api.get(`/stories/${id}`);
      setStory(storyRes.data.story);
      setTasks(storyRes.data.tasks || []);

      if (storyRes.data.story?.project_id) {
        const projectRes = await api.get(`/projects/${storyRes.data.story.project_id}`);
        const currentUserId = JSON.parse(localStorage.getItem("user") || "{}").id;
        setIsOwner(projectRes.data.project.created_by === currentUserId);
        
        const membersRes = await api.get(`/team/project/${storyRes.data.story.project_id}`);
        setMembers(membersRes.data.members || []);
      }
    } catch (error) {
      toast.error("Failed to load story details");
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
      toast.error("Task title is required");
      return;
    }

    try {
      await api.post("/tasks", { ...form, story_id: id });
      toast.success("Task created successfully");
      setShowModal(false);
      setForm({ title: "", assignee: "", deadline: "", status: "To Do" });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create task");
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

  if (!story) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="text-center py-12">Story not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <Link to={`/projects/${story.project_id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
            <FiArrowLeft /> Back to Project
          </Link>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-800">{story.title}</h1>
            <p className="text-gray-500 mt-2">{story.description || "No description"}</p>
            <div className="flex gap-4 mt-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                story.status === "Done" ? "bg-green-100 text-green-800" :
                story.status === "In Progress" ? "bg-yellow-100 text-yellow-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {story.status || "To Do"}
              </span>
              {isOwner && <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">Product Owner</span>}
            </div>
          </div>

          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
            {isOwner && (
              <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                <FiPlus /> New Task
              </button>
            )}
          </div>

          <TaskBoard tasks={tasks} onTaskUpdate={fetchData} canEdit={true} isOwner={isOwner} />
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Create Task</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Task Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
              <select value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required>
                <option value="">Select Assignee</option>
                {members.map((m) => <option key={m.id} value={m.user_email}>{m.user_email}</option>)}
              </select>
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                <option>To Do</option><option>In Progress</option><option>Done</option>
              </select>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryTasks;