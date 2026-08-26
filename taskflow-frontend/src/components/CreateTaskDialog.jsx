import { useState } from "react";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { format } from "date-fns";
import { taskApi } from "../api/task.api.js";
import { normalizeTask } from "../utils/normalize.js";
import { addTask } from "../features/workspaceSlice";
import { toastError } from "../utils/error.js";
import toast from "react-hot-toast";

export default function CreateTaskDialog({ showCreateTask, setShowCreateTask, projectId }) {
    const dispatch = useDispatch();
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);
    const project = currentWorkspace?.projects.find((p) => p.id === projectId);
    const teamMembers = project?.members || [];

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ title: "", description: "", type: "TASK", status: "TODO", priority: "MEDIUM", assignee: "", due_date: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentWorkspace) return;
        setIsSubmitting(true);
        try {
            const fd = new FormData();
            fd.append("title", formData.title);
            fd.append("description", formData.description);
            fd.append("type", formData.type);
            fd.append("status", formData.status);
            fd.append("priority", formData.priority);
            if (formData.assignee) fd.append("assignee", formData.assignee);
            if (formData.due_date) fd.append("due_date", formData.due_date);

            const { data } = await taskApi.create(currentWorkspace.id, projectId, fd);
            const normalized = normalizeTask(data.data, projectId);
            dispatch(addTask(normalized));
            toast.success("Task created");
            setShowCreateTask(false);
            setFormData({ title: "", description: "", type: "TASK", status: "TODO", priority: "MEDIUM", assignee: "", due_date: "" });
        } catch (err) {
            toastError(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputCls = "w-full rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-zinc-900 dark:text-zinc-200 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500";

    return showCreateTask ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 dark:bg-black/60 backdrop-blur">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg shadow-lg w-full max-w-md p-6 text-zinc-900 dark:text-white">
                <h2 className="text-xl font-bold mb-4">Create New Task</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Title</label>
                        <input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Task title" className={inputCls} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the task" className={inputCls + " h-20"} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Type</label>
                            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className={inputCls}>
                                <option value="BUG">Bug</option>
                                <option value="FEATURE">Feature</option>
                                <option value="TASK">Task</option>
                                <option value="IMPROVEMENT">Improvement</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Priority</label>
                            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className={inputCls}>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Assignee</label>
                            <select value={formData.assignee} onChange={(e) => setFormData({ ...formData, assignee: e.target.value })} className={inputCls}>
                                <option value="">Unassigned</option>
                                {teamMembers.map((m) => (
                                    <option key={m.userId} value={m.userId}>{m.user?.name || m.user?.email}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputCls}>
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="DONE">Done</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Due Date</label>
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="size-5 text-zinc-500 dark:text-zinc-400" />
                            <input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} min={new Date().toISOString().split('T')[0]} className={inputCls} />
                        </div>
                        {formData.due_date && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{format(new Date(formData.due_date), "PPP")}</p>}
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setShowCreateTask(false)} className="rounded border border-zinc-300 dark:border-zinc-700 px-5 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="rounded px-5 py-2 text-sm bg-gradient-to-br from-blue-500 to-blue-600 hover:opacity-90 text-white flex items-center gap-2">
                            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                            {isSubmitting ? "Creating..." : "Create Task"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    ) : null;
}
