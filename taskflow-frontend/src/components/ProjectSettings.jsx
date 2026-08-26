import { format } from "date-fns";
import { Plus, Save, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import AddProjectMember from "./AddProjectMember";
import { projectApi } from "../api/project.api.js";
import { updateProject, removeProject } from "../features/workspaceSlice";
import { normalizeProject } from "../utils/normalize.js";
import { toastError } from "../utils/error.js";
import toast from "react-hot-toast";

export default function ProjectSettings({ project }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace);

    const [formData, setFormData] = useState({
        name: "", description: "", status: "PLANNING",
        priority: "MEDIUM", start_date: "", end_date: "", progress: 0,
    });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || "",
                description: project.description || "",
                status: project.status || "PLANNING",
                priority: project.priority || "MEDIUM",
                start_date: project.start_date ? format(new Date(project.start_date), "yyyy-MM-dd") : "",
                end_date: project.end_date ? format(new Date(project.end_date), "yyyy-MM-dd") : "",
                progress: project.progress || 0,
            });
        }
    }, [project]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentWorkspace) return;
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                progress: Number(formData.progress),
                start_date: formData.start_date || undefined,
                end_date: formData.end_date || undefined,
            };
            const { data } = await projectApi.update(currentWorkspace.id, project.id, payload);
            dispatch(updateProject(normalizeProject({ ...data.data, tasks: project.tasks, members: project.members })));
            toast.success("Project updated");
        } catch (err) {
            toastError(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!currentWorkspace) return;
        if (!window.confirm("Delete this project? This will remove all tasks and cannot be undone.")) return;
        setIsDeleting(true);
        try {
            await projectApi.remove(currentWorkspace.id, project.id);
            dispatch(removeProject(project.id));
            toast.success("Project deleted");
            navigate("/projects");
        } catch (err) {
            toastError(err);
            setIsDeleting(false);
        }
    };

    const inputCls = "w-full px-3 py-2 rounded mt-2 border text-sm dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-300";
    const cardCls = "rounded-lg border p-6 not-dark:bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border-zinc-300 dark:border-zinc-800";
    const labelCls = "text-sm text-zinc-600 dark:text-zinc-400";

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            <div className={cardCls}>
                <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-300 mb-4">Project Details</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className={labelCls}>Project Name</label>
                        <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputCls} /></div>
                    <div><label className={labelCls}>Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={inputCls + " h-24"} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelCls}>Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputCls}>
                                <option value="PLANNING">Planning</option>
                                <option value="ACTIVE">Active</option>
                                <option value="ON_HOLD">On Hold</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select></div>
                        <div><label className={labelCls}>Priority</label>
                            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className={inputCls}>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelCls}>Start Date</label>
                            <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className={inputCls} /></div>
                        <div><label className={labelCls}>End Date</label>
                            <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className={inputCls} /></div>
                    </div>
                    <div><label className={labelCls}>Progress: {formData.progress}%</label>
                        <input type="range" min="0" max="100" step="5" value={formData.progress}
                            onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                            className="w-full accent-blue-500 dark:accent-blue-400 mt-2" /></div>
                    <div className="flex justify-between items-center pt-2 flex-wrap gap-3">
                        <button type="button" onClick={handleDelete} disabled={isDeleting}
                            className="flex items-center gap-2 text-sm text-red-500 border border-red-300 dark:border-red-800 px-4 py-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                            {isDeleting ? <Loader2 className="size-4 animate-spin" /> : null}
                            {isDeleting ? "Deleting..." : "Delete Project"}
                        </button>
                        <button type="submit" disabled={isSubmitting}
                            className="flex items-center gap-2 text-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-2 rounded">
                            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>

            <div className="space-y-6">
                <div className={cardCls}>
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-300">
                            Team Members <span className="text-sm text-zinc-600 dark:text-zinc-400">({project.members?.length || 0})</span>
                        </h2>
                        <button type="button" onClick={() => setIsDialogOpen(true)}
                            className="p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            <Plus className="size-4 text-zinc-900 dark:text-zinc-300" />
                        </button>
                        <AddProjectMember isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
                    </div>
                    {(project.members?.length || 0) > 0 && (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {project.members.map((member, index) => (
                                <div key={index} className="flex items-center gap-3 px-3 py-2 rounded dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-300">
                                    <div className="size-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                                        {member.user?.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="flex-1 truncate">{member.user?.name || member.user?.email || "Unknown"}</span>
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">{member.role}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
