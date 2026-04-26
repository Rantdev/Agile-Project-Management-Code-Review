import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiFolder, FiCheckCircle, FiUsers, FiTrendingUp, FiLogOut, FiUser, FiList } from "react-icons/fi";
import api from "../services/api";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { user, logout, needsRoleSetup } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    completedTasks: 0,
    teamMembers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    
    // If user needs role setup, redirect
    if (needsRoleSetup) {
      navigate("/role-setup");
      return;
    }
    
    fetchStats();
  }, [user, needsRoleSetup, navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch projects
      const projectsRes = await api.get("/projects");
      const projects = projectsRes.data.projects || [];
      
      // Fetch tasks
      const tasksRes = await api.get("/tasks/my-tasks");
      const tasks = tasksRes.data.tasks || [];
      
      setStats({
        projects: projects.length,
        tasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === "Done").length,
        teamMembers: 0
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AgileFlow
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Welcome, {user?.name || "User"}!</span>
              <Link to={`/profile/${user?.id}`} className="text-gray-600 hover:text-blue-600">
                <FiUser size={20} />
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                <FiLogOut /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name?.split(' ')[0] || "User"}! 👋</h2>
          <p className="text-gray-500 mt-1">Here's what's happening with your projects today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Projects</p>
                <p className="text-3xl font-bold text-gray-800">{stats.projects}</p>
              </div>
              <FiFolder className="text-blue-500 text-4xl" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">My Tasks</p>
                <p className="text-3xl font-bold text-gray-800">{stats.tasks}</p>
              </div>
              <FiList className="text-green-500 text-4xl" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Completed Tasks</p>
                <p className="text-3xl font-bold text-gray-800">{stats.completedTasks}</p>
              </div>
              <FiCheckCircle className="text-purple-500 text-4xl" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/projects"
                className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                View My Projects
              </Link>
              <Link
                to="/my-tasks"
                className="block w-full text-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                View My Tasks
              </Link>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Getting Started</h3>
            <ul className="space-y-2 text-gray-600">
              <li>1. Create a new project</li>
              <li>2. Add team members to your project</li>
              <li>3. Create user stories</li>
              <li>4. Break stories into tasks</li>
              <li>5. Assign tasks to team members</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;