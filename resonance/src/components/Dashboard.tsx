"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Folder, Music, Calendar, LogOut, X, Pencil, Trash } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { subscriptionManager, UserTier } from '@/lib/subscription';


interface Project {
    id: string;
    name: string;
    updated_at: string;
}


export default function Dashboard({ user, subscription }: { user: User, subscription: any }) {
    const supabase = createClient();
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]); // Client-side state
    const [search, setSearch] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [updatedProjectName, setUpdatedProjectName] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletingProject, setDeletingProject] = useState<Project | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Initial Fetch
    useEffect(() => {
        const fetchProjects = async () => {
            const { data } = await supabase.from('projects').select('*').order('updated_at', { ascending: false });
            if (data) setProjects(data as Project[]);
        };
        fetchProjects();
    }, []);

    // Helper to refresh projects
    const refreshProjects = async () => {
        const { data } = await supabase.from('projects').select('*').order('updated_at', { ascending: false });
        if (data) setProjects(data as Project[]);
    };

    // Initialize local state for immediate UI feedback based on props
    const [dashboardTier, setDashboardTier] = useState<UserTier>(() => {
        if (subscription && subscription.tier) {
            return subscription.tier as UserTier;
        }
        return UserTier.FREE;
    });

    // Sync Global Manager & Local State
    useEffect(() => {
        if (subscription && subscription.tier) {
            const tier = subscription.tier as UserTier;
            subscriptionManager.setTier(tier);
            setDashboardTier(tier);
        } else {
            subscriptionManager.setTier(UserTier.FREE);
            setDashboardTier(UserTier.FREE);
        }
    }, [subscription]);


    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const confirmDeleteProject = async () => {
        if (!deletingProject) return;
        setIsDeleting(true);
        try {
            supabase.from('projects').delete().eq('id', deletingProject.id);
            await refreshProjects();
            setShowDeleteConfirm(false);
        } catch (e) {
            console.error(e);
        } finally {
            setIsDeleting(false);
        }
    };

    const confirmUpdateProject = async () => {
        if (!editingProject || !updatedProjectName.trim()) return;
        setIsUpdating(true);
        try {
            supabase.from('projects').update({ name: updatedProjectName }).eq('id', editingProject.id);
            await refreshProjects();
            setShowEditModal(false);
        } catch (e) {
            console.error(e);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteClick = (project: Project) => {
        setDeletingProject(project);
        setShowDeleteConfirm(true);
    };

    const handleEditClick = (project: Project) => {
        setEditingProject(project);
        setUpdatedProjectName(project.name);
        setShowEditModal(true);
    };

    const handleCreateClick = () => {
        setNewProjectName('');
        setShowCreateModal(true);
    };

    const confirmCreateProject = async () => {
        if (!newProjectName.trim()) return;
        setIsCreating(true);
        try {
            const { data: project } = await supabase.from('projects').insert([{
                name: newProjectName,
                data: {},
                user_id: user?.id || 'demo-user-id'
            }]).select().single();

            if (project) {
                router.push(`/project/${project.id}`);
            }
        } catch (e) {
            console.error(e);
            setIsCreating(false);
            setShowCreateModal(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans">
            {/* Header */}
            <div className="max-w-6xl mx-auto flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-blue-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                        <span className="text-white font-bold">KY</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-medium text-gray-400">
                            Demo Unlimited
                        </span>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-gray-900 border border-gray-800 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-green-500 transition w-64"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {user.user_metadata.avatar_url ? (
                            <img
                                src={user.user_metadata.avatar_url}
                                alt={user.user_metadata.full_name}
                                className="w-10 h-10 rounded-full border border-gray-700"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                                <span className="text-sm font-bold text-gray-400">ME</span>
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            className="w-10 h-10 rounded-full bg-gray-800 hover:bg-red-500/20 border border-gray-700 hover:border-red-500/50 flex items-center justify-center text-gray-400 hover:text-red-500 transition"
                            title="Sign Out"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {/* Create New Card */}
                    <button
                        onClick={handleCreateClick}
                        disabled={isCreating}
                        className="group relative aspect-square rounded-2xl border border-dashed border-gray-800 hover:border-green-500/50 bg-gray-900/20 hover:bg-green-500/5 transition flex flex-col items-center justify-center gap-4"
                    >
                        <div className="w-12 h-12 rounded-full bg-gray-800 group-hover:bg-green-500 group-hover:text-black flex items-center justify-center transition duration-300">
                            <Plus size={24} />
                        </div>
                        <span className="font-medium text-gray-400 group-hover:text-green-400">Create New Project</span>
                    </button>

                    {/* Project Cards */}
                    {filteredProjects.map(project => (
                        <div
                            key={project.id}
                            onClick={() => router.push(`/project/${project.id}`)}
                            className="group aspect-square rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 p-6 flex flex-col justify-between cursor-pointer hover:-translate-y-1 transition duration-300 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />

                            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditClick(project);
                                    }}
                                    className="w-8 h-8 rounded-full bg-gray-800 hover:bg-blue-500/20 border border-gray-700 hover:border-blue-500/50 flex items-center justify-center text-gray-400 hover:text-blue-500 transition"
                                    title="Edit Project"
                                >
                                    <Pencil size={14} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteClick(project);
                                    }}
                                    className="w-8 h-8 rounded-full bg-gray-800 hover:bg-red-500/20 border border-gray-700 hover:border-red-500/50 flex items-center justify-center text-gray-400 hover:text-red-500 transition"
                                    title="Delete Project"
                                >
                                    <Trash size={14} />
                                </button>
                            </div>

                            <div className="relative z-10">
                                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center mb-4 text-gray-400 group-hover:text-white transition">
                                    <Music size={20} />
                                </div>
                                <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-green-400 transition">{project.name}</h3>
                                <p className="text-xs text-gray-500">Spatial Audio Scene</p>
                            </div>

                            <div className="relative z-10 flex items-center gap-2 text-xs text-gray-500">
                                <Calendar size={12} />
                                <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            {/* Create Project Modal */}
            {
                showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">Create New Project</h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-gray-500 hover:text-white transition"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Project Name</label>
                                    <input
                                        type="text"
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        placeholder="e.g. My Awesome Soundscape"
                                        className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && confirmCreateProject()}
                                    />
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmCreateProject}
                                        disabled={!newProjectName.trim() || isCreating}
                                        className="px-6 py-2 text-sm font-bold bg-white text-black rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        {isCreating ? 'Creating...' : 'Create Project'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Edit Project Modal */}
            {showEditModal && editingProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">Edit Project Name</h2>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-500 hover:text-white transition"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1.5">Project Name</label>
                                <input
                                    type="text"
                                    value={updatedProjectName}
                                    onChange={(e) => setUpdatedProjectName(e.target.value)}
                                    className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition"
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmUpdateProject}
                                    disabled={!updatedProjectName.trim() || isUpdating}
                                    className="px-6 py-2 text-sm font-bold bg-white text-black rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    {isUpdating ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Project Confirmation */}
            {showDeleteConfirm && deletingProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">Delete Project</h2>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="text-gray-500 hover:text-white transition"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-gray-400 mb-6">
                            Are you sure you want to delete the project "{deletingProject.name}"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteProject}
                                disabled={isDeleting}
                                className="px-6 py-2 text-sm font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div >
    );
}
