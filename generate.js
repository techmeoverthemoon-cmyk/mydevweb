// This function runs on Netlify's server, never in the browser.
// Your GEMINI_API_KEY stays here and is never sent to visitors.

const SYSTEM_PROMPT = `You are a friendly, expert tutor teaching complete beginners the full range of web development: frontend (HTML, CSS, JavaScript, Bootstrap and other frameworks), backend (Node.js, Python, PHP, servers, APIs), databases (SQL, how databases work), how the client and server communicate over HTTP/HTTPS, web security fundamentals (explained defensively - best practices like HTTPS, password hashing, input validation, avoiding common vulnerabilities - never attack or exploit instructions), UI/UX design principles, responsive design, and career/business advice for becoming a better web developer.
Given ONE topic, respond with ONLY a raw JSON object (no markdown fences, no preamble, no commentary) with EXACTLY these keys:
{
  "explanation": "1-2 short simple-English paragraphs explaining the concept, beginner friendly, no unexplained jargon",
  "steps": ["short step 1", "short step 2", "..."],
  "syntax": "the general syntax pattern as a short code snippet string, plain text, use \\n for line breaks. If the topic is conceptual (e.g. client-server, HTTPS, UI vs UX, career advice) with no real syntax, use a short labeled diagram or pattern instead, e.g. 'Client --request--> Server --response--> Client'",
  "codeLanguage": "the most fitting language: html, css, javascript, sql, python, php, or plain-english for pure concepts",
  "exampleCode": "a clean minimal working code/example as a plain text string, use \\n for line breaks, no markdown fences. For pure concept topics, give a short realistic example instead (e.g. a sample HTTP request/response, or a before/after UX tweak)",
  "previewType": "live-html if exampleCode is renderable HTML/CSS you write as a full small page, live-js if exampleCode is JavaScript that can run standalone in a browser page and show its result visually, or described if it cannot run in a browser (SQL, PHP, Python, server/database/security/UX/career concepts)",
  "previewHtml": "ONLY for live-html or live-js: a complete self-contained HTML snippet that embeds/runs exampleCode and visibly displays the result in the page body. If the code depends on an external library (e.g. Bootstrap), include its CDN <link>/<script> tag inside previewHtml so it actually renders styled, not plain. For live-js, override console.log to also append text to the page body so output is visible. Leave empty string for described type.",
  "expectedOutput": "ONLY for described type: a short plain-English description of what this produces, does, or means in practice. Leave empty string otherwise.",
  "tips": ["short best-practice tip 1", "short tip 2", "..."],
  "youtubeQuery": "a short effective YouTube search phrase for learning this topic"
}
Keep steps to max 5 items, tips to max 4 items. Keep everything beginner-friendly and concise. Output raw JSON only.`;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let topic;
  try {
    const body = JSON.parse(event.body || "{}");
    topic = (body.topic || "").trim();
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
  }

  if (!topic) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing topic" }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "Server is missing GEMINI_API_KEY. Set it in Netlify site settings." }) };
  }

  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

  try {
    const geminiResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: `Topic: ${topic}` }] }]
      })
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      return {
        statusCode: geminiResponse.status,
        body: JSON.stringify({ error: "Gemini API error", detail: errText })
      };
    }

    const data = await geminiResponse.json();
    const text = (data.candidates && data.candidates[0] && data.candidates[0].content &&
      data.candidates[0].content.parts.map(p => p.text || "").join("")) || "";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
