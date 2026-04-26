import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Layout/Sidebar";
import api from "../services/api";
import { FiFolder, FiCheckCircle, FiLogOut, FiUser } from "react-icons/fi";

const Dashboard = () => {
  const { user, logout, needsRoleSetup } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ projects: 0, tasks: 0, completedTasks: 0 });

  useEffect(() => {
    if (!user) navigate("/");
    else if (needsRoleSetup) navigate("/role-setup");
    else fetchStats();
  }, [user, needsRoleSetup]);

  const fetchStats = async () => {
    try {
      const projects = await api.get("/projects");
      const tasks = await api.get("/tasks/my-tasks");
      setStats({ projects: projects.data.projects?.length || 0, tasks: tasks.data.tasks?.length || 0, completedTasks: tasks.data.tasks?.filter(t => t.status === "Done").length || 0 });
    } catch (error) { console.error(error); }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <nav className="bg-white shadow p-4 flex justify-between items-center"><h1 className="text-2xl font-bold text-blue-600">AgileFlow</h1><div className="flex items-center gap-4"><Link to={`/profile/${user?.id}`}><FiUser size={20} /></Link><button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button></div></nav>
        <div className="p-8">
          <div className="bg-white rounded-lg shadow p-6 mb-8"><h2 className="text-2xl font-bold">Welcome, {user?.name}!</h2><p className="text-gray-600">Manage your projects and tasks efficiently</p></div>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6 text-center border-l-4 border-blue-500"><p className="text-gray-500">Projects</p><p className="text-3xl font-bold">{stats.projects}</p><FiFolder className="text-blue-500 text-4xl mx-auto mt-2" /></div>
            <div className="bg-white rounded-lg shadow p-6 text-center border-l-4 border-green-500"><p className="text-gray-500">My Tasks</p><p className="text-3xl font-bold">{stats.tasks}</p><FiCheckCircle className="text-green-500 text-4xl mx-auto mt-2" /></div>
            <div className="bg-white rounded-lg shadow p-6 text-center border-l-4 border-purple-500"><p className="text-gray-500">Completed</p><p className="text-3xl font-bold">{stats.completedTasks}</p><FiCheckCircle className="text-purple-500 text-4xl mx-auto mt-2" /></div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-6">
            <Link to="/projects" className="bg-blue-600 text-white text-center p-3 rounded-lg hover:bg-blue-700">View Projects</Link>
            <Link to="/my-tasks" className="bg-green-600 text-white text-center p-3 rounded-lg hover:bg-green-700">View Tasks</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;