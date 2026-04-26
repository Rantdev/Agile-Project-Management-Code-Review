import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/Layout/Sidebar";
import api from "../services/api";
import toast from "react-hot-toast";
import { FiPlus, FiArrowLeft, FiTrash2, FiUsers } from "react-icons/fi";

const Team = () => {
  const { id } = useParams();
  const [members, setMembers] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ user_email: "", role: "Member" });

  const fetchData = async () => {
    try {
      const [projectRes, membersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/team/project/${id}`)
      ]);
      setProject(projectRes.data.project);
      setMembers(membersRes.data.members || []);
    } catch (error) {
      toast.error("Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.user_email.trim()) {
      toast.error("Please enter an email");
      return;
    }
    try {
      await api.post("/team", { project_id: id, user_email: form.user_email, role: form.role });
      toast.success("Member added");
      setShowModal(false);
      setForm({ user_email: "", role: "Member" });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to add member");
    }
  };

  const handleDelete = async (memberId) => {
    if (window.confirm("Remove this member?")) {
      try {
        await api.delete(`/team/${memberId}`);
        toast.success("Member removed");
        fetchData();
      } catch (error) {
        toast.error("Failed to remove member");
      }
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
          <Link to={`/projects/${id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
            <FiArrowLeft /> Back to Project
          </Link>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Team Members</h1>
              <p className="text-gray-500">Managing team for: {project?.title}</p>
            </div>
            <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
              <FiPlus /> Add Member
            </button>
          </div>

          {members.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <FiUsers className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No team members yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              得到
                <thead className="bg-gray-50 border-b">
                  <tr><th className="text-left py-4 px-6">Email</th><th className="text-left py-4 px-6">Role</th><th className="text-left py-4 px-6">Joined</th><th className="text-left py-4 px-6">Actions</th></tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-6">{member.user_email}</td>
                      <td className="py-4 px-6"><span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">{member.role}</span></td>
                      <td className="py-4 px-6">{new Date(member.joined_at).toLocaleDateString()}</td>
                      <td className="py-4 px-6"><button onClick={() => handleDelete(member.id)} className="text-red-500 hover:text-red-700"><FiTrash2 /></button></td>
                    </tr>
                  ))}
                </tbody>
              </div>
            
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Add Team Member</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="email" placeholder="Email Address *" value={form.user_email} onChange={(e) => setForm({ ...form, user_email: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                <option>Member</option><option>Developer</option><option>Designer</option><option>Tester</option>
              </select>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;