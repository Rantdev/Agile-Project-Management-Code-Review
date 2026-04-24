import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Layout/Sidebar";
import api from "../services/api";
import toast from "react-hot-toast";
import { 
  FiTrendingUp, FiCheckCircle, FiClock, FiUsers, 
  FiBarChart2, FiAward, FiCalendar, FiActivity,
  FiTarget, FiStar, FiZap
} from "react-icons/fi";

const Performance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userPerformance, setUserPerformance] = useState(null);
  const [companyAnalytics, setCompanyAnalytics] = useState(null);
  const [topPerformers, setTopPerformers] = useState([]);
  const [weeklyTrend, setWeeklyTrend] = useState([]);
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    if (user) {
      fetchPerformanceData();
    }
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
      setWeeklyTrend(companyRes.data.analytics.weeklyTrend || []);
      
    } catch (error) {
      console.error("Failed to fetch performance data:", error);
      toast.error("Failed to load performance data");
    } finally {
      setLoading(false);
    }
  };

  const getCompletionRateColor = (rate) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getCompletionRateBg = (rate) => {
    if (rate >= 80) return "bg-green-600";
    if (rate >= 50) return "bg-yellow-600";
    return "bg-red-600";
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64 flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading performance data...</p>
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
            <button
              onClick={() => setActiveTab("leaders")}
              className={`px-4 py-2 font-semibold transition flex items-center gap-2 ${
                activeTab === "leaders"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FiAward /> Top Performers
            </button>
          </div>

          {/* Personal Performance Tab */}
          {activeTab === "personal" && userPerformance && (
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                <h2 className="text-2xl font-bold">Hello, {userPerformance.name}!</h2>
                <p className="mt-2 opacity-90">Here's your performance summary</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 hover:shadow-md transition">
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

                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Completed Tasks</p>
                      <p className="text-3xl font-bold text-green-600">
                        {userPerformance.completed_tasks || 0}
                      </p>
                      <p className="text-xs text-gray-400">of {userPerformance.total_tasks || 0} total</p>
                    </div>
                    <FiCheckCircle className="text-green-500 text-4xl" />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500 hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">In Progress</p>
                      <p className="text-3xl font-bold text-yellow-600">
                        {userPerformance.in_progress_tasks || 0}
                      </p>
                    </div>
                    <FiZap className="text-yellow-500 text-4xl" />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500 hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Overdue Tasks</p>
                      <p className="text-3xl font-bold text-red-600">
                        {userPerformance.overdue_tasks || 0}
                      </p>
                    </div>
                    <FiClock className="text-red-500 text-4xl" />
                  </div>
                </div>
              </div>

              {/* Detailed Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Breakdown</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span className="font-semibold">{userPerformance.completion_rate || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`${getCompletionRateBg(userPerformance.completion_rate)} h-3 rounded-full transition-all duration-500`} 
                          style={{ width: `${userPerformance.completion_rate || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{userPerformance.completed_tasks || 0}</p>
                        <p className="text-xs text-gray-600">Completed</p>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">{userPerformance.in_progress_tasks || 0}</p>
                        <p className="text-xs text-gray-600">In Progress</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-600">{userPerformance.pending_tasks || 0}</p>
                        <p className="text-xs text-gray-600">Pending</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{userPerformance.overdue_tasks || 0}</p>
                        <p className="text-xs text-gray-600">Overdue</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Productivity Insights</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-gray-600">Avg. Completion Time</span>
                      <span className="font-semibold text-lg">
                        {userPerformance.avg_task_completion_days 
                          ? `${userPerformance.avg_task_completion_days} days` 
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-gray-600">Projects Involved</span>
                      <span className="font-semibold text-lg">{userPerformance.total_projects_involved || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-gray-600">Stories Contributed</span>
                      <span className="font-semibold text-lg">{userPerformance.total_stories_contributed || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-gray-600">Total Tasks Assigned</span>
                      <span className="font-semibold text-lg">{userPerformance.total_tasks || 0}</span>
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
                <div className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiUsers className="text-blue-600 text-xl" />
                  </div>
                  <p className="text-gray-500 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-gray-800">{companyAnalytics.total_users || 0}</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiBarChart2 className="text-green-600 text-xl" />
                  </div>
                  <p className="text-gray-500 text-sm">Total Projects</p>
                  <p className="text-3xl font-bold text-gray-800">{companyAnalytics.total_projects || 0}</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition">
                  <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiCheckCircle className="text-purple-600 text-xl" />
                  </div>
                  <p className="text-gray-500 text-sm">Completion Rate</p>
                  <p className={`text-3xl font-bold ${getCompletionRateColor(companyAnalytics.overall_completion_rate)}`}>
                    {companyAnalytics.overall_completion_rate || 0}%
                  </p>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition">
                  <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiClock className="text-red-600 text-xl" />
                  </div>
                  <p className="text-gray-500 text-sm">Overdue Tasks</p>
                  <p className="text-3xl font-bold text-red-600">{companyAnalytics.total_overdue_tasks || 0}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Company Overview</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Total Stories</span>
                      <span className="font-semibold">{companyAnalytics.total_stories || 0}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Total Tasks</span>
                      <span className="font-semibold">{companyAnalytics.total_tasks || 0}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Completed Tasks</span>
                      <span className="font-semibold text-green-600">{companyAnalytics.completed_tasks || 0}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Avg Tasks/User</span>
                      <span className="font-semibold">{companyAnalytics.avg_tasks_per_user || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Trend</h3>
                  {weeklyTrend.length > 0 ? (
                    <div className="space-y-3">
                      {weeklyTrend.map((week, idx) => (
                        <div key={idx} className="border-b pb-3">
                          <p className="text-sm text-gray-500 mb-2">Week {week.week}, {week.year}</p>
                          <div className="flex justify-between text-sm">
                            <span>Created: {week.tasks_created}</span>
                            <span>Completed: {week.tasks_completed}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${(week.tasks_completed / week.tasks_created) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">No weekly data available</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Top Performers Tab */}
          {activeTab === "leaders" && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <FiStar /> Top Performers Leaderboard
                </h2>
                <p className="mt-1 opacity-90">Based on task completion rate and productivity</p>
              </div>
              
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600">Rank</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600">Name</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600">Email</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600">Completion Rate</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600">Completed Tasks</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600">Projects</th>
                  </tr>
                </thead>
                <tbody>
                  {topPerformers.map((performer, index) => (
                    <tr key={performer.email} className="border-b hover:bg-gray-50 transition">
                      <td className="py-4 px-6">
                        {index === 0 ? (
                          <span className="text-2xl">🥇</span>
                        ) : index === 1 ? (
                          <span className="text-2xl">🥈</span>
                        ) : index === 2 ? (
                          <span className="text-2xl">🥉</span>
                        ) : (
                          <span className="text-gray-500 font-semibold">#{index + 1}</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-gray-800">{performer.name}</span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{performer.email}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`${getCompletionRateBg(performer.completion_rate)} h-2 rounded-full`}
                              style={{ width: `${performer.completion_rate || 0}%` }}
                            ></div>
                          </div>
                          <span className={`font-semibold ${getCompletionRateColor(performer.completion_rate)}`}>
                            {performer.completion_rate || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-green-600">{performer.completed_tasks || 0}</span>
                        <span className="text-gray-400 text-sm"> / {performer.total_tasks || 0}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                          {performer.projects_worked_on || 0} projects
                        </span>
                      </td>
                    </tr>
                  ))}
                  {topPerformers.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-gray-500">
                        <FiAward className="text-6xl mx-auto mb-4 text-gray-300" />
                        No performance data available yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Performance;