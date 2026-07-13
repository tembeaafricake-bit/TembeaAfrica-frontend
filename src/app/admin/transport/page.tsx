'use client'

import { AdminContentManager, ADMIN_FIELD_CONFIGS } from '@/components/admin/AdminContentManager'

export default function AdminTransportPage() {
  return (
    <AdminContentManager
      title="Transport Services"
      description="Manage private and shared transport listings including shuttles, airport transfers, charters and ferries."
      type="transport"
      singular="Transport"
      fields={ADMIN_FIELD_CONFIGS.transport}
    />
  )
}
