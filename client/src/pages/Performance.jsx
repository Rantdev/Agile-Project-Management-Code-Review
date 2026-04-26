import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Layout/Sidebar";
import api from "../services/api";
import toast from "react-hot-toast";
import { FiTrendingUp, FiCheckCircle, FiClock, FiUsers, FiBarChart2, FiAward } from "react-icons/fi";

const Performance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userPerformance, setUserPerformance] = useState(null);
  const [companyAnalytics, setCompanyAnalytics] = useState(null);
  const [topPerformers, setTopPerformers] = useState([]);
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    if (user) fetchPerformanceData();
  }, [user]);

  const fetchPerformanceData = async () => {
    try {
      const userPerfRes = await api.get(`/performance/user/${user?.id}`);
      setUserPerformance(userPerfRes.data.performance);
      const companyRes = await api.get("/performance/company/analytics");
      setCompanyAnalytics(companyRes.data.analytics);
      setTopPerformers(companyRes.data.analytics.topPerformers || []);
    } catch (error) {
      toast.error("Failed to load performance data");
    } finally {
      setLoading(false);
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

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Performance Analytics</h1>
          <p className="text-gray-500 mb-8">Track your productivity and team metrics</p>

          <div className="flex gap-4 mb-6 border-b">
            <button onClick={() => setActiveTab("personal")} className={`px-4 py-2 font-semibold ${activeTab === "personal" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}>My Performance</button>
            <button onClick={() => setActiveTab("company")} className={`px-4 py-2 font-semibold ${activeTab === "company" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}>Company Analytics</button>
          </div>

          {activeTab === "personal" && userPerformance && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 text-center border-l-4 border-blue-500">
                  <p className="text-gray-500">Completion Rate</p>
                  <p className="text-3xl font-bold text-blue-600">{userPerformance.completion_rate || 0}%</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 text-center border-l-4 border-green-500">
                  <p className="text-gray-500">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{userPerformance.completed_tasks || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 text-center border-l-4 border-yellow-500">
                  <p className="text-gray-500">In Progress</p>
                  <p className="text-3xl font-bold text-yellow-600">{userPerformance.in_progress_tasks || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 text-center border-l-4 border-gray-500">
                  <p className="text-gray-500">Total Tasks</p>
                  <p className="text-3xl font-bold text-gray-800">{userPerformance.total_tasks || 0}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Progress Overview</h3>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div className="bg-green-600 h-4 rounded-full" style={{ width: `${userPerformance.completion_rate || 0}%` }}></div>
                </div>
                <p className="text-center text-gray-600 mt-2">{userPerformance.completion_rate || 0}% Complete</p>
              </div>
            </div>
          )}

          {activeTab === "company" && companyAnalytics && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 text-center"><FiUsers className="text-blue-500 text-4xl mx-auto mb-2" /><p className="text-2xl font-bold">{companyAnalytics.total_users || 0}</p><p className="text-gray-500">Users</p></div>
                <div className="bg-white rounded-xl shadow-sm p-6 text-center"><FiBarChart2 className="text-green-500 text-4xl mx-auto mb-2" /><p className="text-2xl font-bold">{companyAnalytics.total_projects || 0}</p><p className="text-gray-500">Projects</p></div>
                <div className="bg-white rounded-xl shadow-sm p-6 text-center"><FiCheckCircle className="text-purple-500 text-4xl mx-auto mb-2" /><p className="text-2xl font-bold">{companyAnalytics.overall_completion_rate || 0}%</p><p className="text-gray-500">Completion</p></div>
                <div className="bg-white rounded-xl shadow-sm p-6 text-center"><FiClock className="text-red-500 text-4xl mx-auto mb-2" /><p className="text-2xl font-bold">{companyAnalytics.total_overdue_tasks || 0}</p><p className="text-gray-500">Overdue</p></div>
              </div>
              {topPerformers.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-4 text-white"><h2 className="text-xl font-bold flex items-center gap-2"><FiAward /> Top Performers</h2></div>
                  <table className="w-full"><thead className="bg-gray-50"><tr><th className="text-left py-3 px-4">Rank</th><th className="text-left py-3 px-4">Name</th><th className="text-left py-3 px-4">Completed</th><th className="text-left py-3 px-4">Rate</th></tr></thead>
                  <tbody>{topPerformers.map((p, i) => (<tr key={p.email} className="border-b"><td className="py-3 px-4">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i+1}`}</td><td className="py-3 px-4">{p.name}</td><td className="py-3 px-4">{p.completed_tasks || 0}</td><td className="py-3 px-4 text-green-600 font-semibold">{p.completion_rate || 0}%</td></tr>))}</tbody></table>
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