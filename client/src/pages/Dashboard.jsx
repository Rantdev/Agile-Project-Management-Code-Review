import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Layout/Sidebar";
import api from "../services/api";
import { 
  FiFolder, FiCheckCircle, FiClock, FiUsers, 
  FiTrendingUp, FiAward, FiCalendar, FiActivity,
  FiArrowRight, FiStar, FiZap, FiTarget
} from "react-icons/fi";

const Dashboard = () => {
  const { user, logout, needsRoleSetup } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    completedTasks: 0,
    completionRate: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    if (needsRoleSetup) {
      navigate("/role-setup");
      return;
    }
    fetchDashboardData();
    setGreeting(getGreeting());
  }, [user, needsRoleSetup]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [projectsRes, tasksRes] = await Promise.all([
        api.get("/projects"),
        api.get("/tasks/my-tasks")
      ]);
      
      const projects = projectsRes.data.projects || [];
      const tasks = tasksRes.data.tasks || [];
      const completedTasks = tasks.filter(t => t.status === "Done").length;
      const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
      
      setStats({
        projects: projects.length,
        tasks: tasks.length,
        completedTasks: completedTasks,
        completionRate: completionRate
      });
      
      // Get recent tasks (last 5)
      setRecentTasks(tasks.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Projects",
      value: stats.projects,
      icon: FiFolder,
      color: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      iconColor: "text-blue-600",
      link: "/projects"
    },
    {
      title: "Active Tasks",
      value: stats.tasks,
      icon: FiClock,
      color: "from-yellow-500 to-yellow-600",
      bgGradient: "from-yellow-50 to-yellow-100",
      iconColor: "text-yellow-600",
      link: "/my-tasks"
    },
    {
      title: "Completed",
      value: stats.completedTasks,
      icon: FiCheckCircle,
      color: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100",
      iconColor: "text-green-600",
      link: "/my-tasks"
    },
    {
      title: "Completion Rate",
      value: `${stats.completionRate}%`,
      icon: FiTarget,
      color: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      iconColor: "text-purple-600",
      link: "/performance"
    }
  ];

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Top Navigation Bar */}
        <div className="bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
          <div className="flex justify-between items-center px-8 py-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">{greeting}</p>
                <p className="font-semibold text-gray-800">{user?.name?.split(' ')[0] || "User"}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Welcome Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <FiActivity size={150} />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2">
                {greeting}, {user?.name?.split(' ')[0] || "User"}! 👋
              </h2>
              <p className="text-blue-100 mb-6">Welcome back to your Agile workspace. Here's what's happening today.</p>
              <div className="flex gap-4">
                <Link to="/projects" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-5 py-2 rounded-xl transition flex items-center gap-2">
                  <FiFolder /> View Projects <FiArrowRight />
                </Link>
                <Link to="/my-tasks" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-5 py-2 rounded-xl transition flex items-center gap-2">
                  <FiCheckCircle /> My Tasks <FiArrowRight />
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <Link
                key={index}
                to={stat.link}
                className={`bg-gradient-to-br ${stat.bgGradient} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg group-hover:scale-110 transition-transform`}>
                    <stat.icon className="text-white text-xl" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-sm text-gray-400 group-hover:text-gray-600">
                  View Details <FiArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Tasks */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Recent Tasks</h3>
                    <p className="text-sm text-gray-500">Your most recent assignments</p>
                  </div>
                  <Link to="/my-tasks" className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
                    View All <FiArrowRight size={14} />
                  </Link>
                </div>
                
                {recentTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FiCheckCircle className="text-gray-400 text-2xl" />
                    </div>
                    <p className="text-gray-400">No tasks assigned yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer"
                        onClick={() => window.location.href = `/stories/${task.story_id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <div className={`w-2 h-2 rounded-full ${task.status === "Done" ? "bg-green-500" : task.status === "In Progress" ? "bg-yellow-500" : "bg-gray-400"}`}></div>
                            <p className="font-medium text-gray-800">{task.title}</p>
                          </div>
                          <p className="text-sm text-gray-500">{task.project_title || "No project"}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            task.status === "Done" ? "bg-green-100 text-green-700" :
                            task.status === "In Progress" ? "bg-yellow-100 text-yellow-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {task.status}
                          </span>
                          {task.deadline && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <FiCalendar size={12} /> {new Date(task.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats & Productivity */}
            <div className="space-y-6">
              {/* Productivity Card */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-green-100 text-sm">Productivity Score</p>
                    <p className="text-3xl font-bold">{stats.completionRate}%</p>
                  </div>
                  <div className="p-2 bg-white/20 rounded-xl">
                    <FiZap className="text-2xl" />
                  </div>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 mb-3">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.completionRate}%` }}
                  ></div>
                </div>
                <p className="text-green-100 text-sm">
                  {stats.completionRate >= 80 ? "Excellent progress! 🎉" :
                   stats.completionRate >= 50 ? "Good work! Keep going 💪" :
                   "Let's boost your productivity! 🚀"}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiZap className="text-yellow-500" /> Quick Actions
                </h3>
                <div className="space-y-3">
                  <Link
                    to="/projects"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition group"
                  >
                    <span className="text-gray-700">Create New Project</span>
                    <FiArrowRight className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
                  </Link>
                  <Link
                    to="/my-tasks"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-green-50 transition group"
                  >
                    <span className="text-gray-700">View My Tasks</span>
                    <FiArrowRight className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition" />
                  </Link>
                  <Link
                    to="/performance"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-purple-50 transition group"
                  >
                    <span className="text-gray-700">View Analytics</span>
                    <FiArrowRight className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition" />
                  </Link>
                </div>
              </div>

              {/* Tip of the Day */}
              <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl p-6 border border-orange-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-100 rounded-xl">
                    <FiStar className="text-orange-500" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Pro Tip</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Break down large tasks into smaller subtasks to track progress more effectively and stay motivated! 🚀
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;