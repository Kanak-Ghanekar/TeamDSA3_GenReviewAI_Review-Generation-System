import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { success: false, error: 'Review text is required.' },
        { status: 400 }
      );
    }

    // Call the Python FastAPI NLP engine
    const nlpUrl = process.env.NLP_API_URL || 'http://127.0.0.1:8000';
    const res = await fetch(`${nlpUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'FastAPI analysis failed');
    }

    const data = await res.json();

    return NextResponse.json({
      success: true,
      analysis: data
    });

  } catch (error: any) {
    console.error('NLP Proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'NLP analysis service is offline or unavailable.' },
      { status: 502 }
    );
  }
}
