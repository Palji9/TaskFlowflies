import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./pages/Layout";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import ProjectDetails from "./pages/ProjectDetails";
import TaskDetails from "./pages/TaskDetails";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import { ForgotPasswordPage, ResetPasswordPage, VerifyEmailPage } from "./pages/auth/AuthPages";
import { useAuth } from "./context/AuthContext.jsx";
import { Loader2Icon } from "lucide-react";

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) return (
        <div className="flex items-center justify-center h-screen bg-white dark:bg-zinc-950">
            <Loader2Icon className="size-7 text-blue-500 animate-spin" />
        </div>
    );
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) return null;
    return isAuthenticated ? <Navigate to="/" replace /> : children;
};

const App = () => {
    return (
        <>
            <Toaster position="top-right" toastOptions={{
                style: { background: '#18181b', color: '#f4f4f5', border: '1px solid #27272a', fontSize: '14px' },
                success: { iconTheme: { primary: '#3b82f6', secondary: '#fff' } },
            }} />
            <Routes>
                {/* Public auth routes */}
                <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:resetToken" element={<ResetPasswordPage />} />
                <Route path="/verify-email/:verificationToken" element={<VerifyEmailPage />} />

                {/* Protected app routes */}
                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="team" element={<Team />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="projectsDetail" element={<ProjectDetails />} />
                    <Route path="taskDetails" element={<TaskDetails />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
};

export default App;
