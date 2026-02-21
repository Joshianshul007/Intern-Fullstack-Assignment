'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Plus, Trash2, CheckCircle2, Search, Edit2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/axios';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

interface Task {
    _id: string;
    title: string;
    description: string;
    isCompleted: boolean;
    createdAt: string;
}

type FilterType = 'All' | 'Completed' | 'Pending';

export default function DashboardPage() {
    const { user, login, logout } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    // State
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDesc, setNewTaskDesc] = useState('');

    // Profile Edit State
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [editName, setEditName] = useState(user?.name || '');
    const [editPassword, setEditPassword] = useState('');

    // Task Edit State
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [editTaskTitle, setEditTaskTitle] = useState('');
    const [editTaskDesc, setEditTaskDesc] = useState('');

    // Search and Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<FilterType>('All');

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await api.get('/tasks');
            setTasks(response.data);
        } catch (error) {
            toast({ title: 'Error fetching tasks', variant: 'destructive' });
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle || !newTaskDesc) return;

        try {
            const response = await api.post('/tasks', { title: newTaskTitle, description: newTaskDesc });
            setTasks([response.data, ...tasks]);
            setNewTaskTitle('');
            setNewTaskDesc('');
            toast({ title: 'Task created successfully' });
        } catch (error) {
            toast({ title: 'Failed to create task', variant: 'destructive' });
        }
    };

    const handleUpdateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTask || !editTaskTitle) return;

        try {
            const response = await api.put(`/tasks/${editingTask._id}`, {
                title: editTaskTitle,
                description: editTaskDesc
            });
            setTasks(tasks.map((t) => (t._id === editingTask._id ? response.data : t)));
            setEditingTask(null);
            toast({ title: 'Task updated successfully' });
        } catch (error) {
            toast({ title: 'Failed to update task', variant: 'destructive' });
        }
    }

    const toggleTaskCompletion = async (task: Task) => {
        try {
            const response = await api.put(`/tasks/${task._id}`, { isCompleted: !task.isCompleted });
            setTasks(tasks.map((t) => (t._id === task._id ? response.data : t)));
        } catch (error) {
            toast({ title: 'Failed to update status', variant: 'destructive' });
        }
    };

    const handleDeleteTask = async (id: string) => {
        try {
            await api.delete(`/tasks/${id}`);
            setTasks(tasks.filter((t) => t._id !== id));
            toast({ title: 'Task removed successfully' });
        } catch (error) {
            toast({ title: 'Failed to delete task', variant: 'destructive' });
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const updateData: any = { name: editName };
            if (editPassword) updateData.password = editPassword;

            const response = await api.put('/auth/profile', updateData);
            login(
                { _id: response.data._id, name: response.data.name, email: response.data.email },
                response.data.token
            );
            setIsProfileOpen(false);
            setEditPassword('');
            toast({ title: 'Profile updated smoothly' });
        } catch (error) {
            toast({ title: 'Failed to update profile', variant: 'destructive' });
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    // Filter and Search Logic
    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description.toLowerCase().includes(searchQuery.toLowerCase());

            if (filter === 'Completed') return matchesSearch && task.isCompleted;
            if (filter === 'Pending') return matchesSearch && !task.isCompleted;
            return matchesSearch;
        });
    }, [tasks, searchQuery, filter]);

    return (
        <ProtectedRoute>
            <div className="flex min-h-screen bg-slate-50 flex-col">
                {/* Navbar */}
                <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            Workspace
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">

                        {/* Profile Info & Edit */}
                        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                            <DialogTrigger asChild>
                                <div className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 px-3 py-1.5 rounded-full transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">{user?.name}</span>
                                        <span className="text-xs text-slate-500">{user?.email}</span>
                                    </div>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <form onSubmit={handleUpdateProfile}>
                                    <DialogHeader>
                                        <DialogTitle>Profile Settings</DialogTitle>
                                        <DialogDescription>Manage your account name and password.</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Display Name</label>
                                            <Input value={editName} onChange={(e) => setEditName(e.target.value)} required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">New Password <span className="text-slate-400 font-normal">(optional)</span></label>
                                            <Input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="Leave blank to keep same" />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" className="w-full sm:w-auto">Save Changes</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-red-600 hover:bg-red-50">
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-800">Your Tasks</h2>
                            <p className="text-slate-500 mt-1">Manage, filter, and track your daily priorities.</p>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex w-full md:w-auto items-center gap-3">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search tasks..."
                                    className="pl-9 bg-white"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex bg-white rounded-md border p-1 border-slate-200">
                                {(['All', 'Pending', 'Completed'] as FilterType[]).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-3 py-1 text-sm rounded-sm transition-all ${filter === f ? 'bg-slate-100 font-medium text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-8 md:grid-cols-[1fr_350px] items-start">

                        {/* Task List */}
                        <div className="space-y-4">
                            {filteredTasks.length === 0 ? (
                                <div className="text-center p-16 bg-white rounded-2xl border border-dashed text-slate-400 flex flex-col items-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <Search className="h-8 w-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-700 mb-1">No tasks found</h3>
                                    <p>Try adjusting your search or filter, or create a new task.</p>
                                </div>
                            ) : (
                                filteredTasks.map((task) => (
                                    <Card key={task._id} className={`group transition-all duration-200 hover:shadow-md ${task.isCompleted ? 'opacity-70 bg-slate-50 border-slate-200' : 'bg-white border-slate-200'}`}>
                                        <CardHeader className="p-5 flex flex-row items-start justify-between space-y-0">

                                            <div className="flex gap-4 flex-1 min-w-0 pr-4">
                                                <button
                                                    onClick={() => toggleTaskCompletion(task)}
                                                    className={`mt-1 flex-shrink-0 transition-colors ${task.isCompleted ? 'text-emerald-500' : 'text-slate-300 hover:text-blue-500'}`}
                                                >
                                                    <CheckCircle2 size={22} />
                                                </button>

                                                <div className="min-w-0 flex-1">
                                                    {editingTask?._id === task._id ? (
                                                        <form onSubmit={handleUpdateTask} className="space-y-3">
                                                            <Input
                                                                value={editTaskTitle}
                                                                onChange={(e) => setEditTaskTitle(e.target.value)}
                                                                className="font-semibold text-base"
                                                                autoFocus
                                                            />
                                                            <Input
                                                                value={editTaskDesc}
                                                                onChange={(e) => setEditTaskDesc(e.target.value)}
                                                                className="text-sm"
                                                            />
                                                            <div className="flex gap-2">
                                                                <Button size="sm" type="submit" className="bg-blue-600 hover:bg-blue-700">Save</Button>
                                                                <Button size="sm" variant="ghost" type="button" onClick={() => setEditingTask(null)}>Cancel</Button>
                                                            </div>
                                                        </form>
                                                    ) : (
                                                        <>
                                                            <CardTitle className={`text-base font-semibold transition-all ${task.isCompleted ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                                                                {task.title}
                                                            </CardTitle>
                                                            <CardDescription className={`mt-1.5 text-sm ${task.isCompleted ? 'line-through text-slate-400' : 'text-slate-600'}`}>
                                                                {task.description}
                                                            </CardDescription>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!editingTask || editingTask._id !== task._id ? (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setEditingTask(task);
                                                                setEditTaskTitle(task.title);
                                                                setEditTaskDesc(task.description);
                                                            }}
                                                            className="text-slate-400 hover:text-blue-600 transition-colors p-2 rounded-md hover:bg-blue-50"
                                                            title="Edit Task"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteTask(task._id)}
                                                            className="text-slate-400 hover:text-red-600 transition-colors p-2 rounded-md hover:bg-red-50 ml-1"
                                                            title="Delete Task"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                ) : null}
                                            </div>

                                        </CardHeader>
                                    </Card>
                                ))
                            )}
                        </div>

                        {/* Create Task Form Widget */}
                        <div className="sticky top-28">
                            <Card className="border-slate-200 shadow-sm overflow-hidden">
                                <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 w-full" />
                                <CardHeader className="bg-white">
                                    <CardTitle className="flex items-center gap-2">
                                        <Plus className="h-5 w-5 text-blue-500" /> Add New Task
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="bg-white">
                                    <form onSubmit={handleCreateTask} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Title</label>
                                            <Input
                                                placeholder="What needs to be done?"
                                                value={newTaskTitle}
                                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                                required
                                                className="bg-slate-50 focus-visible:bg-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Details</label>
                                            <textarea
                                                className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="Add some context..."
                                                value={newTaskDesc}
                                                onChange={(e) => setNewTaskDesc(e.target.value)}
                                            />
                                        </div>
                                        <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 mt-2 h-11">
                                            Save Task
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
