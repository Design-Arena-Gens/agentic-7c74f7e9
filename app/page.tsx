'use client'

import { useState } from 'react'

interface Lead {
  name: string
  url: string
  description: string
  contact?: string
}

export default function Home() {
  const [industry, setIndustry] = useState('')
  const [location, setLocation] = useState('')
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const scrapeLeads = async () => {
    if (!industry.trim()) {
      setError('Please enter an industry')
      return
    }

    setLoading(true)
    setError('')
    setLeads([])

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ industry, location }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scrape leads')
      }

      setLeads(data.leads)
    } catch (err: any) {
      setError(err.message || 'An error occurred while scraping')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (leads.length === 0) return

    const headers = ['Name', 'URL', 'Description', 'Contact']
    const rows = leads.map(lead => [
      lead.name,
      lead.url,
      lead.description,
      lead.contact || 'N/A'
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads_${industry}_${Date.now()}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-indigo-900 mb-3">
            🤖 AI Lead Scraper Agent
          </h1>
          <p className="text-lg text-gray-700">
            Find leads in any industry - 100% FREE, no API costs
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Industry / Business Type *
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., restaurants, dentists, real estate agents"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location (Optional)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., New York, California"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={scrapeLeads}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition duration-200 transform hover:scale-105 disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Scraping leads...
              </span>
            ) : (
              '🔍 Find Leads'
            )}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {leads.length > 0 && (
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Found {leads.length} Leads
              </h2>
              <button
                onClick={exportToCSV}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
              >
                📥 Export to CSV
              </button>
            </div>

            <div className="space-y-4">
              {leads.map((lead, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition duration-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-indigo-900">
                      {lead.name}
                    </h3>
                    {lead.contact && (
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                        Contact Available
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{lead.description}</p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={lead.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                    >
                      🔗 {lead.url}
                    </a>
                    {lead.contact && (
                      <span className="text-gray-700 text-sm">
                        📧 {lead.contact}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>
            ✅ 100% Free • ✅ No API Costs • ✅ Unlimited Searches
          </p>
          <p className="mt-2 text-xs">
            This tool scrapes publicly available data from search engines and business directories
          </p>
        </div>
      </div>
    </main>
  )
}
