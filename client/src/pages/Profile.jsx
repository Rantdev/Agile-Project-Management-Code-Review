import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Layout/Sidebar";
import api from "../services/api";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave, FiX, FiCode, FiPlus, FiTrash2 } from "react-icons/fi";

const Profile = () => {
  const { userId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [newSkill, setNewSkill] = useState("");

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    if (targetUserId) fetchProfile();
  }, [targetUserId, user]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/profile/${targetUserId}`);
      if (res.data.success) {
        setProfile(res.data.profile);
        setForm({ ...res.data.profile, skills: res.data.profile.skills || [] });
      }
    } catch (error) {
      if (error.response?.status === 401) logout();
      else toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/profile/${targetUserId}`, {
        name: form.name,
        phone: form.phone,
        location: form.location,
        skills: form.skills || []
      });
      toast.success("Profile updated");
      setEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setForm({ ...form, skills: [...(form.skills || []), { name: newSkill.trim(), level: "Intermediate" }] });
      setNewSkill("");
    }
  };

  const removeSkill = (index) => {
    const updatedSkills = form.skills.filter((_, i) => i !== index);
    setForm({ ...form, skills: updatedSkills });
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

  if (!profile) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="text-center py-12">Profile not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
            <div className="px-8 pb-8 relative">
              <div className="flex justify-between items-start">
                <div className="flex items-end -mt-12">
                  <div className="w-24 h-24 bg-gray-200 rounded-full border-4 border-white flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white text-3xl font-bold">
                    {profile.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4">
                    {editing ? (
                      <input type="text" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border rounded px-2 py-1 text-xl" />
                    ) : (
                      <h1 className="text-2xl font-bold text-gray-800">{profile.name}</h1>
                    )}
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 bg-blue-100 text-blue-800">
                      {profile.role || "Team Member"}
                    </span>
                  </div>
                </div>
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg"><FiEdit2 /> Edit</button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(false); setForm(profile); }} className="px-4 py-2 border rounded-lg"><FiX /> Cancel</button>
                    <button onClick={handleUpdate} className="px-4 py-2 bg-green-600 text-white rounded-lg"><FiSave /> Save</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3"><FiMail /><span>{profile.email}</span></div>
                {editing ? (
                  <div className="flex items-center gap-3"><FiPhone /><input type="tel" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="flex-1 px-3 py-2 border rounded" /></div>
                ) : profile.phone && (<div className="flex items-center gap-3"><FiPhone /><span>{profile.phone}</span></div>)}
                {editing ? (
                  <div className="flex items-center gap-3"><FiMapPin /><input type="text" value={form.location || ""} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className="flex-1 px-3 py-2 border rounded" /></div>
                ) : profile.location && (<div className="flex items-center gap-3"><FiMapPin /><span>{profile.location}</span></div>)}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiCode /> Skills</h2>
              {editing && (
                <div className="mb-4 flex gap-2">
                  <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="New skill" className="flex-1 px-3 py-2 border rounded" />
                  <button onClick={addSkill} className="px-3 py-2 bg-blue-600 text-white rounded"><FiPlus /></button>
                </div>
              )}
              {form.skills?.length > 0 ? (
                <div className="space-y-2">
                  {form.skills.map((skill, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{skill.name} <span className="text-xs text-gray-500">({skill.level})</span></span>
                      {editing && <button onClick={() => removeSkill(idx)} className="text-red-500"><FiTrash2 /></button>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No skills added</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;