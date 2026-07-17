import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Check if GEMINI_API_KEY is missing or is the default placeholder
    if (!apiKey || apiKey === 'your_api_key_here' || apiKey.trim() === '') {
      console.error('Error: GEMINI_API_KEY is missing or not configured.');
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY is missing from the server environment configuration.' },
        { status: 500 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body.' },
        { status: 400 }
      );
    }

    const { keywords, businessName, stars, toneDescriptor } = body;

    // Check if keywords are missing or empty
    if (!keywords || (Array.isArray(keywords) && keywords.length === 0) || (typeof keywords === 'string' && keywords.trim() === '')) {
      return NextResponse.json(
        { success: false, error: 'Keywords are required to generate a review.' },
        { status: 400 }
      );
    }

    // Standardize keywords to string representation
    const keywordsStr = Array.isArray(keywords) ? keywords.join(', ') : keywords;

    // Initialize the official Gemini SDK
    const ai = new GoogleGenAI({ apiKey });

    // Build the prompt for 3 drafts
    const prompt = `You are three different customer personas writing three unique, distinct Google reviews for a business named "${businessName || 'the business'}".
Your reviews must be based on these keywords: ${keywordsStr}.
Each review must reflect a ${stars || 5}-star experience and match a tone that is ${toneDescriptor || 'honest and appreciative'}.

Follow these strict constraints for each review:
1. Length & Structure:
- Write approximately 50 to 90 words.
- Use exactly 2, 3, or 4 sentences. Choose the sentence count dynamically (vary it between the reviews).
- Vary sentence structures. Do not start sentences the same way.
- Vary the review lengths naturally.

2. Tone & Style:
- Sound like a genuine Google review written by a real human customer.
- Use natural, everyday human wording. Avoid excessively formal, overly polished, or artificial language.
- Avoid excessive enthusiasm, hyperbole, or exclamation marks (use at most one exclamation mark, or none per review).
- NEVER mention AI, prompts, or generating content.
- Include minor imperfections occasionally (e.g. casual grammar, natural run-ons, or lowercase phrasing) to resemble real human reviews.
- Ensure all 3 reviews are completely unique, use different words, different phrasing, and feel like they were written by three completely different people.

3. Prohibited Phrases:
- DO NOT use generic AI clichés. In particular, do not use any of the following:
  * "absolute gem"
  * "out of this world"
  * "taste buds are singing"
  * "everyone needs to experience"
  * "premium experience"
  * "highly recommend to everyone"
  * "from start to finish"
  * "cannot recommend enough"
  * "game changer"

4. Diversity:
- Make each of the three reviews unique. Do not repeat standard templates or formulaic review patterns.

Output the three reviews ONLY as a raw JSON array of three strings. For example:
[
  "First unique review draft here.",
  "Second unique review draft here.",
  "Third unique review draft here."
]

Do not wrap the JSON output in markdown code blocks. Output ONLY the raw JSON array.`;

    // Request text generation from gemini-2.0-flash with temperature set for variety
    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          temperature: 1.0,
        },
      });
    } catch (apiError: any) {
      console.warn('Gemini API Quota/Network failure, falling back to local review builder:', apiError.message || apiError);
      
      const firstTag = Array.isArray(keywords) && keywords[0] ? keywords[0].toLowerCase() : (stars <= 2 ? 'service issues' : 'service');
      const secondTag = Array.isArray(keywords) && keywords[1] ? keywords[1].toLowerCase() : (stars <= 2 ? 'handling' : 'experience');
      const thirdTag = Array.isArray(keywords) && keywords[2] ? keywords[2].toLowerCase() : (stars <= 2 ? 'frustrating aspect' : 'overall quality');

      const fallbacks = stars <= 2 ? [
        `Extremely disappointed with my visit to ${businessName || 'the business'}. The ${firstTag} was highly unsatisfactory, and the ${secondTag} made the whole visit frustrating. I hope they fix this soon.`,
        `Disappointed with ${businessName || 'the business'}. We experienced major issues with the ${firstTag} and ${secondTag}. The quality was definitely not up to the mark.`,
        `Had a subpar experience here. The ${thirdTag} really fell short of expectations, and the overall experience was lacking.`
      ] : [
        `I had a great experience at ${businessName || 'the business'}. The ${firstTag} was outstanding, and the ${secondTag} was perfect. Everything was handled professionally and the quality was top-notch!`,
        `Really happy with my visit to ${businessName || 'the business'}. The ${firstTag} and ${secondTag} made our day. Service was quick and efficient. Will definitely be returning!`,
        `A solid 5-star experience. The ${thirdTag} really stood out and the team went above and beyond to make us comfortable.`
      ];

      return NextResponse.json({
        success: true,
        reviews: fallbacks,
        fallback: true
      });
    }

    let reviewText = response.text || '';
    reviewText = reviewText.trim();

    // Clean up any markdown code block wrappers
    if (reviewText.startsWith('```json')) {
      const lastIndex = reviewText.lastIndexOf('```');
      if (lastIndex > 7) {
        reviewText = reviewText.substring(7, lastIndex).trim();
      } else {
        reviewText = reviewText.substring(7).trim();
      }
    } else if (reviewText.startsWith('```')) {
      const lastIndex = reviewText.lastIndexOf('```');
      if (lastIndex > 3) {
        reviewText = reviewText.substring(3, lastIndex).trim();
      } else {
        reviewText = reviewText.substring(3).trim();
      }
    }

    let reviews: string[] = [];
    try {
      reviews = JSON.parse(reviewText);
      if (!Array.isArray(reviews) || reviews.length === 0) {
        throw new Error('Parsed result is not a non-empty array');
      }
    } catch (e) {
      console.warn('JSON parsing failed, falling back to split parsing:', e);
      // Fallback: Try regex matching for quoted strings
      const matches = reviewText.match(/"([^"\\]|\\.)*"/g);
      if (matches && matches.length >= 3) {
        reviews = matches.map(m => m.slice(1, -1));
      } else {
        // Fallback: split by draft indicators or newlines
        reviews = reviewText
          .split(/\n+/)
          .map(line => line.replace(/^\d+[\.\-\s]+/, '').replace(/^Draft\s+\d+[\.\-\s:]+/, '').trim())
          .filter(line => line.length > 20);
      }
    }

    // Ensure we have exactly 3 reviews
    if (reviews.length < 3) {
      const fallbacks = [
        `I had an excellent experience at ${businessName || 'the business'}. The staff was incredibly helpful and the ${keywordsStr} exceeded expectations. I'll definitely be back.`,
        `Really happy with my visit. Very fast service, and the quality of ${keywordsStr} was great. Highly recommend giving them a try!`,
        `A solid choice for ${keywordsStr}. Service was friendly and the environment was clean and welcoming. Smooth experience.`
      ];
      while (reviews.length < 3) {
        reviews.push(fallbacks[reviews.length] || `Great service and quality ${keywordsStr}. Very satisfied.`);
      }
    }
    reviews = reviews.slice(0, 3);

    return NextResponse.json({
      success: true,
      reviews: reviews,
    });

  } catch (error: any) {
    console.error('Gemini API Integration Failure:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate review content via Gemini.' },
      { status: 500 }
    );
  }
}
