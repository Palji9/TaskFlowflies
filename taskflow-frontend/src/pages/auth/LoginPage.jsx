import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2, Zap } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { toastError } from "../../utils/error.js";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const isEmail = form.identifier.includes("@");
      await login({ [isEmail ? "email" : "username"]: form.identifier, password: form.password });
      toast.success("Welcome back!");
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="p-1.5 rounded-md bg-gradient-to-br from-blue-500 to-blue-600">
            <Zap className="size-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">TaskFlow</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Email or username
              </label>
              <input
                required autoFocus
                value={form.identifier}
                onChange={(e) => setForm((f) => ({ ...f, identifier: e.target.value }))}
                placeholder="you@example.com"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-blue-500 hover:text-blue-400">Forgot password?</Link>
              </div>
              <input
                required type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              Sign in
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-zinc-400 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-500 hover:text-blue-400 font-medium">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
