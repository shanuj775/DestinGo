async function postJson(path, body) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "The AI request failed.");
  }

  return payload;
}

export function generateItinerary(input) {
  return postJson("/api/generate-itinerary", input);
}

export function generateStory(input) {
  return postJson("/api/generate-story", input);
}

export function getCultureRespectTips(input) {
  return postJson("/api/culture-respect", input);
}

export function chatWithDestinGo(input) {
  return postJson("/api/chat", input);
}