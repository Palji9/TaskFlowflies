import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2, Zap } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { toastError } from "../../utils/error.js";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const up = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ ...form, username: form.username.toLowerCase() });
      toast.success("Account created! Please verify your email.");
      navigate("/login");
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
  const labelCls = "block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1";

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="p-1.5 rounded-md bg-gradient-to-br from-blue-500 to-blue-600">
            <Zap className="size-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">TaskFlow</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Create an account</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">Start managing your projects</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Full name</label>
              <input autoFocus placeholder="Jane Doe" value={form.fullName} onChange={up("fullName")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Username</label>
              <input required placeholder="janedoe" value={form.username} onChange={up("username")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input required type="email" placeholder="you@example.com" value={form.email} onChange={up("email")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Password</label>
              <input required type="password" minLength={8} placeholder="Min. 8 characters" value={form.password} onChange={up("password")} className={inputCls} />
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50">
              {loading && <Loader2 className="size-4 animate-spin" />}
              Create account
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-zinc-400 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 hover:text-blue-400 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
