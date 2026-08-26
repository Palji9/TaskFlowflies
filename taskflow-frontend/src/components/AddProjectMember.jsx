import { useState } from "react";
import { Mail, UserPlus, Loader2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { projectApi } from "../api/project.api.js";
import { fetchWorkspaceById } from "../features/workspaceSlice";
import { toastError } from "../utils/error.js";
import toast from "react-hot-toast";

const AddProjectMember = ({ isDialogOpen, setIsDialogOpen }) => {
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    const dispatch = useDispatch();
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);
    const project = currentWorkspace?.projects.find((p) => p.id === id);
    const projectMemberEmails = project?.members.map((m) => m.user?.email) || [];

    const [email, setEmail] = useState('');
    const [role, setRole] = useState('member');
    const [isAdding, setIsAdding] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentWorkspace || !id) return;
        setIsAdding(true);
        try {
            await projectApi.addMember(currentWorkspace.id, id, { email, role });
            toast.success("Member added to project");
            dispatch(fetchWorkspaceById(currentWorkspace.id));
            setIsDialogOpen(false);
            setEmail('');
        } catch (err) {
            toastError(err);
        } finally {
            setIsAdding(false);
        }
    };

    if (!isDialogOpen) return null;

    // Only show workspace members who aren't already in the project
    const available = (currentWorkspace?.members || []).filter(
        (m) => !projectMemberEmails.includes(m.user?.email)
    );

    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md text-zinc-900 dark:text-zinc-200">
                <div className="mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <UserPlus className="size-5" /> Add Member to Project
                    </h2>
                    {project && <p className="text-sm text-zinc-700 dark:text-zinc-400">Adding to: <span className="text-blue-600 dark:text-blue-400">{project.name}</span></p>}
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Workspace Member</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                            <select required value={email} onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 mt-1 w-full rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 text-sm py-2 focus:outline-none focus:border-blue-500">
                                <option value="">Select a member</option>
                                {available.map((m) => (
                                    <option key={m.userId || m.user?._id} value={m.user?.email}>
                                        {m.user?.name || m.user?.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Role</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)}
                            className="w-full rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 py-2 px-3 mt-1 focus:outline-none focus:border-blue-500 text-sm">
                            <option value="member">Member</option>
                            <option value="project_admin">Project Admin</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsDialogOpen(false)}
                            className="px-5 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={isAdding || !available.length}
                            className="px-5 py-2 text-sm rounded bg-gradient-to-br from-blue-500 to-blue-600 hover:opacity-90 text-white disabled:opacity-50 flex items-center gap-2">
                            {isAdding && <Loader2 className="size-4 animate-spin" />}
                            {isAdding ? "Adding..." : "Add Member"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProjectMember;
