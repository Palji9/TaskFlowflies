import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { workspaceApi } from "../api/workspace.api.js";
import { normalizeWorkspace } from "../utils/normalize.js";

// ── Thunks ─────────────────────────────────────────────────────────────
export const fetchWorkspaces = createAsyncThunk("workspace/fetchAll", async () => {
  const { data } = await workspaceApi.list();
  return data.data.map(normalizeWorkspace);
});

export const fetchWorkspaceById = createAsyncThunk("workspace/fetchById", async (id) => {
  const { data } = await workspaceApi.getById(id);
  return normalizeWorkspace(data.data);
});

// ── Initial state ───────────────────────────────────────────────────────
const STORAGE_KEY = "currentWorkspaceId";

const initialState = {
  workspaces: [],
  currentWorkspace: null,
  loading: true,
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setWorkspaces: (state, action) => { state.workspaces = action.payload; },
    setCurrentWorkspace: (state, action) => {
      const id = action.payload;
      localStorage.setItem(STORAGE_KEY, id);
      state.currentWorkspace = state.workspaces.find((w) => w.id === id) || state.currentWorkspace;
    },
    setCurrentWorkspaceFull: (state, action) => {
      state.currentWorkspace = action.payload;
    },
    addWorkspace: (state, action) => {
      state.workspaces.push(action.payload);
      state.currentWorkspace = action.payload;
      localStorage.setItem(STORAGE_KEY, action.payload.id);
    },
    updateWorkspace: (state, action) => {
      state.workspaces = state.workspaces.map((w) => w.id === action.payload.id ? action.payload : w);
      if (state.currentWorkspace?.id === action.payload.id) state.currentWorkspace = action.payload;
    },
    deleteWorkspace: (state, action) => {
      state.workspaces = state.workspaces.filter((w) => w.id !== action.payload);
      if (state.currentWorkspace?.id === action.payload) {
        state.currentWorkspace = state.workspaces[0] || null;
      }
    },
    addProject: (state, action) => {
      if (!state.currentWorkspace) return;
      state.currentWorkspace.projects = [...(state.currentWorkspace.projects || []), action.payload];
      state.workspaces = state.workspaces.map((w) =>
        w.id === state.currentWorkspace.id
          ? { ...w, projects: [...(w.projects || []), action.payload] }
          : w
      );
    },
    updateProject: (state, action) => {
      if (!state.currentWorkspace) return;
      state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) =>
        p.id === action.payload.id ? action.payload : p
      );
      state.workspaces = state.workspaces.map((w) =>
        w.id === state.currentWorkspace.id
          ? { ...w, projects: w.projects.map((p) => p.id === action.payload.id ? action.payload : p) }
          : w
      );
    },
    removeProject: (state, action) => {
      if (!state.currentWorkspace) return;
      state.currentWorkspace.projects = state.currentWorkspace.projects.filter((p) => p.id !== action.payload);
      state.workspaces = state.workspaces.map((w) =>
        w.id === state.currentWorkspace.id
          ? { ...w, projects: w.projects.filter((p) => p.id !== action.payload) }
          : w
      );
    },
    addTask: (state, action) => {
      if (!state.currentWorkspace) return;
      state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) => {
        if (p.id === action.payload.projectId) {
          return { ...p, tasks: [...(p.tasks || []), action.payload] };
        }
        return p;
      });
      state.workspaces = state.workspaces.map((w) =>
        w.id === state.currentWorkspace.id
          ? {
              ...w, projects: w.projects.map((p) =>
                p.id === action.payload.projectId
                  ? { ...p, tasks: [...(p.tasks || []), action.payload] }
                  : p
              ),
            }
          : w
      );
    },
    updateTask: (state, action) => {
      if (!state.currentWorkspace) return;
      state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) => ({
        ...p,
        tasks: (p.tasks || []).map((t) => t.id === action.payload.id ? action.payload : t),
      }));
      state.workspaces = state.workspaces.map((w) =>
        w.id === state.currentWorkspace.id
          ? {
              ...w, projects: w.projects.map((p) => ({
                ...p, tasks: (p.tasks || []).map((t) => t.id === action.payload.id ? action.payload : t),
              })),
            }
          : w
      );
    },
    deleteTask: (state, action) => {
      // action.payload = array of task ids
      if (!state.currentWorkspace) return;
      state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) => ({
        ...p, tasks: (p.tasks || []).filter((t) => !action.payload.includes(t.id)),
      }));
      state.workspaces = state.workspaces.map((w) =>
        w.id === state.currentWorkspace.id
          ? {
              ...w, projects: w.projects.map((p) => ({
                ...p, tasks: (p.tasks || []).filter((t) => !action.payload.includes(t.id)),
              })),
            }
          : w
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaces.pending, (state) => { state.loading = true; })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.workspaces = action.payload;
        state.loading = false;
        // Restore last used workspace or default to first
        const savedId = localStorage.getItem(STORAGE_KEY);
        const found = savedId ? action.payload.find((w) => w.id === savedId) : null;
        // We'll load the full workspace separately — just set the stub here
        if (!state.currentWorkspace) {
          state.currentWorkspace = found || action.payload[0] || null;
        }
      })
      .addCase(fetchWorkspaces.rejected, (state) => { state.loading = false; })
      .addCase(fetchWorkspaceById.pending, (state) => { state.loading = true; })
      .addCase(fetchWorkspaceById.fulfilled, (state, action) => {
        state.currentWorkspace = action.payload;
        state.loading = false;
        // Update the stub in the workspaces list too
        state.workspaces = state.workspaces.map((w) =>
          w.id === action.payload.id ? action.payload : w
        );
        localStorage.setItem(STORAGE_KEY, action.payload.id);
      })
      .addCase(fetchWorkspaceById.rejected, (state) => { state.loading = false; });
  },
});

export const {
  setWorkspaces, setCurrentWorkspace, setCurrentWorkspaceFull,
  addWorkspace, updateWorkspace, deleteWorkspace,
  addProject, updateProject, removeProject,
  addTask, updateTask, deleteTask,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
