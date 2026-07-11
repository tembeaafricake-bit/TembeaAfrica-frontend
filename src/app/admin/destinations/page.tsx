'use client'

import { useMemo, useState, FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Plus, RefreshCcw, ChevronRight } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { AdminShell } from '@/components/admin/AdminShell'
import toast from 'react-hot-toast'

const statusOptions = ['active', 'inactive']

export default function AdminDestinationsPage() {
  const [showForm, setShowForm] = useState(false)
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-destinations'],
    queryFn: () => adminApi.getListings({ type: 'destinations', limit: 50 }).then((res) => res.data),
  })

  const rows = useMemo(() => data?.data || [], [data])

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = {
      name: formData.get('name'),
      country: formData.get('country'),
      description: formData.get('description'),
      heroImage: formData.get('heroImage'),
      shortDescription: formData.get('shortDescription'),
      featured: formData.get('featured') === 'on',
      status: formData.get('status'),
    }
    try {
      await adminApi.createListing('destinations', payload)
      toast.success('Destination created')
      form.reset()
      setShowForm(false)
      refetch()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create destination')
    }
  }

  return (
    <AdminShell title="Destinations">
      <div className="space-y-6">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Destinations</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage destination listings and publish new locations.</p>
            </div>
            <button onClick={() => setShowForm((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors">
              <Plus className="w-4 h-4" /> {showForm ? 'Close form' : 'Add destination'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleCreate} className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                Name
                <input name="name" required className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-safari-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white" />
              </label>
              <label className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                Country
                <select name="country" defaultValue="kenya" className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-safari-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white">
                  <option value="kenya">Kenya</option>
                  <option value="tanzania">Tanzania</option>
                </select>
              </label>
              <label className="space-y-2 text-sm text-gray-700 dark:text-gray-200 md:col-span-2">
                Short description
                <textarea name="shortDescription" rows={3} className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-safari-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white" />
              </label>
              <label className="space-y-2 text-sm text-gray-700 dark:text-gray-200 md:col-span-2">
                Description
                <textarea name="description" rows={4} required className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-safari-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white" />
              </label>
              <label className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                Hero image URL
                <input name="heroImage" required className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-safari-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white" />
              </label>
              <label className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                Status
                <select name="status" defaultValue="active" className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-safari-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white">
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200 md:col-span-2">
                <input type="checkbox" name="featured" className="h-4 w-4 rounded border-gray-300 text-safari-600 focus:ring-safari-500" />
                Mark as featured destination
              </label>
              <button type="submit" className="md:col-span-2 inline-flex items-center justify-center rounded-2xl bg-safari-700 px-5 py-3 text-sm font-semibold text-white hover:bg-safari-800 transition-colors">
                Create destination
              </button>
            </form>
          )}
        </section>

        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <div className="flex items-center gap-3 text-sm font-semibold text-gray-900 dark:text-white">
              <MapPin className="w-4 h-4" /> Locations
            </div>
            <button onClick={() => refetch()} className="inline-flex items-center gap-2 text-xs font-medium text-safari-600 hover:underline">
              <RefreshCcw className="w-4 h-4" /> Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  {['Name', 'Country', 'Status', 'Featured', 'Created', 'Actions'].map((label) => (
                    <th key={label} className="whitespace-nowrap px-5 py-4 font-medium">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!rows?.length ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No destinations found.</td>
                  </tr>
                ) : (
                  rows.map((destination: any) => (
                    <tr key={destination._id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-950/50 transition-colors">
                      <td className="px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white">{destination.name}</td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{destination.country}</td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{destination.status}</td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{destination.featured ? 'Yes' : 'No'}</td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{new Date(destination.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <button className="inline-flex items-center gap-2 rounded-2xl bg-safari-700 px-3 py-2 text-xs font-semibold text-white hover:bg-safari-800 transition-colors">
                          <ChevronRight className="w-3.5 h-3.5" /> View
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
