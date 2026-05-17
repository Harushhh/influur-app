import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { updateApplicationStatus } from '@/app/actions/application'

export default async function CampaignDetailsPage({ params }: { params: { id: string } }) {
  // Fetch the specific campaign and all its applications (including the creator's details)
  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: {
      applications: {
        include: {
          creator: true // Fetch the user data of the influencer who applied
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!campaign) {
    return <div className="p-12 text-center text-gray-500">Campaign not found.</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link href="/brand/dashboard" className="text-sm font-medium text-blue-600 hover:underline">
            &larr; Back to Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Campaign Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{campaign.title}</h1>
              <p className="mt-2 text-gray-600 max-w-3xl">{campaign.description}</p>
            </div>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
              {campaign.status}
            </span>
          </div>
          <div className="mt-6 flex gap-8 text-sm text-gray-700">
            <div><span className="font-semibold text-gray-900">Budget:</span> {campaign.budgetRange}</div>
            <div><span className="font-semibold text-gray-900">Min Followers:</span> {campaign.minFollowers.toLocaleString()}</div>
            <div><span className="font-semibold text-gray-900">Total Applicants:</span> {campaign.applications.length}</div>
          </div>
        </div>

        {/* Applications List */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Creator Pitches</h2>
        
        {campaign.applications.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
            <p className="mt-1 text-gray-500">When creators apply to this campaign, their pitches will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {campaign.applications.map((app) => (
              <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-6">
                
                {/* Creator Info Sidebar */}
                <div className="md:w-1/4 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                      {app.creator.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{app.creator.name}</p>
                      <p className="text-xs text-gray-500">@{app.creator.username || 'creator'}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm">
                    <p className="text-gray-500 mb-1">Proposed Rate:</p>
                    <p className="font-bold text-gray-900 text-lg">${app.proposedRate}</p>
                  </div>
                </div>

                {/* Pitch & Actions */}
                <div className="md:w-3/4 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">Cover Letter</h4>
                    <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed mb-6">
                      {app.coverLetter}
                    </p>
                  </div>

                  {/* Accept/Reject Buttons */}
                  <div className="flex items-center gap-4 mt-auto pt-4 border-t border-gray-50">
                    {app.status === 'PENDING' ? (
                      <>
                        <form action={updateApplicationStatus} className="w-1/2">
                          <input type="hidden" name="applicationId" value={app.id} />
                          <input type="hidden" name="campaignId" value={campaign.id} />
                          <input type="hidden" name="status" value="ACCEPTED" />
                          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                            Accept Pitch
                          </button>
                        </form>
                        <form action={updateApplicationStatus} className="w-1/2">
                          <input type="hidden" name="applicationId" value={app.id} />
                          <input type="hidden" name="campaignId" value={campaign.id} />
                          <input type="hidden" name="status" value="REJECTED" />
                          <button type="submit" className="w-full bg-white border border-red-200 hover:bg-red-50 text-red-600 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                            Decline
                          </button>
                        </form>
                      </>
                    ) : (
                      <div className={`px-4 py-2 rounded-lg text-sm font-bold ${
                        app.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {app.status === 'ACCEPTED' ? '✓ You hired this creator' : '✕ Application Declined'}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}