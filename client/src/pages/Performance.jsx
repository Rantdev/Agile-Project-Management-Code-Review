import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Layout/Sidebar";
import api from "../services/api";
import toast from "react-hot-toast";
import { FiTrendingUp, FiCheckCircle, FiClock, FiUsers, FiBarChart2, FiAward, FiTarget, FiActivity } from "react-icons/fi";

const Performance = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userPerformance, setUserPerformance] = useState(null);
  const [companyAnalytics, setCompanyAnalytics] = useState(null);
  const [topPerformers, setTopPerformers] = useState([]);
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    if (!user) {
      return;
    }
    fetchPerformanceData();
  }, [user]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      
      // Fetch user performance
      const userPerfRes = await api.get(`/performance/user/${user?.id}`);
      setUserPerformance(userPerfRes.data.performance);
      
      // Fetch company analytics
      const companyRes = await api.get("/performance/company/analytics");
      setCompanyAnalytics(companyRes.data.analytics);
      setTopPerformers(companyRes.data.analytics.topPerformers || []);
      
    } catch (error) {
      console.error("Failed to fetch performance data:", error);
      if (error.response?.status === 401) {
        logout();
      } else {
        toast.error("Failed to load performance data");
      }
    } finally {
      setLoading(false);
    }
  };

  const getCompletionRateColor = (rate) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 50) return "text-yellow-600";
    return "text-red-600";
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

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Performance Analytics</h1>
            <p className="text-gray-500 mt-1">Track your productivity and team metrics</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b">
            <button
              onClick={() => setActiveTab("personal")}
              className={`px-4 py-2 font-semibold transition flex items-center gap-2 ${
                activeTab === "personal"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FiActivity /> My Performance
            </button>
            <button
              onClick={() => setActiveTab("company")}
              className={`px-4 py-2 font-semibold transition flex items-center gap-2 ${
                activeTab === "company"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FiBarChart2 /> Company Analytics
            </button>
          </div>

          {/* Personal Performance Tab */}
          {activeTab === "personal" && userPerformance && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Completion Rate</p>
                      <p className={`text-3xl font-bold ${getCompletionRateColor(userPerformance.completion_rate)}`}>
                        {userPerformance.completion_rate || 0}%
                      </p>
                    </div>
                    <FiTarget className="text-blue-500 text-4xl" />
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Completed Tasks</p>
                      <p className="text-3xl font-bold text-green-600">
                        {userPerformance.completed_tasks || 0}
                      </p>
                    </div>
                    <FiCheckCircle className="text-green-500 text-4xl" />
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">In Progress</p>
                      <p className="text-3xl font-bold text-yellow-600">
                        {userPerformance.in_progress_tasks || 0}
                      </p>
                    </div>
                    <FiClock className="text-yellow-500 text-4xl" />
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Pending Tasks</p>
                      <p className="text-3xl font-bold text-red-600">
                        {userPerformance.pending_tasks || 0}
                      </p>
                    </div>
                    <FiClock className="text-red-500 text-4xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Breakdown</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Progress</span>
                      <span className="font-semibold">{userPerformance.completion_rate || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${userPerformance.completion_rate || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-xl font-bold text-green-600">{userPerformance.completed_tasks || 0}</p>
                      <p className="text-xs text-gray-600">Completed</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="text-xl font-bold text-yellow-600">{userPerformance.in_progress_tasks || 0}</p>
                      <p className="text-xs text-gray-600">In Progress</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xl font-bold text-gray-600">{userPerformance.pending_tasks || 0}</p>
                      <p className="text-xs text-gray-600">Pending</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Company Analytics Tab */}
          {activeTab === "company" && companyAnalytics && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                  <FiUsers className="text-blue-500 text-4xl mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Total Users</p>
                  <p className="text-2xl font-bold">{companyAnalytics.total_users || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                  <FiBarChart2 className="text-green-500 text-4xl mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Total Projects</p>
                  <p className="text-2xl font-bold">{companyAnalytics.total_projects || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                  <FiCheckCircle className="text-purple-500 text-4xl mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Completion Rate</p>
                  <p className={`text-2xl font-bold ${getCompletionRateColor(companyAnalytics.overall_completion_rate)}`}>
                    {companyAnalytics.overall_completion_rate || 0}%
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                  <FiClock className="text-red-500 text-4xl mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Overdue Tasks</p>
                  <p className="text-2xl font-bold text-red-600">{companyAnalytics.total_overdue_tasks || 0}</p>
                </div>
              </div>

              {topPerformers.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-4 text-white">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <FiAward /> Top Performers
                    </h2>
                  </div>
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4">Rank</th>
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-left py-3 px-4">Completed Tasks</th>
                        <th className="text-left py-3 px-4">Completion Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topPerformers.map((performer, index) => (
                        <tr key={performer.email} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}`}
                          </td>
                          <td className="py-3 px-4 font-medium">{performer.name}</td>
                          <td className="py-3 px-4">{performer.completed_tasks || 0}</td>
                          <td className="py-3 px-4">
                            <span className={`font-semibold ${getCompletionRateColor(performer.completion_rate)}`}>
                              {performer.completion_rate || 0}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Performance;