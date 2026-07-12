'use client'

import { useMemo, useState, FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building2, Plus, RefreshCcw, CheckCircle, Trash2 } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { adminApi } from '@/lib/api'
import toast from 'react-hot-toast'

const LISTING_TYPES = [
  { label: 'Destinations', value: 'destinations' },
  { label: 'Tours', value: 'tours' },
  { label: 'Guides', value: 'guides' },
  { label: 'Accommodations', value: 'accommodations' },
]

const defaultForms: Record<string, string[]> = {
  destinations: ['name', 'country', 'description', 'heroImage', 'shortDescription', 'status', 'featured'],
  tours: ['title', 'description', 'destination', 'operator', 'price', 'duration', 'groupSize', 'category', 'status'],
  guides: ['user', 'bio', 'category', 'primaryDestination', 'experience', 'hourlyRate', 'dailyRate', 'verified', 'status'],
  accommodations: ['name', 'type', 'destination', 'owner', 'pricePerNight', 'description', 'heroImage', 'status'],
}

export default function AdminListingsPage() {
  const [type, setType] = useState('destinations')
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-listings', type],
    queryFn: () => adminApi.getListings({ type, limit: 50 }).then((res) => res.data),
  })

  const rows = useMemo(() => data?.data || [], [data])

  const getListingTitle = (item: any) => {
    if (item.name) return item.name
    if (item.title) return item.title
    if (item.user && typeof item.user === 'object') {
      return `${item.user.firstName || ''} ${item.user.lastName || ''}`.trim() || 'Guide'
    }
    if (item.category) return `${item.category.charAt(0).toUpperCase() + item.category.slice(1)} ${type === 'guides' ? 'guide' : ''}`
    return 'Untitled'
  }

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const payload: Record<string, unknown> = {}
    const uploadTasks: Promise<void>[] = []

    Array.from(formData.entries()).forEach(([key, value]) => {
      if (value === null || value === '') return
      if (key === 'heroImage' && value instanceof File && value.size > 0) {
        uploadTasks.push((async () => {
          const response = await adminApi.uploadImage(value)
          payload.heroImage = response.data.url
        })())
        return
      }
      if (key === 'heroImageUrl' && typeof value === 'string' && value.trim() !== '' && !payload.heroImage) {
        payload.heroImage = value.trim()
        return
      }
      payload[key] = value
    })

    if (formData.get('featured')) payload.featured = true
    if (formData.get('verified')) payload.verified = true
    if (formData.get('price')) payload.price = Number(formData.get('price'))
    if (formData.get('pricePerNight')) payload.pricePerNight = Number(formData.get('pricePerNight'))
    if (formData.get('groupSize')) payload.groupSize = Number(formData.get('groupSize'))
    if (formData.get('experience')) payload.experience = Number(formData.get('experience'))
    if (formData.get('hourlyRate')) payload.hourlyRate = Number(formData.get('hourlyRate'))
    if (formData.get('dailyRate')) payload.dailyRate = Number(formData.get('dailyRate'))
    ;['user', 'owner', 'destination', 'operator', 'primaryDestination'].forEach((field) => {
      if (formData.get(field)) payload[field] = String(formData.get(field))
    })

    await Promise.all(uploadTasks)

    try {
      await adminApi.createListing(type, payload)
      toast.success(`${type.slice(0, -1)} created`)
      form.reset()
      setShowForm(false)
      refetch()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || `Failed to create ${type.slice(0, -1)}`)
    }
  }

  return (
    <AdminShell title="Listings">
      <div className="space-y-6">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Create and manage listings</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Use a single interface for destinations, tours, guides and accommodations.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select value={type} onChange={(event) => setType(event.target.value)}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-safari-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white">
                {LISTING_TYPES.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
              <button onClick={() => setShowForm((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors">
                <Plus className="w-4 h-4" /> {showForm ? 'Hide form' : 'Add new'}
              </button>
            </div>
          </div>

          {showForm && (
            <form onSubmit={handleCreate} className="mt-6 grid gap-4 md:grid-cols-2">
              {defaultForms[type].map((field) => {
                const label = field.charAt(0).toUpperCase() + field.slice(1)
                if (field === 'description' || field === 'shortDescription' || field === 'bio') {
                  return (
                    <label key={field} className="space-y-2 text-sm text-gray-700 dark:text-gray-200 md:col-span-2">
                      {label}
                      <textarea name={field} rows={4} className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-safari-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white" />
                    </label>
                  )
                }

                if (field === 'status') {
                  return (
                    <label key={field} className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                      Status
                      <select name="status" defaultValue="active" className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-safari-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white">
                        <option value="active">active</option>
                        <option value="inactive">inactive</option>
                        <option value="draft">draft</option>
                      </select>
                    </label>
                  )
                }

                if (field === 'featured' || field === 'verified') {
                  return (
                    <label key={field} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200 md:col-span-2">
                      <input type="checkbox" name={field} className="h-4 w-4 rounded border-gray-300 text-safari-600 focus:ring-safari-500" />
                      {field === 'featured' ? 'Featured listing' : 'Verified guide'}
                    </label>
                  )
                }

                if (field === 'country' || field === 'type') {
                  const options = field === 'country'
                    ? [{ value: 'kenya', label: 'Kenya' }, { value: 'tanzania', label: 'Tanzania' }]
                    : [{ value: 'hotel', label: 'Hotel' }, { value: 'bnb', label: 'BNB' }, { value: 'guesthouse', label: 'Guesthouse' }, { value: 'lodge', label: 'Lodge' }]
                  return (
                    <label key={field} className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                      {label}
                      <select name={field} className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-safari-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white">
                        {options.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </label>
                  )
                }

                if (field === 'heroImage') {
                  return (
                    <label key={field} className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                      Image URL or upload
                      <input name="heroImageUrl" placeholder="https://..." className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-safari-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white" />
                      <input name="heroImage" type="file" accept="image/*"
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-safari-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Provide an image URL or upload a file.</p>
                    </label>
                  )
                }
                if (['destination', 'owner', 'operator', 'user', 'primaryDestination'].includes(field)) {
                  return (
                    <label key={field} className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                      {label} ID
                      <input name={field} placeholder="Enter object ID"
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-safari-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white" />
                    </label>
                  )
                }

                return (
                  <label key={field} className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                    {label}
                    <input name={field} type={['price', 'pricePerNight', 'groupSize', 'experience', 'hourlyRate', 'dailyRate'].includes(field) ? 'number' : 'text'}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-safari-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white" />
                  </label>
                )
              })}

              <button type="submit" className="md:col-span-2 inline-flex items-center justify-center rounded-2xl bg-safari-700 px-5 py-3 text-sm font-semibold text-white hover:bg-safari-800 transition-colors">
                Create {type.slice(0, -1)}
              </button>
            </form>
          )}
        </section>

        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <div className="flex items-center gap-3 text-sm font-semibold text-gray-900 dark:text-white">
              <Building2 className="w-4 h-4" /> {type.charAt(0).toUpperCase() + type.slice(1)}
            </div>
            <button onClick={() => refetch()} className="inline-flex items-center gap-2 text-xs font-medium text-safari-600 hover:underline">
              <RefreshCcw className="w-4 h-4" /> Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th className="whitespace-nowrap px-5 py-4 font-medium">Title</th>
                  <th className="whitespace-nowrap px-5 py-4 font-medium">Status</th>
                  <th className="whitespace-nowrap px-5 py-4 font-medium">Created</th>
                  <th className="whitespace-nowrap px-5 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!rows?.length ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No listings found.</td>
                  </tr>
                ) : (
                  rows.map((item: any) => (
                    <tr key={item._id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-950/50 transition-colors">
                      <td className="px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white">{getListingTitle(item)}</td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{item.status}</td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4 flex flex-wrap gap-2">
                        <button onClick={async () => { await adminApi.updateListingStatus(type, item._id, item.status === 'active' ? 'inactive' : 'active'); refetch(); toast.success('Status updated') }}
                          className="inline-flex items-center gap-2 rounded-2xl bg-safari-700 px-3 py-2 text-xs font-semibold text-white hover:bg-safari-800 transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" /> Toggle
                        </button>
                        <button onClick={async () => {
                          if (!confirm('Delete this listing?')) return
                          await adminApi.deleteListing(type, item._id)
                          refetch()
                          toast.success('Listing deleted')
                        }} className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" /> Delete
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
