const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function analyzeReport(report) {
  const prompt = `
  You are an expert web performance & carbon audit analyzer.
  Given the following report JSON, generate a clear analysis:
  - Summarize the key findings.
  - Mention exact metric values.
  - Highlight critical issues.
  - Suggest 3 improvements.
  Report JSON: ${JSON.stringify(report)}
  `;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content;
}

module.exports = { analyzeReport };
