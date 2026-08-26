// Normalizes a user object from backend to frontend shape
export const normalizeUser = (u) => {
  if (!u) return null;
  return {
    ...u,
    id: u._id || u.id,
    name: u.fullName || u.username,
    image: u.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username || "U")}&background=3b82f6&color=fff`,
  };
};

// Normalizes a task object
export const normalizeTask = (t, projectId) => {
  if (!t) return null;
  return {
    ...t,
    id: t._id || t.id,
    projectId: projectId || t.project || t.projectId,
    assigneeId: t.assignee?._id || t.assignee?.id || t.assigneeId || null,
    assignee: t.assignee ? normalizeUser(t.assignee) : null,
    createdBy: t.createdBy ? normalizeUser(t.createdBy) : null,
    due_date: t.due_date || null,
  };
};

// Normalizes a project object (with tasks and members embedded)
export const normalizeProject = (p) => {
  if (!p) return null;
  const id = p._id || p.id;
  return {
    ...p,
    id,
    tasks: (p.tasks || []).map((t) => normalizeTask(t, id)),
    members: (p.members || []).map((m) => ({
      ...m,
      id: m._id || m.id,
      userId: m.user?._id || m.user?.id || m.userId,
      user: m.user ? normalizeUser(m.user) : null,
    })),
    priority: p.priority || "MEDIUM",
    progress: p.progress || 0,
    start_date: p.start_date || null,
    end_date: p.end_date || null,
  };
};

// Normalizes a workspace object
export const normalizeWorkspace = (w) => {
  if (!w) return null;
  return {
    ...w,
    id: w._id || w.id,
    image_url: w.image_url || "https://placehold.co/200x200?text=WS",
    owner: w.owner ? normalizeUser(w.owner) : null,
    members: (w.members || []).map((m) => ({
      ...m,
      id: m._id || m.id,
      userId: m.user?._id || m.user?.id || m.userId,
      user: m.user ? normalizeUser(m.user) : null,
    })),
    projects: (w.projects || []).map(normalizeProject),
  };
};

// Normalizes activity items
export const normalizeActivity = (a) => ({
  ...a,
  id: a._id || a.id,
  actor: a.actor ? normalizeUser(a.actor) : null,
});
