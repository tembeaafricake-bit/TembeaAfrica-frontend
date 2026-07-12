'use client'

import { AdminContentManager, ADMIN_FIELD_CONFIGS } from '@/components/admin/AdminContentManager'

export default function AdminStaysPage() {
  return (
    <AdminContentManager
      title="Stays & Accommodations"
      description="Manage hotels, lodges, BnBs, resorts, villas, restaurants and other hospitality listings across Kenya and Tanzania."
      type="accommodations"
      singular="Stay"
      fields={ADMIN_FIELD_CONFIGS.accommodations}
    />
  )
}
