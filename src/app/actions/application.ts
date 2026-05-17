'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateApplicationStatus(formData: FormData) {
  const applicationId = formData.get('applicationId') as string
  const newStatus = formData.get('status') as 'ACCEPTED' | 'REJECTED'
  const campaignId = formData.get('campaignId') as string

  // Update the application status in the database
  await prisma.application.update({
    where: { id: applicationId },
    data: { status: newStatus }
  })

  // Refresh the specific campaign page so the UI updates instantly
  revalidatePath(`/brand/campaigns/${campaignId}`)
}