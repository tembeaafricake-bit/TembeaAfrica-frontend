'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, Shield, UserPlus, ChevronRight } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { adminApi } from '@/lib/api'
import toast from 'react-hot-toast'

export default function AdminUsersPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers({ limit: 50 }).then((res) => res.data),
  })

  const rows = useMemo(() => data?.data || [], [data])

  return (
    <AdminShell title="Users">
      <div className="space-y-6">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Manage users</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">View and update user roles or ban accounts as needed.</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors">
              <UserPlus className="w-4 h-4" /> Invite admin
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <div className="flex items-center gap-3 text-sm font-semibold text-gray-900 dark:text-white">
              <Users className="w-4 h-4" /> User accounts
            </div>
            <button onClick={() => refetch()} className="text-xs font-medium text-safari-600 hover:underline">Refresh</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((label) => (
                    <th key={label} className="whitespace-nowrap px-5 py-4 font-medium">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!rows?.length ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No users found.</td>
                  </tr>
                ) : (
                  rows.map((user: any) => (
                    <tr key={user._id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-950/50 transition-colors">
                      <td className="px-5 py-4 text-sm text-gray-900 dark:text-white">{user.firstName} {user.lastName}</td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{user.role}</td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{user.isBanned ? 'Banned' : 'Active'}</td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4 space-x-2">
                        <button onClick={async () => { await adminApi.banUser(user._id, !user.isBanned); refetch(); toast.success(user.isBanned ? 'User unbanned' : 'User banned') }}
                          className="rounded-2xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors">
                          {user.isBanned ? 'Unban' : 'Ban'}
                        </button>
                        <button onClick={async () => { await adminApi.updateUserRole(user._id, user.role === 'admin' ? 'user' : 'admin'); refetch(); toast.success('Role updated') }}
                          className="rounded-2xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors">
                          {user.role === 'admin' ? 'Demote' : 'Promote'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminShell>
  )
}
