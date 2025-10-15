'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { DEPARTMENTS, getDepartmentName } from '@/constants/departments';
import Header from '@/components/Header';
import { Users, Edit, Trash2, Shield, UserCheck, UserX, ArrowLeft } from 'lucide-react';

export default function UserManagement() {
    const { user, isSuperAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        if (!authLoading && (!user || !isSuperAdmin)) {
            router.push('/admin/login');
        }
    }, [user, isSuperAdmin, authLoading, router]);

    useEffect(() => {
        if (user && isSuperAdmin) {
            fetchUsers();
        }
    }, [user, isSuperAdmin]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const usersData = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(usersData);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateUserRole = async (userId, newRole, department = null) => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                role: newRole,
                department: department,
                updatedAt: new Date()
            });
            fetchUsers();
        } catch (error) {
            console.error('Error updating user role:', error);
        }
    };

    const deleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteDoc(doc(db, 'users', userId));
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-white font-audiowide">Loading...</div>
            </div>
        );
    }

    if (!isSuperAdmin) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-white font-audiowide">Access Denied</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background-soft to-background">
            <Header />
            
            <div className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.push('/admin')}
                        className="p-2 text-muted-text hover:text-primary transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="font-audiowide text-4xl md:text-6xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                            User Management
                        </h1>
                        <p className="text-muted-text font-space text-lg">
                            Manage admin roles and permissions
                        </p>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-background-soft border border-border rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-border">
                        <h2 className="font-audiowide text-xl text-white flex items-center gap-2">
                            <Users size={24} />
                            All Users
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-background">
                                <tr>
                                    <th className="text-left p-4 font-audiowide text-sm text-muted-text">User</th>
                                    <th className="text-left p-4 font-audiowide text-sm text-muted-text">Role</th>
                                    <th className="text-left p-4 font-audiowide text-sm text-muted-text">Department</th>
                                    <th className="text-left p-4 font-audiowide text-sm text-muted-text">Status</th>
                                    <th className="text-left p-4 font-audiowide text-sm text-muted-text">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((userData) => (
                                    <tr key={userData.id} className="border-t border-border hover:bg-background/50">
                                        <td className="p-4">
                                            <div>
                                                <p className="font-audiowide text-white text-sm">{userData.email}</p>
                                                <p className="text-muted-text font-space text-xs">{userData.displayName || 'No name'}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-audiowide ${
                                                userData.role === 'super_admin' 
                                                    ? 'bg-red-500/20 text-red-400' 
                                                    : userData.role === 'department_admin'
                                                    ? 'bg-blue-500/20 text-blue-400'
                                                    : 'bg-gray-500/20 text-gray-400'
                                            }`}>
                                                {userData.role === 'super_admin' ? 'Super Admin' : 
                                                 userData.role === 'department_admin' ? 'Dept Admin' : 
                                                 'Pending'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-white font-space text-sm">
                                                {userData.department ? getDepartmentName(userData.department) : 'None'}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-audiowide ${
                                                userData.role !== 'pending' 
                                                    ? 'bg-green-500/20 text-green-400' 
                                                    : 'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                                {userData.role !== 'pending' ? 'Active' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingUser(userData);
                                                        setShowEditModal(true);
                                                    }}
                                                    className="p-2 text-muted-text hover:text-secondary transition-colors duration-300"
                                                    title="Edit User"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                {userData.id !== user.uid && (
                                                    <button
                                                        onClick={() => deleteUser(userData.id)}
                                                        className="p-2 text-muted-text hover:text-red-500 transition-colors duration-300"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit User Modal */}
            {showEditModal && editingUser && (
                <EditUserModal
                    user={editingUser}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingUser(null);
                    }}
                    onUpdate={fetchUsers}
                />
            )}
        </div>
    );
}

const EditUserModal = ({ user: editUser, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        role: editUser.role || 'pending',
        department: editUser.department || ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await updateDoc(doc(db, 'users', editUser.id), {
                role: formData.role,
                department: formData.role === 'department_admin' ? formData.department : null,
                updatedAt: new Date()
            });
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Error updating user:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border rounded-xl p-6 max-w-md w-full">
                <h3 className="font-audiowide text-xl text-white mb-6">Edit User Role</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <p className="text-muted-text font-space text-sm mb-2">User: {editUser.email}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-audiowide text-muted-text mb-2">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                            className="w-full bg-background-soft border border-border rounded-lg px-3 py-2 text-white font-space focus:border-primary focus:outline-none"
                        >
                            <option value="pending">Pending</option>
                            <option value="department_admin">Department Admin</option>
                            <option value="super_admin">Super Admin</option>
                        </select>
                    </div>

                    {formData.role === 'department_admin' && (
                        <div>
                            <label className="block text-sm font-audiowide text-muted-text mb-2">Department</label>
                            <select
                                value={formData.department}
                                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                                className="w-full bg-background-soft border border-border rounded-lg px-3 py-2 text-white font-space focus:border-primary focus:outline-none"
                                required
                            >
                                <option value="">Select Department</option>
                                {DEPARTMENTS.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-audiowide transition-colors duration-300 disabled:opacity-50"
                        >
                            {loading ? 'Updating...' : 'Update User'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-background-soft border border-border text-white px-6 py-2 rounded-lg font-audiowide hover:bg-background transition-colors duration-300"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
