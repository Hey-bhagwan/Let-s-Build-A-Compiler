// app/api/modernize/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = (body && body.text) || "";
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const system = `You are an assistant that modernizes compiler-writing text from the 1970s into current terminology.
Return strictly valid JSON with keys:
- "modern" (string): the modernized text (preserve meaning).
- "mappings" (array): each item { "old": "<original phrase>", "modern": "<modern phrase>", "explanation": "<one-sentence explanation>" }.
Return only valid JSON in the response body.`;

    const user = `Text:
\`\`\`
${text}
\`\`\`
Return only valid JSON.`;

    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini", // change to whichever model you have access to
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      max_tokens: 1000
    });

    const content = resp.choices?.[0]?.message?.content ?? "";
    // Try to parse JSON robustly
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      // try to extract JSON substring
      const match = content.match(/\{[\s\S]*\}$/m) || content.match(/\[[\s\S]*\]/m);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        // fallback: return modern as plain text
        parsed = { modern: content, mappings: [] };
      }
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("modernize error:", err);
    return NextResponse.json({ error: "Server error", details: String(err) }, { status: 500 });
  }
}
