import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2, Zap, MailCheck, CheckCircle2, XCircle } from "lucide-react";
import { authApi } from "../../api/auth.api.js";
import { toastError } from "../../utils/error.js";

const inputCls = "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
const btnCls = "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50";

const AuthCard = ({ title, subtitle, children }) => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 px-4">
    <div className="w-full max-w-sm">
      <div className="flex items-center gap-2 mb-8 justify-center">
        <div className="p-1.5 rounded-md bg-gradient-to-br from-blue-500 to-blue-600">
          <Zap className="size-5 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900 dark:text-white">TaskFlow</span>
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">{subtitle}</p>}
        {children}
      </div>
    </div>
  </div>
);

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  if (sent) return (
    <AuthCard title="Check your inbox">
      <div className="flex flex-col items-center text-center gap-4 py-4">
        <MailCheck className="size-10 text-blue-500" />
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          If an account exists for <strong className="text-gray-900 dark:text-white">{email}</strong>, a reset link is on its way.
        </p>
        <Link to="/login" className="text-blue-500 hover:text-blue-400 text-sm">Back to login</Link>
      </div>
    </AuthCard>
  );

  return (
    <AuthCard title="Forgot password?" subtitle="Enter your email and we'll send a reset link.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Email</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" autoFocus className={inputCls} />
        </div>
        <button type="submit" disabled={loading} className={btnCls}>
          {loading && <Loader2 className="size-4 animate-spin" />} Send reset link
        </button>
      </form>
      <p className="text-center mt-4">
        <Link to="/login" className="text-sm text-blue-500 hover:text-blue-400">Back to login</Link>
      </p>
    </AuthCard>
  );
}

export function ResetPasswordPage() {
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.resetPassword(resetToken, pwd);
      toast.success("Password reset! Please log in.");
      navigate("/login");
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Set new password" subtitle="Choose a secure password.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">New password</label>
          <input required type="password" minLength={8} value={pwd} onChange={(e) => setPwd(e.target.value)}
            placeholder="Min. 8 characters" autoFocus className={inputCls} />
        </div>
        <button type="submit" disabled={loading} className={btnCls}>
          {loading && <Loader2 className="size-4 animate-spin" />} Reset password
        </button>
      </form>
    </AuthCard>
  );
}

export function VerifyEmailPage() {
  const { verificationToken } = useParams();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    authApi.verifyEmail(verificationToken)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [verificationToken]);

  return (
    <AuthCard title="Email verification">
      <div className="flex flex-col items-center text-center gap-4 py-6">
        {status === "loading" && <><Loader2 className="size-10 text-blue-500 animate-spin" /><p className="text-sm text-gray-500 dark:text-zinc-400">Verifying…</p></>}
        {status === "success" && <><CheckCircle2 className="size-10 text-emerald-500" /><p className="text-sm text-gray-500 dark:text-zinc-400">Email verified! You're all set.</p><Link to="/login" className="py-2 px-5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm">Continue to login</Link></>}
        {status === "error" && <><XCircle className="size-10 text-red-500" /><p className="text-sm text-gray-500 dark:text-zinc-400">This link is invalid or has expired.</p><Link to="/login" className="text-blue-500 hover:text-blue-400 text-sm">Back to login</Link></>}
      </div>
    </AuthCard>
  );
}
