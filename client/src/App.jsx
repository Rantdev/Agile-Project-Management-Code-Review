import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ProtectedRoute from "./components/Layout/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import RoleSetup from "./pages/RoleSetup";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import StoryTasks from "./pages/StoryTasks";
import MyTasks from "./pages/MyTasks";
import Team from "./pages/Team";
import Profile from "./pages/Profile";

const GOOGLE_CLIENT_ID = "106987871275-ait10kap6dlq0coeos96r3q2g62i53fs.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/role-setup" element={<ProtectedRoute><RoleSetup /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
          <Route path="/stories/:id" element={<ProtectedRoute><StoryTasks /></ProtectedRoute>} />
          <Route path="/my-tasks" element={<ProtectedRoute><MyTasks /></ProtectedRoute>} />
          <Route path="/team/:id" element={<ProtectedRoute><Team /></ProtectedRoute>} />
          <Route path="/profile/:userId?" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;