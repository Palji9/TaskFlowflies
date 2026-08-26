import { useState } from "react";
import { XIcon, Loader2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { projectApi } from "../api/project.api.js";
import { normalizeProject } from "../utils/normalize.js";
import { addProject } from "../features/workspaceSlice";
import { toastError } from "../utils/error.js";
import toast from "react-hot-toast";

const CreateProjectDialog = ({ isDialogOpen, setIsDialogOpen }) => {
    const { currentWorkspace } = useSelector((state) => state.workspace);
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({ name: "", description: "", status: "PLANNING", priority: "MEDIUM", start_date: "", end_date: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentWorkspace) return;
        setIsSubmitting(true);
        try {
            const payload = { ...formData, start_date: formData.start_date || undefined, end_date: formData.end_date || undefined };
            const { data } = await projectApi.create(currentWorkspace.id, payload);
            dispatch(addProject(normalizeProject({ ...data.data, tasks: [], members: [] })));
            toast.success("Project created");
            setIsDialogOpen(false);
            setFormData({ name: "", description: "", status: "PLANNING", priority: "MEDIUM", start_date: "", end_date: "" });
        } catch (err) {
            toastError(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isDialogOpen) return null;

    const inputCls = "w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 mt-1 text-zinc-900 dark:text-zinc-200 text-sm";

    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur flex items-center justify-center text-left z-50">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-lg text-zinc-900 dark:text-zinc-200 relative">
                <button className="absolute top-3 right-3 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200" onClick={() => setIsDialogOpen(false)}>
                    <XIcon className="size-5" />
                </button>
                <h2 className="text-xl font-medium mb-1">Create New Project</h2>
                {currentWorkspace && <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">In workspace: <span className="text-blue-600 dark:text-blue-400">{currentWorkspace.name}</span></p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1">Project Name</label>
                        <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter project name" className={inputCls} />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe your project" className={inputCls + " h-20"} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-1">Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputCls}>
                                <option value="PLANNING">Planning</option>
                                <option value="ACTIVE">Active</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="ON_HOLD">On Hold</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Priority</label>
                            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className={inputCls}>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-1">Start Date</label>
                            <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">End Date</label>
                            <input type="date" value={formData.end_date} min={formData.start_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className={inputCls} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2 text-sm">
                        <button type="button" onClick={() => setIsDialogOpen(false)} className="px-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800">Cancel</button>
                        <button disabled={isSubmitting || !currentWorkspace} className="px-4 py-2 rounded bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center gap-2">
                            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                            {isSubmitting ? "Creating..." : "Create Project"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectDialog;
