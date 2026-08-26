import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Plus, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWorkspaceById, addWorkspace } from "../features/workspaceSlice";
import { useNavigate } from "react-router-dom";
import { workspaceApi } from "../api/workspace.api.js";
import { normalizeWorkspace } from "../utils/normalize.js";
import { toastError } from "../utils/error.js";
import toast from "react-hot-toast";

function WorkspaceDropdown() {
    const { workspaces, currentWorkspace } = useSelector((state) => state.workspace);
    const [isOpen, setIsOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState("");
    const dropdownRef = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onSelect = (id) => {
        dispatch(fetchWorkspaceById(id));
        setIsOpen(false);
        navigate('/');
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setCreating(true);
        try {
            const { data } = await workspaceApi.create({ name: newName.trim() });
            // Fetch full workspace after creation
            const full = await workspaceApi.getById(data.data._id || data.data.id);
            dispatch(addWorkspace(normalizeWorkspace(full.data.data)));
            setNewName("");
            setShowCreate(false);
            setIsOpen(false);
            toast.success("Workspace created");
            navigate('/');
        } catch (err) {
            toastError(err);
        } finally {
            setCreating(false);
        }
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setShowCreate(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative m-4" ref={dropdownRef}>
            <button onClick={() => setIsOpen(prev => !prev)} className="w-full flex items-center justify-between p-3 h-auto text-left rounded hover:bg-gray-100 dark:hover:bg-zinc-800">
                <div className="flex items-center gap-3">
                    <img src={currentWorkspace?.image_url || "https://placehold.co/32x32?text=WS"} alt={currentWorkspace?.name} className="w-8 h-8 rounded shadow object-cover" />
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">{currentWorkspace?.name || "Select Workspace"}</p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">{workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}</p>
                    </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-zinc-400 flex-shrink-0" />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-64 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded shadow-lg top-full left-0">
                    <div className="p-2">
                        <p className="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2 px-2">Workspaces</p>
                        {workspaces.map((ws) => (
                            <div key={ws.id} onClick={() => onSelect(ws.id)} className="flex items-center gap-3 p-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800">
                                <img src={ws.image_url || "https://placehold.co/24x24?text=WS"} alt={ws.name} className="w-6 h-6 rounded object-cover" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{ws.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-zinc-400">{ws.members?.length || 0} members</p>
                                </div>
                                {currentWorkspace?.id === ws.id && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />}
                            </div>
                        ))}
                    </div>
                    <hr className="border-gray-200 dark:border-zinc-700" />
                    <div className="p-2">
                        {showCreate ? (
                            <form onSubmit={handleCreate} className="flex gap-2">
                                <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Workspace name" className="flex-1 text-xs px-2 py-1.5 rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
                                <button type="submit" disabled={creating} className="px-2 py-1.5 rounded bg-blue-500 text-white text-xs">
                                    {creating ? <Loader2 className="size-3 animate-spin" /> : "Create"}
                                </button>
                            </form>
                        ) : (
                            <button onClick={() => setShowCreate(true)} className="flex items-center text-xs gap-2 my-1 w-full text-blue-600 dark:text-blue-400 hover:text-blue-500 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800">
                                <Plus className="w-4 h-4" /> Create Workspace
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default WorkspaceDropdown;
