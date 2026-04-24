import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/Layout/Sidebar";
import api from "../services/api";
import toast from "react-hot-toast";
import { FiPlus, FiArrowLeft, FiTrash2 } from "react-icons/fi";

const Team = () => {
  const { id } = useParams();
  const [members, setMembers] = useState([]);
  const [project, setProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ user_email: "", role: "Member" });

  const fetchData = async () => {
    try {
      const [projectRes, membersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/team/project/${id}`),
      ]);
      setProject(projectRes.data.project);
      setMembers(membersRes.data.members || []);
    } catch (error) {
      toast.error("Failed to load team data");
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/team", { ...form, project_id: id });
      toast.success("Team member added successfully");
      setShowModal(false);
      setForm({ user_email: "", role: "Member" });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to add member");
    }
  };

  const handleDelete = async (memberId) => {
    if (window.confirm("Remove this member from the team?")) {
      try {
        await api.delete(`/team/${memberId}`);
        toast.success("Member removed");
        fetchData();
      } catch (error) {
        toast.error("Failed to remove member");
      }
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              to={`/projects/${id}`}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
            >
              <FiArrowLeft /> Back to Project
            </Link>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Team Members</h1>
                <p className="text-gray-500 mt-1">
                  Managing team for: <span className="font-semibold">{project?.title}</span>
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <FiPlus /> Add Member
              </button>
            </div>
          </div>

          {/* Team Members List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600">Email</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600">Role</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600">Joined</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-gray-500">
                      No team members yet. Add your first member to get started.
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-6">{member.user_email}</td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          {member.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-500">
                        {new Date(member.joined_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Add Team Member</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiPlus className="rotate-45" size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={form.user_email}
                  onChange={(e) => setForm({ ...form, user_email: e.target.value })}
                  className="input-field"
                  placeholder="colleague@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="input-field"
                >
                  <option>Member</option>
                  <option>Developer</option>
                  <option>Designer</option>
                  <option>Product Owner</option>
                  <option>Scrum Master</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;