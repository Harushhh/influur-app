import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { mode, context, prompt, messages } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing Gemini API Key' }, { status: 401 })
    }

    // Determine the AI's instruction based on what part of the app is calling it
    let systemPrompt = "You are an expert influencer marketing strategist."
    let isJson = false

    if (mode === 'analyze') {
      systemPrompt = "Analyze this influencer profile data and provide a concise summary, 3 strengths, 2 risks, a recommended budget, and a brand fit score out of 100. Return ONLY valid JSON matching this exact structure: {\"summary\": \"...\", \"brandFitScore\": 85, \"topStrengths\": [\"...\"], \"risks\": [\"...\"], \"recommendedBudget\": \"...\"}. Do not include markdown formatting."
      isJson = true
    } else if (mode === 'outreach') {
      systemPrompt = "Write a short, engaging, and professional initial outreach email to an influencer for a brand sponsorship. Do not include subject line in the body. Start with 'Hi [Name],'. Keep it under 4 paragraphs. Be highly persuasive."
    } else if (mode === 'suggest_caption') {
      systemPrompt = "Generate 3 different engaging Instagram captions based on the context. Return ONLY valid JSON matching this structure: {\"captions\": [{\"style\": \"Funny\", \"caption\": \"...\", \"hashtags\": [\"#a\"]} ]}. Do not include markdown formatting."
      isJson = true
    }

    // Construct the full prompt for Gemini
    let fullText = `${systemPrompt}\n\n`
    if (context) fullText += `Context: ${JSON.stringify(context)}\n\n`

    if (messages && messages.length > 0) {
       const chatHistory = messages.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join('\n')
       fullText += `Chat History:\n${chatHistory}\n\n`
    } else if (prompt) {
       fullText += `Prompt: ${prompt}`
    }

    // Call the free Google Gemini API using the latest Gemini 3 Flash model!
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullText }] }],
        generationConfig: { temperature: 0.7 }
      })
    })

    const data = await response.json()
    
    if (data.error) throw new Error(data.error.message)

    let resultText = data.candidates[0].content.parts[0].text
    
    // Clean up markdown if the AI accidentally included it around the JSON
    if (isJson) {
        resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim()
    }

    // Format the response properly for the front-end
    let finalResult: any = resultText
    if (isJson) {
      try { finalResult = JSON.parse(resultText) } catch (e) { console.error("JSON Parse failed") }
    } else if (mode === 'chat') {
       finalResult = { message: resultText }
    }

    return NextResponse.json({ result: finalResult })

  } catch (err: any) {
    console.error('💥 AI Error:', err.message)
    return NextResponse.json({ error: 'AI failed to process request' }, { status: 500 })
  }
}