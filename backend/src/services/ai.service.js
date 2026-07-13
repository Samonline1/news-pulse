const dotenv = require("dotenv");

dotenv.config({ path: require("path").resolve(__dirname, "../../.env") });

function normalizeSummary(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function buildSummaryPrompt(articles) {
  const articleLines = articles
    .slice(0, 5)
    .map((article, index) => {
      const title = article.title || "";
      const summary = article.summary || "";
      return `${index + 1}. ${title}${summary ? ` - ${summary}` : ""}`;
    })
    .join("\n");

  return (
    "Generate a concise news summary of the provided related articles.\n" +
    "Requirements:\n" +
    "- 80-120 words\n" +
    "- Professional news style\n" +
    "- Mention major events only\n" +
    "- No markdown\n" +
    "- No bullet points\n" +
    "- Return only the summary\n\n" +
    `Articles:\n${articleLines}`
  );
}

async function generateSummary(articles) {
  const apiKey = process.env.GROQ_API_KEY;
  const model = (process.env.GROQ_MODEL || "").trim() || "llama-3.3-70b-versatile";

  if (!apiKey) {
    console.log("[AI] GROQ_API_KEY missing");
    throw new Error("GROQ_API_KEY missing");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 220,
      messages: [
        {
          role: "user",
          content: buildSummaryPrompt(articles),
        },
      ],
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Groq request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content || "";
  const summary = normalizeSummary(content);

  if (!summary) {
    throw new Error("Empty summary returned by Groq");
  }

  return summary;
}

module.exports = {
  generateSummary,
};
