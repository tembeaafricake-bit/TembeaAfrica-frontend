'use client'

import { useMemo, useState, FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, RefreshCcw, CheckCircle, Trash2 } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { adminApi } from '@/lib/api'
import toast from 'react-hot-toast'

export interface FormField {
  name: string
  label?: string
  type?: 'text' | 'number' | 'textarea' | 'select' | 'checkbox'
  options?: { value: string; label: string }[]
  required?: boolean
  placeholder?: string
  colSpan?: 1 | 2
}

interface AdminContentManagerProps {
  title: string
  description: string
  type: string
  singular: string
  fields: FormField[]
}

export function AdminContentManager({ title, description, type, singular, fields }: AdminContentManagerProps) {
  const [showForm, setShowForm] = useState(false)

  const { data, refetch } = useQuery({
    queryKey: ['admin-listings', type],
    queryFn: () => adminApi.getListings({ type, limit: 50 }).then((res) => res.data),
  })

  const rows = useMemo(() => data?.data || [], [data])

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const payload: Record<string, unknown> = {}

    fields.forEach((field) => {
      if (field.type === 'checkbox') {
        if (formData.get(field.name)) payload[field.name] = true
        return
      }
      const value = formData.get(field.name)
      if (value === null || value === '') return
      if (field.type === 'number') payload[field.name] = Number(value)
      else payload[field.name] = value
    })

    try {
      await adminApi.createListing(type, payload)
      toast.success(`${singular} created successfully`)
      form.reset()
      setShowForm(false)
      refetch()
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err?.response?.data?.message || `Failed to create ${singular.toLowerCase()}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(`Delete this ${singular.toLowerCase()}?`)) return
    try {
      await adminApi.deleteListing(type, id)
      toast.success(`${singular} deleted`)
      refetch()
    } catch {
      toast.error(`Failed to delete ${singular.toLowerCase()}`)
    }
  }

  const renderField = (field: FormField) => {
    const label = field.label || field.name.charAt(0).toUpperCase() + field.name.slice(1)
    const className = `w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-safari-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white`
    const wrapperClass = `space-y-2 text-sm text-gray-700 dark:text-gray-200 ${field.colSpan === 2 ? 'md:col-span-2' : ''}`

    if (field.type === 'textarea') {
      return (
        <label key={field.name} className={wrapperClass}>
          {label}
          <textarea name={field.name} rows={4} required={field.required} placeholder={field.placeholder} className={className} />
        </label>
      )
    }
    if (field.type === 'select') {
      return (
        <label key={field.name} className={wrapperClass}>
          {label}
          <select name={field.name} required={field.required} defaultValue={field.options?.[0]?.value} className={className}>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
      )
    }
    if (field.type === 'checkbox') {
      return (
        <label key={field.name} className={`flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200 md:col-span-2`}>
          <input type="checkbox" name={field.name} className="h-4 w-4 rounded border-gray-300 text-safari-600 focus:ring-safari-500" />
          {label}
        </label>
      )
    }
    return (
      <label key={field.name} className={wrapperClass}>
        {label}
        <input name={field.name} type={field.type === 'number' ? 'number' : 'text'} required={field.required} placeholder={field.placeholder} className={className} />
      </label>
    )
  }

  return (
    <AdminShell title={title}>
      <div className="space-y-6">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            </div>
            <button onClick={() => setShowForm((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors">
              <Plus className="w-4 h-4" /> {showForm ? 'Hide form' : `Add ${singular.toLowerCase()}`}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleCreate} className="mt-6 grid gap-4 md:grid-cols-2">
              {fields.map(renderField)}
              <button type="submit" className="md:col-span-2 inline-flex items-center justify-center rounded-2xl bg-safari-700 px-5 py-3 text-sm font-semibold text-white hover:bg-safari-800 transition-colors">
                Create {singular.toLowerCase()}
              </button>
            </form>
          )}
        </section>

        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{rows.length} {title.toLowerCase()}</p>
            <button onClick={() => refetch()} className="inline-flex items-center gap-2 text-xs font-medium text-safari-600 hover:underline">
              <RefreshCcw className="w-4 h-4" /> Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th className="px-5 py-4 font-medium">Title</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Created</th>
                  <th className="px-5 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!rows.length ? (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-500">No items yet. Add one above.</td></tr>
                ) : rows.map((item: Record<string, unknown>) => (
                  <tr key={item._id as string} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">{(item.name || item.title || 'Untitled') as string}</td>
                    <td className="px-5 py-4 text-gray-500">{item.status as string}</td>
                    <td className="px-5 py-4 text-gray-500">{new Date(item.createdAt as string).toLocaleDateString()}</td>
                    <td className="px-5 py-4 flex flex-wrap gap-2">
                      <button onClick={async () => {
                        await adminApi.updateListingStatus(type, item._id as string, item.status === 'active' ? 'inactive' : 'active')
                        refetch()
                        toast.success('Status updated')
                      }} className="inline-flex items-center gap-1 rounded-2xl bg-safari-700 px-3 py-2 text-xs font-semibold text-white">
                        <CheckCircle className="w-3.5 h-3.5" /> Toggle
                      </button>
                      <button onClick={() => handleDelete(item._id as string)} className="inline-flex items-center gap-1 rounded-2xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminShell>
  )
}

const TOUR_CATEGORIES = [
  { value: 'safari', label: 'Safari' }, { value: 'beach', label: 'Beach' },
  { value: 'adventure', label: 'Adventure' }, { value: 'cultural', label: 'Cultural' },
  { value: 'mountain', label: 'Mountain' }, { value: 'city', label: 'City' },
]

export const ADMIN_FIELD_CONFIGS = {
  tours: [
    { name: 'title', required: true, colSpan: 2 as const },
    { name: 'description', type: 'textarea' as const, required: true, colSpan: 2 as const },
    { name: 'category', type: 'select' as const, options: TOUR_CATEGORIES, required: true },
    { name: 'price', type: 'number' as const, required: true },
    { name: 'duration', required: true, placeholder: 'e.g. 3 days' },
    { name: 'groupSize', type: 'number' as const, required: true },
    { name: 'heroImage', label: 'Image URL', placeholder: 'https://...' },
    { name: 'status', type: 'select' as const, options: [{ value: 'active', label: 'Active' }, { value: 'draft', label: 'Draft' }] },
  ],
  guides: [
    { name: 'bio', type: 'textarea' as const, required: true, colSpan: 2 as const },
    { name: 'category', type: 'select' as const, options: [
      { value: 'safari', label: 'Safari' }, { value: 'cultural', label: 'Cultural' },
      { value: 'mountain', label: 'Mountain' }, { value: 'photography', label: 'Photography' }, { value: 'city', label: 'City' },
    ], required: true },
    { name: 'experience', type: 'number' as const, label: 'Years of experience' },
    { name: 'dailyRate', type: 'number' as const, required: true },
    { name: 'hourlyRate', type: 'number' as const },
    { name: 'verified', type: 'checkbox' as const, label: 'Verified guide' },
    { name: 'status', type: 'select' as const, options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
  ],
  accommodations: [
    { name: 'name', required: true, colSpan: 2 as const },
    { name: 'description', type: 'textarea' as const, required: true, colSpan: 2 as const },
    { name: 'type', type: 'select' as const, options: [
      { value: 'hotel', label: 'Hotel' }, { value: 'lodge', label: 'Lodge' },
      { value: 'bnb', label: 'BnB' }, { value: 'resort', label: 'Resort' }, { value: 'villa', label: 'Villa' },
    ], required: true },
    { name: 'pricePerNight', type: 'number' as const, required: true },
    { name: 'heroImage', label: 'Image URL', placeholder: 'https://...' },
    { name: 'status', type: 'select' as const, options: [{ value: 'active', label: 'Active' }, { value: 'draft', label: 'Draft' }] },
  ],
}
