import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loadTheme } from '../features/themeSlice'
import { fetchWorkspaces, fetchWorkspaceById } from '../features/workspaceSlice'
import { useAuth } from '../context/AuthContext.jsx'
import { Loader2Icon } from 'lucide-react'

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const { loading } = useSelector((state) => state.workspace)
    const { isAuthenticated, isLoading: authLoading } = useAuth()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        dispatch(loadTheme())
    }, [])

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login', { replace: true })
            return
        }
        if (isAuthenticated) {
            dispatch(fetchWorkspaces()).then((action) => {
                if (action.payload?.length > 0) {
                    const savedId = localStorage.getItem('currentWorkspaceId')
                    const ws = action.payload.find((w) => w.id === savedId) || action.payload[0]
                    if (ws?.id) dispatch(fetchWorkspaceById(ws.id))
                }
            })
        }
    }, [isAuthenticated, authLoading])

    if (authLoading || loading) return (
        <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950'>
            <Loader2Icon className="size-7 text-blue-500 animate-spin" />
        </div>
    )

    return (
        <div className="flex bg-white dark:bg-zinc-950 text-gray-900 dark:text-slate-100">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col h-screen">
                <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                <div className="flex-1 h-full p-6 xl:p-10 xl:px-16 overflow-y-scroll">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Layout
