import { NavLink } from "react-router-dom";
import { 
  FiHome, 
  FiFolder, 
  FiUsers, 
  FiLogOut,
  FiCheckCircle,
  FiBarChart2,
  FiUser,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const { logout, user } = useAuth();

  const navItems = [
    { path: "/dashboard", icon: FiHome, label: "Dashboard" },
    { path: "/projects", icon: FiFolder, label: "Projects" },
    { path: "/my-tasks", icon: FiCheckCircle, label: "My Tasks" },
    { path: "/performance", icon: FiBarChart2, label: "Performance" },
  ];

  // Only add profile link if user exists
  const profilePath = user?.id ? `/profile/${user.id}` : "/profile";

  return (
    <aside className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col fixed h-full">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          AgileFlow
        </h1>
        <p className="text-sm text-gray-400 mt-1">Project Management</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`
                }
              >
                <item.icon className="text-xl" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink
              to={profilePath}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`
              }
            >
              <FiUser className="text-xl" />
              <span>Profile</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="mb-4 p-3 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-400">Logged in as</p>
          <p className="font-semibold truncate">{user?.email || "User"}</p>
          {user?.role && user.role !== "member" && (
            <p className="text-xs text-blue-400 mt-1">{user.role}</p>
          )}
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200"
        >
          <FiLogOut className="text-xl" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;