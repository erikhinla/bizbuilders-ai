const DEFAULT_VOICE_ID = "pNInz6obpgDQGcFmaJgB";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;

  if (!apiKey) {
    return response.status(500).json({ error: "Missing ELEVENLABS_API_KEY" });
  }

  const { text } = request.body || {};
  const cleanText = typeof text === "string" ? text.trim() : "";

  if (!cleanText) {
    return response.status(400).json({ error: "Missing text" });
  }

  if (cleanText.length > 2800) {
    return response.status(413).json({ error: "Text is too long" });
  }

  const elevenResponse = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey
      },
      body: JSON.stringify({
        text: cleanText,
        model_id: process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2",
        voice_settings: {
          stability: Number(process.env.ELEVENLABS_STABILITY || 0.58),
          similarity_boost: Number(process.env.ELEVENLABS_SIMILARITY_BOOST || 0.78),
          style: Number(process.env.ELEVENLABS_STYLE || 0.18),
          use_speaker_boost: true
        }
      })
    }
  );

  if (!elevenResponse.ok) {
    const errorText = await elevenResponse.text();
    return response.status(elevenResponse.status).json({
      error: "ElevenLabs request failed",
      detail: errorText.slice(0, 500)
    });
  }

  const audioBuffer = Buffer.from(await elevenResponse.arrayBuffer());
  response.setHeader("Content-Type", "audio/mpeg");
  response.setHeader("Cache-Control", "no-store");
  return response.status(200).send(audioBuffer);
}
