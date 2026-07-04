import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
const port = process.env.PORT || 5174;
const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

app.use(cors());
app.use(express.json({ limit: "1mb" }));

function requireFields(body, fields) {
  const missing = fields.filter((field) => !String(body[field] || "").trim());
  if (missing.length > 0) {
    const error = new Error(`Missing required fields: ${missing.join(", ")}`);
    error.status = 400;
    throw error;
  }
}

async function callGemini(prompt) {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error("GEMINI_API_KEY is missing. Add it to .env before using AI features.");
    error.status = 500;
    throw error;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.75,
        topP: 0.9,
        maxOutputTokens: 1600
      }
    })
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = payload.error?.message || "Gemini request failed.";
    const error = new Error(detail);
    error.status = response.status;
    throw error;
  }

  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n").trim();

  if (!text) {
    const error = new Error("Gemini returned an empty response.");
    error.status = 502;
    throw error;
  }

  return text;
}

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    model,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    firebaseProject: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || null
  });
});

app.post("/api/generate-itinerary", async (req, res, next) => {
  try {
    requireFields(req.body, ["destination", "days", "budget", "interests", "travelStyle", "language"]);
    const { destination, days, budget, interests, travelStyle, language } = req.body;
    const prompt = `You are DestinGo AI, a responsible cultural travel planner.
Create a personalized cultural travel itinerary for:
Destination: ${destination}
Duration: ${days}
Budget: ${budget}
Interests: ${interests}
Travel Style: ${travelStyle}
Language: ${language}
Include:
1. Day-wise itinerary
2. Famous attractions
3. Hidden gems
4. Local food suggestions
5. Cultural etiquette tips
6. Local events or cultural experiences
7. Estimated budget breakdown
8. Safety and respect notes
Keep it practical, culturally respectful, and useful for a real traveler.
Do not generate fake places. If exact timings or prices may change, say the user should verify locally.
Return the response in clear sections.`;

    const text = await callGemini(prompt);
    res.json({ text });
  } catch (error) {
    next(error);
  }
});

app.post("/api/generate-story", async (req, res, next) => {
  try {
    requireFields(req.body, ["placeName", "city", "description", "language", "mode"]);
    const { placeName, city, description, language, mode } = req.body;
    const prompt = `You are an immersive cultural storyteller.
Create a short, engaging travel story for:
Place: ${placeName}
City: ${city}
Description: ${description}
Language: ${language}
Mode: ${mode}
The story should feel cinematic and emotional.
Include heritage, local culture, sounds, colors, people, and history.
Keep it respectful and suitable for travelers.
Do not invent harmful or misleading historical facts.
If unsure, keep the story general and clearly cultural.`;

    const text = await callGemini(prompt);
    res.json({ text });
  } catch (error) {
    next(error);
  }
});

app.post("/api/culture-respect", async (req, res, next) => {
  try {
    requireFields(req.body, ["destination", "placeType", "language"]);
    const { destination, placeType, language } = req.body;
    const prompt = `You are DestinGo AI's Culture Respect Meter.
Create practical respectful travel guidance for:
Destination: ${destination}
Place type: ${placeType}
Language: ${language}
Include:
1. What to wear
2. What to avoid
3. Greeting and local behavior
4. Photography rules and consent reminders
5. Respectful travel tips
Be specific where culturally appropriate, and tell travelers to verify rules locally when they may change.`;

    const text = await callGemini(prompt);
    res.json({ text });
  } catch (error) {
    next(error);
  }
});


app.post("/api/chat", async (req, res, next) => {
  try {
    requireFields(req.body, ["message", "destination", "language"]);
    const { message, destination, language, interests, history = [] } = req.body;
    const recentHistory = Array.isArray(history)
      ? history
          .slice(-8)
          .map((item) => `${item.role === "assistant" ? "Assistant" : "Traveler"}: ${String(item.content || "").slice(0, 700)}`)
          .join("\n")
      : "";

    const prompt = `You are DestinGo AI, a warm, practical cultural travel chatbot for India.
Destination currently selected: ${destination}
Traveler interests: ${interests || "not specified"}
Reply language: ${language}

Recent conversation:
${recentHistory || "No previous messages."}

Traveler question:
${message}

Answer like a helpful local cultural travel assistant. Give specific, useful guidance for the selected Indian city when possible. Include heritage, food, respectful behavior, neighborhoods, hidden gems, realistic planning tips, and safety notes when relevant. Do not invent exact opening hours, live event dates, prices, or ticket rules. If such details can change, tell the traveler to verify locally. Keep the reply concise, friendly, and in the requested language.`;

    const text = await callGemini(prompt);
    res.json({ text });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  res.status(error.status || 500).json({ error: error.message || "Server error" });
});

if (process.env.VERCEL !== "1") {
  app.listen(port, () => {
    console.log(`DestinGo AI backend running on http://localhost:${port}`);
  });
}

export default app;
