'use client'

import { AdminContentManager, ADMIN_FIELD_CONFIGS } from '@/components/admin/AdminContentManager'

export default function AdminGuidesPage() {
  return (
    <AdminContentManager
      title="Guides"
      description="Manage local guides — safari experts, cultural guides, mountain climbers and more."
      type="guides"
      singular="Guide"
      fields={ADMIN_FIELD_CONFIGS.guides}
    />
  )
}
