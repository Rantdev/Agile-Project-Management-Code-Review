import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/Layout/Sidebar";
import TaskCard from "../components/Tasks/TaskCard";
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
  const [form, setForm] = useState({
    title: "",
    assignee: "",
    deadline: "",
    status: "To Do"
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("Fetching story with ID:", id);
      
      // Fetch story details
      const storyRes = await api.get(`/stories/${id}`);
      
      if (storyRes.data.success) {
        setStory(storyRes.data.story);
        setTasks(storyRes.data.tasks || []);
        console.log("Tasks loaded:", storyRes.data.tasks);
        
        // Check if user is project owner
        if (storyRes.data.story?.project_id) {
          const projectRes = await api.get(`/projects/${storyRes.data.story.project_id}`);
          const currentUserId = JSON.parse(localStorage.getItem("user") || "{}").id;
          setIsOwner(projectRes.data.project.created_by === currentUserId);
          
          // Fetch team members for assignee dropdown
          const membersRes = await api.get(`/team/project/${storyRes.data.story.project_id}`);
          setMembers(membersRes.data.members || []);
        }
      } else {
        toast.error(storyRes.data.error || "Failed to load story");
      }
    } catch (error) {
      console.error("Failed to load story details:", error);
      toast.error(error.response?.data?.error || "Failed to load story details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
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
      fetchData(); // Refresh tasks
    } catch (error) {
      console.error("Failed to create task:", error);
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
          <div className="text-center py-12">
            <p className="text-gray-500">Story not found</p>
            <Link to="/projects" className="text-blue-600 mt-4 inline-block">Back to Projects</Link>
          </div>
        </div>
      </div>
    );
  }

  // Group tasks by status
  const todoTasks = tasks.filter(t => t.status === "To Do");
  const progressTasks = tasks.filter(t => t.status === "In Progress");
  const doneTasks = tasks.filter(t => t.status === "Done");

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              to={`/projects/${story.project_id}`}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
            >
              <FiArrowLeft /> Back to Project
            </Link>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h1 className="text-2xl font-bold text-gray-800">{story.title}</h1>
              <p className="text-gray-500 mt-2">{story.description || "No description"}</p>
              <div className="flex gap-4 mt-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  story.status === "Done" ? "bg-green-100 text-green-800" :
                  story.status === "In Progress" ? "bg-yellow-100 text-yellow-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {story.status || "To Do"}
                </span>
                {isOwner && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    Product Owner
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tasks Section Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
            {isOwner && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
              >
                <FiPlus /> New Task
              </button>
            )}
          </div>

          {/* Kanban Board */}
          <div className="grid grid-cols-3 gap-6">
            {/* To Do Column */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-700 mb-3 pb-2 border-b">📋 To Do ({todoTasks.length})</h3>
              <div className="space-y-3">
                {todoTasks.map(task => (
                  <TaskCard key={task.id} task={task} onUpdate={fetchData} canEdit={true} isOwner={isOwner} />
                ))}
                {todoTasks.length === 0 && (
                  <p className="text-gray-400 text-center py-4 text-sm">No tasks</p>
                )}
              </div>
            </div>

            {/* In Progress Column */}
            <div className="bg-yellow-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-700 mb-3 pb-2 border-b">⚡ In Progress ({progressTasks.length})</h3>
              <div className="space-y-3">
                {progressTasks.map(task => (
                  <TaskCard key={task.id} task={task} onUpdate={fetchData} canEdit={true} isOwner={isOwner} />
                ))}
                {progressTasks.length === 0 && (
                  <p className="text-gray-400 text-center py-4 text-sm">No tasks</p>
                )}
              </div>
            </div>

            {/* Done Column */}
            <div className="bg-green-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-700 mb-3 pb-2 border-b">✅ Done ({doneTasks.length})</h3>
              <div className="space-y-3">
                {doneTasks.map(task => (
                  <TaskCard key={task.id} task={task} onUpdate={fetchData} canEdit={true} isOwner={isOwner} />
                ))}
                {doneTasks.length === 0 && (
                  <p className="text-gray-400 text-center py-4 text-sm">No tasks</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Create Task</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Task Title *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                value={form.assignee}
                onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Assignee</option>
                {members.map(m => (
                  <option key={m.id} value={m.user_email}>{m.user_email}</option>
                ))}
              </select>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option>To Do</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryTasks;