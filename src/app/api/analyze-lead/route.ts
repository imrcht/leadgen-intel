import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { lead } = await req.json();

    if (!lead) {
      return NextResponse.json({ error: 'Lead is required' }, { status: 400 });
    }

    const prompt = `
You are an expert digital marketing and business consultant. 
Analyze the following business lead:
Company Name: ${lead.businessName}
Niche/Industry: ${lead.niche || 'Unknown'}
Website: ${lead.website || 'No website provided'}
Address: ${lead.address || 'Unknown'}
Rating: ${lead.rating || 'N/A'} (${lead.reviewCount || 0} reviews)
${lead.scoreBreakdown ? 'Current Score Details: ' + JSON.stringify(lead.scoreBreakdown) : ''}

Please provide a detailed analysis covering the following points:
1. Overall Company Analysis: A brief analysis of the company based on its niche and available information.
2. Website Rating & Analysis: Give a rating to the company's website (if available, you can judge based on typical factors in their industry, or note if they lack one) and analyze its potential quality.
3. Service Provider Opportunity: Analyze whether a service provider (like a web developer, marketer, or SEO expert) could help improve their online presence or website, or if it seems they are already doing well according to their industry standards.

Provide the output in a clear, formatted JSON object with the following structure:
{
  "companyAnalysis": "...",
  "websiteRating": "...",
  "opportunityAnalysis": "..."
}
`;

    const openAiApiKey = process.env.OPENAI_API_KEY;
    const openAiBaseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

    if (!openAiApiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const response = await fetch(`${openAiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAiApiKey}`,
      },
      body: JSON.stringify({
        model: 'auto', // Assuming freellmapi supports this or uses default
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LLM API Error:', errorText);
      return NextResponse.json({ error: 'Failed to fetch analysis from LLM' }, { status: response.status });
    }

    const data = await response.json();
    let content = data.choices[0].message.content;

    // Clean up potential markdown code blocks returned by the LLM
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const parsedContent = JSON.parse(content);

    return NextResponse.json({ analysis: parsedContent });
  } catch (error) {
    console.error('Analyze lead error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
