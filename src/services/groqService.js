
import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = "llama-3.1-8b-instant";


const callGroq = async (messages, temperature = 0.3, maxTokens = 1024) => {
  try {
    console.log(" Calling Groq AI...");

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    const responseText = completion.choices[0]?.message?.content || "";
    console.log(" Response from Groq:", responseText);

    return responseText;
  } catch (error) {
    console.error(" Error calling Groq:", error.message);
    throw error;
  }
};


const analyzeToxicity = async (text) => {
  console.log("Analyzing content with Groq...");

  const prompt = `
Analyze the following text for toxicity.

Text:
"""
${text}
"""

Respond ONLY with valid JSON:
{
  "is_toxic": boolean,
  "toxicity_score": number,
  "categories": [],
  "severity": "low" | "medium" | "high" | "critical",
  "explanation": string
}`;

  try {
    const response = await callGroq([{ role: "user", content: prompt }], 0.5, 2048);

    const cleaned = response.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleaned);

    return result;
  } catch (error) {
    console.error("Toxicity parsing failed:", error.message);
    return {
      is_toxic: false,
      toxicity_score: 0,
      categories: [],
      severity: "low",
      explanation: "Parsing error",
    };
  }
};


const analyzeSentiment = async (text) => {
  console.log("Analyzing sentiment with Groq...");

  const prompt = `
Analyze sentiment.

Text:
"""
${text}
"""

Respond ONLY with valid JSON:
{
  "sentiment": "positive" | "negative" | "neutral" | "mixed",
  "confidence": number,
  "emotions": [],
  "tone": string
}`;

  try {
    const response = await callGroq([{ role: "user", content: prompt }], 0.5, 2048);
    const cleaned = response.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Sentiment parsing failed:", error.message);
    return {
      sentiment: "neutral",
      confidence: 0,
      emotions: [],
      tone: "unknown",
    };
  }
};


const summarizeText = async (text, length = "short") => {
  console.log("Summarizing text with Groq...");

  const lengthMap = {
    short: "1-2 sentences",
    medium: "3-4 sentences",
    long: "5-7 sentences",
  };

  const prompt = `
Summarize the following text in ${lengthMap[length]}.

Text:
"""
${text}
"""
`;

  try {
    const response = await callGroq([{ role: "user", content: prompt }], 0.4, 300);
    return response.trim();
  } catch (error) {
    console.error("Summary failed:", error.message);
    return "Summary unavailable";
  }
};


const detectLanguage = async (text) => {
  console.log("Detecting language with Groq...");

  const prompt = `
Detect the language. Respond ONLY with ISO code.

Text:
"""
${text}
"""
`;

  try {
    const response = await callGroq([{ role: "user", content: prompt }], 0.1, 10);
    return response.trim().toLowerCase();
  } catch {
    return "en";
  }
};


const extractKeywords = async (text, maxKeywords = 10) => {
  console.log("Extracting keywords with Groq...");

  const prompt = `
Extract keywords.

Text:
"""
${text}
"""

Respond ONLY with valid JSON:
{
  "keywords": []
}
`;

  try {
    const response = await callGroq([{ role: "user", content: prompt }], 0.3, 300);
    const cleaned = response.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return (parsed.keywords || []).slice(0, maxKeywords);
  } catch (error) {
    console.error("Keyword parsing failed:", error.message);
    return text
      .split(/\s+/)
      .filter(w => w.length > 4)
      .slice(0, maxKeywords);
  }
};


const analyzeContent = async (text) => {
  console.log("Performing comprehensive analysis...");
  const start = Date.now();

  const [
    toxicityResult,
    sentimentResult,
    summaryText,
    keywordsList,
    languageCode,
  ] = await Promise.all([
    analyzeToxicity(text),
    analyzeSentiment(text),
    summarizeText(text, "short"),
    extractKeywords(text, 10),
    detectLanguage(text),
  ]);

  return {
    toxicity: toxicityResult,
    sentiment: sentimentResult,
    summary: summaryText,
    keywords: keywordsList,
    language: languageCode,
    processingTime: Date.now() - start,
    model: MODEL,
  };
};


export default {
  analyzeToxicity,
  analyzeSentiment,
  summarize: summarizeText,
  extractKeywords,
  detectLanguage,
  analyzeContent,
};
