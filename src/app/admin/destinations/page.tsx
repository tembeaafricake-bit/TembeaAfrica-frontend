'use client'

import { AdminContentManager, ADMIN_FIELD_CONFIGS } from '@/components/admin/AdminContentManager'

export default function AdminDestinationsPage() {
  return (
    <AdminContentManager
      title="Destinations"
      description="Manage destination listings, publish new locations, and set featured/popular status."
      type="destinations"
      singular="Destination"
      fields={ADMIN_FIELD_CONFIGS.destinations}
    />
  )
}
