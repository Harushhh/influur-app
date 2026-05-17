'use server'

import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function createCampaign(formData: FormData) {
  // Extract all the data from the form
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const budgetRange = formData.get('budgetRange') as string
  const minFollowers = parseInt(formData.get('minFollowers') as string) || 0
  
  // Convert comma-separated strings into arrays
  const deliverablesString = formData.get('deliverables') as string
  const deliverables = deliverablesString.split(',').map((d) => d.trim()).filter(Boolean)
  
  const targetNicheString = formData.get('targetNiche') as string
  const targetNiche = targetNicheString.split(',').map((n) => n.trim()).filter(Boolean)

  // NOTE: In a real app, you would get the authenticated user's ID here.
  // For testing, we will automatically create a test BRAND user if one doesn't exist.
  let brandUser = await prisma.user.findFirst({ where: { role: 'BRAND' } })
  
  if (!brandUser) {
    brandUser = await prisma.user.create({
      data: {
        email: 'hello@testbrand.com',
        name: 'Test Brand Inc.',
        role: 'BRAND',
      }
    })
  }

  // Save the new campaign to the database
  await prisma.campaign.create({
    data: {
      brandId: brandUser.id,
      title,
      description,
      budgetRange,
      minFollowers,
      deliverables,
      targetNiche,
      status: 'PUBLISHED',
    }
  })

  // Redirect the user back to a dashboard or success page
  redirect('/brand/dashboard')
}

export async function submitApplication(formData: FormData) {
  const campaignId = formData.get('campaignId') as string
  const coverLetter = formData.get('coverLetter') as string
  const proposedRate = parseFloat(formData.get('proposedRate') as string) || 0

  // 1. Get our test Creator/Influencer user (simulating an active session)
  let creatorUser = await prisma.user.findFirst({ where: { role: 'CREATOR' } })
  
  if (!creatorUser) {
    creatorUser = await prisma.user.create({
      data: {
        email: 'creator@testinfluur.com',
        name: 'Alex Creator',
        role: 'CREATOR',
        username: 'alex_creators',
      }
    })
  }

  // 2. Save the application entry to the database
  await prisma.application.create({
    data: {
      campaignId,
      creatorId: creatorUser.id,
      coverLetter,
      proposedRate,
      status: 'PENDING'
    }
  })

  // 3. Refresh the page data so the system shows they have applied
  // In Next.js, we revalidate the layout to update the UI data seamlessly
  const { revalidatePath } = require('next/cache')
  revalidatePath('/influencer/marketplace')
}