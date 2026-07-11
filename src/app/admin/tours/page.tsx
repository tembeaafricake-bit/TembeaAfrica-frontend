'use client'

import { AdminContentManager, ADMIN_FIELD_CONFIGS } from '@/components/admin/AdminContentManager'

export default function AdminToursPage() {
  return (
    <AdminContentManager
      title="Tours & Safaris"
      description="Add and manage safari tours, beach excursions, mountain treks and cultural experiences."
      type="tours"
      singular="Tour"
      fields={ADMIN_FIELD_CONFIGS.tours}
    />
  )
}
