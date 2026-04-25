import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">AgileFlow</h1>
          <div className="flex gap-4">
            <span>Welcome, {user?.name}!</span>
            <button onClick={() => { localStorage.clear(); window.location.href = "/"; }} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
          </div>
        </div>
      </nav>
      <div className="container mx-auto p-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
          <p className="text-gray-600">Email: {user?.email}</p>
          <p className="text-gray-600">Role: {user?.role || "Not set"}</p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <Link to="/projects" className="bg-blue-500 text-white text-center p-3 rounded hover:bg-blue-600">My Projects</Link>
            <Link to="/my-tasks" className="bg-green-500 text-white text-center p-3 rounded hover:bg-green-600">My Tasks</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;