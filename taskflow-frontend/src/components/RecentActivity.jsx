import { useEffect, useState } from "react";
import { GitCommit, MessageSquare, Clock, Bug, Zap, Square } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSelector } from "react-redux";
import { workspaceApi } from "../api/workspace.api.js";
import { normalizeActivity } from "../utils/normalize.js";

const RecentActivity = () => {
    const { currentWorkspace } = useSelector((state) => state.workspace);
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        if (!currentWorkspace?.id) return;
        workspaceApi.getActivity(currentWorkspace.id, 15)
            .then(({ data }) => setActivities(data.data.map(normalizeActivity)))
            .catch(() => {});
    }, [currentWorkspace?.id]);

    return (
        <div className="bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-lg transition-all overflow-hidden">
            <div className="border-b border-zinc-200 dark:border-zinc-800 p-4">
                <h2 className="text-lg text-zinc-800 dark:text-zinc-200">Recent Activity</h2>
            </div>
            <div className="p-0">
                {activities.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                            <Clock className="w-8 h-8 text-zinc-600 dark:text-zinc-500" />
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400">No recent activity</p>
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {activities.map((activity) => (
                            <div key={activity.id} className="p-5 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className="size-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                                        {activity.actor?.image
                                            ? <img src={activity.actor.image} className="size-full object-cover" alt="" />
                                            : activity.actor?.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-zinc-800 dark:text-zinc-200">{activity.message}</p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentActivity;
