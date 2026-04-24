import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/Layout/Sidebar";
import TaskBoard from "../components/Tasks/TaskBoard";
import api from "../services/api";
import toast from "react-hot-toast";
import { FiPlus, FiArrowLeft, FiUsers } from "react-icons/fi";

const StoryTasks = () => {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [form, setForm] = useState({
    title: "",
    assignee: "",
    deadline: "",
    status: "To Do",
  });

  // Get current user from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to parse user:", error);
      }
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch story details
      const storyRes = await api.get(`/stories/${id}`);
      setStory(storyRes.data.story);
      setTasks(storyRes.data.tasks || []);

      // Check if user is project owner
      if (storyRes.data.story?.project_id) {
        const projectRes = await api.get(`/projects/${storyRes.data.story.project_id}`);
        const currentUserId = currentUser?.id || localStorage.getItem("userId");
        const isProjectOwner = projectRes.data.project.created_by === parseInt(currentUserId);
        setIsOwner(isProjectOwner);
        
        // Fetch team members for assignee dropdown (only if owner)
        if (isProjectOwner) {
          try {
            const membersRes = await api.get(`/team/project/${storyRes.data.story.project_id}`);
            setMembers(membersRes.data.members || []);
          } catch (err) {
            console.error("Failed to fetch team members:", err);
            setMembers([]);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load story details:", error);
      toast.error(error.response?.data?.error || "Failed to load story details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [id, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    try {
      await api.post("/tasks", { 
        ...form, 
        story_id: id 
      });
      toast.success("Task created successfully");
      setShowModal(false);
      setForm({ 
        title: "", 
        assignee: "", 
        deadline: "", 
        status: "To Do" 
      });
      fetchData(); // Refresh the task list
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error(error.response?.data?.error || "Failed to create task");
    }
  };

  const handleStatusChange = (taskId, newStatus) => {
    // This will be handled by TaskCard component
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64 flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64 flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800">Story not found</h2>
            <p className="text-gray-500 mt-2">The story you're looking for doesn't exist or you don't have access.</p>
            <Link to="/projects" className="mt-4 inline-block text-blue-600 hover:underline">
              Go back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          {/* Header with Back Button */}
          <div className="mb-8">
            <Link
              to={`/projects/${story?.project_id}`}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition"
            >
              <FiArrowLeft /> Back to Project
            </Link>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-800">{story?.title}</h1>
                  <p className="text-gray-500 mt-2">{story?.description || "No description provided"}</p>
                  
                  <div className="flex flex-wrap gap-4 mt-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      story?.status === "Done"
                        ? "bg-green-100 text-green-800"
                        : story?.status === "In Progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}>
                      {story?.status || "To Do"}
                    </span>
                    
                    {isOwner && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 flex items-center gap-1">
                        <FiUsers size={14} /> Product Owner
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Stats Cards */}
                <div className="flex gap-4">
                  <div className="text-center bg-gray-50 rounded-lg px-4 py-2">
                    <p className="text-2xl font-bold text-gray-800">{tasks.length}</p>
                    <p className="text-xs text-gray-500">Total Tasks</p>
                  </div>
                  <div className="text-center bg-gray-50 rounded-lg px-4 py-2">
                    <p className="text-2xl font-bold text-green-600">
                      {tasks.filter(t => t.status === "Done").length}
                    </p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks Section with Conditional New Task Button */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
              <p className="text-sm text-gray-500 mt-1">
                {isOwner 
                  ? "You can create, edit, and delete tasks"
                  : "You can only update the status of your assigned tasks"}
              </p>
            </div>
            
            {/* Only show New Task button for Product Owner */}
            {isOwner && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-sm"
              >
                <FiPlus size={18} /> New Task
              </button>
            )}
          </div>

          {/* Task Board */}
          {tasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No tasks yet</h3>
              <p className="text-gray-500">
                {isOwner 
                  ? "Create your first task to get started"
                  : "No tasks have been created for this story yet"}
              </p>
              {isOwner && (
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Create First Task
                </button>
              )}
            </div>
          ) : (
            <TaskBoard
              tasks={tasks}
              onTaskUpdate={fetchData}
              canEdit={true}
              isOwner={isOwner}
              currentUserEmail={currentUser?.email}
            />
          )}
        </div>
      </div>

      {/* Create Task Modal - Only shown for Product Owner */}
      {showModal && isOwner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Create New Task</h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <FiPlus className="rotate-45" size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter task title"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignee *
                </label>
                <select
                  value={form.assignee}
                  onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  required
                >
                  <option value="">Select a team member</option>
                  {members.length === 0 ? (
                    <option disabled>No team members yet. Add members from project page.</option>
                  ) : (
                    members.map((member) => (
                      <option key={member.id} value={member.user_email}>
                        {member.user_email} ({member.role})
                      </option>
                    ))
                  )}
                </select>
                {members.length === 0 && (
                  <p className="text-xs text-orange-500 mt-1">
                    No team members found. Add team members from the project page first.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  disabled={members.length === 0}
                >
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