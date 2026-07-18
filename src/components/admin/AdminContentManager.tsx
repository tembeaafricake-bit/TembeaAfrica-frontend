'use client'

import { useMemo, useState, FormEvent, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, RefreshCcw, CheckCircle, Trash2, Pencil } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { adminApi } from '@/lib/api'
import toast from 'react-hot-toast'

export interface FormField {
  name: string
  label?: string
  type?: 'text' | 'number' | 'textarea' | 'select' | 'checkbox' | 'file'
  options?: { value: string; label: string }[]
  required?: boolean
  placeholder?: string
  min?: number
  max?: number
  colSpan?: 1 | 2
}

const parseArrayFieldValue = (rawValue: FormDataEntryValue | null, fieldName: string) => {
  if (rawValue === null) return undefined
  const str = String(rawValue).trim()
  if (!str) return undefined

  if (fieldName === 'itinerary') {
    try {
      const parsed = JSON.parse(str)
      if (Array.isArray(parsed)) return parsed
    } catch {
      // fall back to line-based parsing below
    }

    return str
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const cleaned = line.replace(/^Day\s*\d+\s*[:.-]\s*/i, '').trim()
        const [title, ...rest] = cleaned.split('|')
        return {
          day: index + 1,
          title: title?.trim() || `Day ${index + 1}`,
          description: rest.join('|').trim() || 'Details to be added',
        }
      })
  }

  return str
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}

interface AdminContentManagerProps {
  title: string
  description: string
  type: string
  singular: string
  fields: FormField[]
}

export function AdminContentManager({ title, description, type, singular, fields }: AdminContentManagerProps) {
  const [selectedType, setSelectedType] = useState(type)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Record<string, any> | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data, refetch, error, isLoading } = useQuery({
    queryKey: ['admin-listings', selectedType],
    queryFn: async () => {
      console.log(`[AdminContentManager] Fetching ${selectedType} listings...`)
      const res = await adminApi.getListings({ type: selectedType, limit: 50 })
      console.log(`[AdminContentManager] Response for ${selectedType}:`, res.data)
      return res.data
    },
  })

  useEffect(() => {
    if (error) {
      const axiosErr = error as any
      console.error(`[AdminContentManager] Error fetching ${selectedType}:`, {
        status: axiosErr?.response?.status,
        message: axiosErr?.response?.data?.message || axiosErr?.message,
        data: axiosErr?.response?.data,
      })
    }
  }, [error, selectedType])

  const rows = useMemo(() => {
    if (!data) return []
    if (Array.isArray(data)) return data
    return data.data || []
  }, [data])

  const totalItems = useMemo(() => {
    if (!data) return 0
    if (Array.isArray(data)) return data.length
    return Number(data.total || rows.length || 0)
  }, [data, rows.length])

  const toggleForm = () => {
    if (showForm) {
      setEditingItem(null)
      setShowForm(false)
    } else {
      setShowForm(true)
    }
  }

  const getItemTitle = (item: Record<string, unknown>) => {
    if (item.name) return item.name as string
    if (item.title) return item.title as string
    const user = item.user as Record<string, unknown> | undefined
    if (user?.firstName || user?.lastName) {
      return `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
    }
    if (item.category) {
      const category = String(item.category)
      return `${category.charAt(0).toUpperCase() + category.slice(1)} ${selectedType === 'guides' ? 'guide' : ''}`.trim()
    }
    return 'Untitled'
  }

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const payload: Record<string, unknown> = {}
    const uploadTasks: Promise<void>[] = []

    fields.forEach((field) => {
      if (field.type === 'checkbox') {
        payload[field.name] = !!formData.get(field.name)
        return
      }
      if (field.type === 'file') {
        const file = formData.get(`${field.name}File`)
        const urlValue = formData.get(`${field.name}Url`)

        if (file instanceof File && file.size > 0) {
          uploadTasks.push((async () => {
            const response = await adminApi.uploadImage(file)
            payload[field.name] = response.data.url
          })())
          return
        }

        if (typeof urlValue === 'string' && urlValue.trim() !== '') {
          payload[field.name] = urlValue.trim()
        }
        return
      }

      const value = formData.get(field.name)
      if (value === null || value === '') return
      if (field.type === 'number') {
        payload[field.name] = Number(value)
        return
      }

      if (field.name === 'includes' || field.name === 'excludes' || field.name === 'highlights' || field.name === 'itinerary') {
        payload[field.name] = parseArrayFieldValue(value, field.name)
        return
      }

      payload[field.name] = value
    })

    setIsSubmitting(true)

    try {
      await Promise.all(uploadTasks)
      if (editingItem) {
        await adminApi.updateListing(selectedType, editingItem._id as string, payload)
        toast.success(`${singular} updated successfully`)
        setEditingItem(null)
      } else {
        await adminApi.createListing(selectedType, payload)
        toast.success(`${singular} created successfully`)
      }
      form.reset()
      setShowForm(false)
      refetch()
    } catch (error: unknown) {
      console.error(`Failed to save ${singular.toLowerCase()}`, error)
      const err = error as { response?: { data?: { message?: string; error?: string }; status?: number } }
      const responseMessage = err?.response?.data?.message || err?.response?.data?.error
      const statusCode = err?.response?.status
      const errorMessage = responseMessage || (statusCode === 401
        ? 'You need to be logged in as an admin to perform this action.'
        : statusCode === 403
          ? 'Your account is not allowed to perform this action.'
          : `Failed to save ${singular.toLowerCase()}`)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(`Delete this ${singular.toLowerCase()}?`)) return
    try {
      await adminApi.deleteListing(selectedType, id)
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

    const getFieldDefaultValue = () => {
      if (!editingItem) return ''
      const val = editingItem[field.name]
      if (val === null || val === undefined) return ''
      if (Array.isArray(val)) return val.join(', ')
      if (typeof val === 'object') {
        const asObject = val as Record<string, unknown>
        if (field.name === 'destination') {
          return (asObject.name || asObject.slug || asObject._id || '') as string
        }
        if (field.name === 'owner') {
          const firstName = typeof asObject.firstName === 'string' ? asObject.firstName : ''
          const lastName = typeof asObject.lastName === 'string' ? asObject.lastName : ''
          return `${firstName} ${lastName}`.trim() || (asObject.email as string) || (asObject._id as string) || ''
        }
        return (asObject.name || asObject.title || asObject.slug || asObject._id || '') as string
      }
      return String(val)
    }

    if (field.type === 'textarea') {
      return (
        <label key={field.name} className={wrapperClass}>
          {label}
          <textarea
            name={field.name}
            rows={4}
            required={field.required}
            placeholder={field.placeholder}
            defaultValue={getFieldDefaultValue()}
            className={className}
          />
        </label>
      )
    }
    if (field.type === 'select') {
      return (
        <label key={field.name} className={wrapperClass}>
          {label}
          <select
            name={field.name}
            required={field.required}
            defaultValue={editingItem ? getFieldDefaultValue() : field.options?.[0]?.value}
            className={className}
          >
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
      )
    }
    if (field.type === 'file') {
      const currentImage = editingItem && typeof editingItem[field.name] === 'string'
        ? (editingItem[field.name] as string)
        : ''
      return (
        <label key={field.name} className={wrapperClass}>
          {label}
          <div className="space-y-3">
            {currentImage ? (
              <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
                <img src={currentImage} alt={`Current ${label}`} className="h-32 w-full object-cover" />
              </div>
            ) : null}
            <input
              name={`${field.name}Url`}
              type="text"
              placeholder={field.placeholder ?? 'https://...'}
              defaultValue={getFieldDefaultValue()}
              className={className}
            />
            <input
              name={`${field.name}File`}
              type="file"
              accept="image/*"
              className={className}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">Provide an image URL or upload a file.</p>
          </div>
        </label>
      )
    }
    if (field.type === 'checkbox') {
      return (
        <label key={field.name} className={`flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200 md:col-span-2`}>
          <input
            type="checkbox"
            name={field.name}
            defaultChecked={editingItem ? !!editingItem[field.name] : false}
            className="h-4 w-4 rounded border-gray-300 text-safari-600 focus:ring-safari-500"
          />
          {label}
        </label>
      )
    }
    return (
      <label key={field.name} className={wrapperClass}>
        {label}
        <input
          name={field.name}
          type={field.type === 'number' ? 'number' : 'text'}
          required={field.required}
          placeholder={field.placeholder}
          defaultValue={getFieldDefaultValue()}
          min={field.min}
          max={field.max}
          step="any"
          className={className}
        />
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
            <button onClick={toggleForm}
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors">
              <Plus className="w-4 h-4" /> {showForm ? (editingItem ? 'Cancel edit' : 'Hide form') : `Add ${singular.toLowerCase()}`}
            </button>
          </div>

          {showForm && (
            <form key={editingItem?._id || 'new'} onSubmit={handleCreate} className="mt-6 grid gap-4 md:grid-cols-2">
              {fields.map(renderField)}
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center rounded-2xl bg-safari-700 px-5 py-3 text-sm font-semibold text-white hover:bg-safari-800 transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (editingItem ? `Saving...` : `Creating ${singular.toLowerCase()}...`) : (editingItem ? `Save Changes` : `Create ${singular.toLowerCase()}`)}
                </button>
                {editingItem && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem(null)
                      setShowForm(false)
                    }}
                    className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </section>

        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{rows.length} {title.toLowerCase()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">API items: {totalItems} | rows length: {rows.length} | loading: {isLoading ? 'true' : 'false'} {error ? `| error: ${(error as any)?.message || 'unknown'}` : ''}</p>
            </div>
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
                    <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">{getItemTitle(item)}</td>
                    <td className="px-5 py-4 text-gray-500">{item.status as string}</td>
                    <td className="px-5 py-4 text-gray-500">{new Date(item.createdAt as string).toLocaleDateString()}</td>
                    <td className="px-5 py-4 flex flex-wrap gap-2">
                      <button onClick={() => {
                        setEditingItem(item)
                        setShowForm(true)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }} className="inline-flex items-center gap-1 rounded-2xl bg-safari-100 hover:bg-safari-200 px-3 py-2 text-xs font-semibold text-safari-800 transition-colors">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={async () => {
                        await adminApi.updateListingStatus(selectedType, item._id as string, item.status === 'active' ? 'inactive' : 'active')
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
    { name: 'shortDescription', type: 'textarea' as const, colSpan: 2 as const, placeholder: 'Short summary shown in cards and previews' },
    { name: 'destination', required: true, placeholder: 'e.g. Maasai Mara, Serengeti, Zanzibar' },
    { name: 'category', type: 'select' as const, options: TOUR_CATEGORIES, required: true },
    { name: 'price', type: 'number' as const, required: true },
    { name: 'rating', type: 'number' as const, label: 'Rating (0-5)', placeholder: 'e.g. 4.8', min: 0, max: 5 },
    { name: 'duration', required: true, placeholder: 'e.g. 3 days' },
    { name: 'groupSize', type: 'number' as const, required: true },
    { name: 'highlights', type: 'textarea' as const, label: 'Highlights (comma or newline separated)', colSpan: 2 as const, placeholder: 'Luxury camp, Big Five, Sunrise game drive' },
    { name: 'includes', type: 'textarea' as const, label: 'Included items (comma or newline separated)', colSpan: 2 as const, placeholder: 'Park fees, Guide, Accommodation' },
    { name: 'excludes', type: 'textarea' as const, label: 'Excluded items (comma or newline separated)', colSpan: 2 as const, placeholder: 'Flights, Tips, Travel insurance' },
    { name: 'itinerary', type: 'textarea' as const, label: 'Itinerary (JSON array or one item per line)', colSpan: 2 as const, placeholder: '[{"day":1,"title":"Arrival","description":"Transfer to camp"}]' },
    { name: 'heroImage', type: 'file' as const, label: 'Image', placeholder: 'https://...' },
    { name: 'videoUrl', label: 'Video URL', placeholder: 'https://...' },
    { name: 'featured', type: 'checkbox' as const, label: 'Feature this tour' },
    { name: 'instantBooking', type: 'checkbox' as const, label: 'Allow instant booking' },
    { name: 'status', type: 'select' as const, options: [{ value: 'active', label: 'Active' }, { value: 'draft', label: 'Draft' }] },
  ],
  guides: [
    { name: 'bio', type: 'textarea' as const, required: true, colSpan: 2 as const },
    { name: 'category', type: 'select' as const, options: [
      { value: 'safari', label: 'Safari' }, { value: 'cultural', label: 'Cultural' },
      { value: 'mountain', label: 'Mountain' }, { value: 'photography', label: 'Photography' }, { value: 'city', label: 'City' },
    ], required: true },
    { name: 'avatar', type: 'file' as const, label: 'Profile Image', placeholder: 'https://...' },
    { name: 'experience', type: 'number' as const, label: 'Years of experience' },
    { name: 'dailyRate', type: 'number' as const, required: true },
    { name: 'hourlyRate', type: 'number' as const },
    { name: 'rating', type: 'number' as const, label: 'Rating (0-5)', placeholder: 'e.g. 4.8', min: 0, max: 5 },
    { name: 'verified', type: 'checkbox' as const, label: 'Verified guide' },
    { name: 'status', type: 'select' as const, options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
  ],
  accommodations: [
    { name: 'name', required: true, colSpan: 2 as const },
    { name: 'description', type: 'textarea' as const, required: true, colSpan: 2 as const },
    { name: 'destination', required: true, placeholder: 'e.g. Nairobi, Zanzibar, Maasai Mara' },
    { name: 'type', type: 'select' as const, options: [
      { value: 'hotel', label: 'Hotel' }, { value: 'lodge', label: 'Lodge' },
      { value: 'bnb', label: 'BnB' }, { value: 'resort', label: 'Resort' }, { value: 'villa', label: 'Villa' },
      { value: 'camping', label: 'Camping' }, { value: 'restaurant', label: 'Restaurant' },
    ], required: true },
    { name: 'pricePerNight', type: 'number' as const, required: true },
    { name: 'rating', type: 'number' as const, label: 'Rating (0-5)', placeholder: 'e.g. 4.8', min: 0, max: 5 },
    { name: 'heroImage', type: 'file' as const, label: 'Image', placeholder: 'https://...' },
    { name: 'status', type: 'select' as const, options: [{ value: 'active', label: 'Active' }, { value: 'draft', label: 'Draft' }] },
  ],
  transport: [
    { name: 'name', required: true, colSpan: 2 as const },
    { name: 'type', type: 'select' as const, options: [
      { value: 'bus', label: 'Bus' }, { value: 'car', label: 'Car' },
      { value: 'flight', label: 'Flight' }, { value: 'ferry', label: 'Ferry' },
    ], required: true },
    { name: 'route', required: true, placeholder: 'e.g. Nairobi - Maasai Mara' },
    { name: 'price', type: 'number' as const, required: true },
    { name: 'duration', required: true, placeholder: 'e.g. 5 hours' },
    { name: 'description', type: 'textarea' as const, required: true, colSpan: 2 as const },
    { name: 'image', type: 'file' as const, label: 'Image', placeholder: 'https://...' },
    { name: 'status', type: 'select' as const, options: [{ value: 'active', label: 'Active' }, { value: 'draft', label: 'Draft' }, { value: 'inactive', label: 'Inactive' }] },
  ],
  destinations: [
    { name: 'name', required: true, colSpan: 2 as const },
    { name: 'country', type: 'select' as const, options: [{ value: 'kenya', label: 'Kenya' }, { value: 'tanzania', label: 'Tanzania' }], required: true },
    { name: 'rating', type: 'number' as const, label: 'Rating (0-5)', placeholder: 'e.g. 4.8', min: 0, max: 5 },
    { name: 'shortDescription', type: 'textarea' as const, colSpan: 2 as const },
    { name: 'description', type: 'textarea' as const, required: true, colSpan: 2 as const },
    { name: 'heroImage', type: 'file' as const, label: 'Image', placeholder: 'https://...' },
    { name: 'featured', type: 'checkbox' as const, label: 'Mark as featured destination (shows on home page)' },
    { name: 'status', type: 'select' as const, options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
  ],
}
