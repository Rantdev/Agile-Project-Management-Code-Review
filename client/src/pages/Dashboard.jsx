import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Layout/Sidebar";
import api from "../services/api";
import { FiFolder, FiCheckCircle, FiUsers, FiTrendingUp } from "react-icons/fi";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    completedTasks: 0,
    teamMembers: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        api.get("/projects"),
        api.get("/tasks/my-tasks"),
      ]);

      const projects = projectsRes.data.projects || [];
      const tasks = tasksRes.data.tasks || [];

      setStats({
        projects: projects.length,
        tasks: tasks.length,
        completedTasks: tasks.filter((t) => t.status === "Done").length,
        teamMembers: projects.reduce((sum, p) => sum + (p.team_count || 0), 0),
      });

      setRecentTasks(tasks.slice(0, 5));
      setRecentProjects(projects.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  };

  const statCards = [
    { icon: FiFolder, label: "Projects", value: stats.projects, color: "bg-blue-500" },
    { icon: FiCheckCircle, label: "My Tasks", value: stats.tasks, color: "bg-green-500" },
    { icon: FiTrendingUp, label: "Completed", value: stats.completedTasks, color: "bg-purple-500" },
    { icon: FiUsers, label: "Team Members", value: stats.teamMembers, color: "bg-orange-500" },
  ];

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome back, {user?.name?.split(" ")[0] || "User"}! 👋
            </h1>
            <p className="text-gray-500 mt-1">Here's what's happening with your projects today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-xl text-white`}>
                    <stat.icon className="text-2xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Tasks */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Tasks</h2>
              {recentTasks.length > 0 ? (
                <div className="space-y-3">
                  {recentTasks.map((task) => (
                    <Link
                      key={task.id}
                      to={`/stories/${task.story_id}`}
                      className="block p-3 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-gray-800">{task.title}</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${task.status === "Done"
                              ? "bg-green-100 text-green-800"
                              : task.status === "In Progress"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                        >
                          {task.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{task.project_title}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No tasks assigned yet</p>
              )}
            </div>

            {/* Recent Projects */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Projects</h2>
              {recentProjects.length > 0 ? (
                <div className="space-y-3">
                  {recentProjects.map((project) => (
                    <Link
                      key={project.id}
                      to={`/projects/${project.id}`}
                      className="block p-3 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-gray-800 font-medium">{project.title}</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${project.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : project.status === "Completed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                        >
                          {project.status || "Planning"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {project.description || "No description"}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No projects yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;