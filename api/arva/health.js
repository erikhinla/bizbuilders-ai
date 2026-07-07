import { getSttConfig, getTtsConfig } from "../../lib/arva-providers.js";
import { json, methodNotAllowed } from "../../lib/arva-http.js";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    return methodNotAllowed(response, ["GET"]);
  }

  const tts = getTtsConfig();
  const stt = getSttConfig();
  const sessionSecret =
    process.env.ARVA_SESSION_SECRET || process.env.ELEVENLABS_API_KEY || "";
  const usingDevSecret =
    !process.env.ARVA_SESSION_SECRET && !process.env.ELEVENLABS_API_KEY;

  return json(response, 200, {
    ok: true,
    service: "arva-voice-bridge",
    version: "1.0.0",
    runtime: {
      session_api: true,
      tts_provider: tts.provider,
      tts_configured: Boolean(tts.apiKey),
      stt_provider: stt.provider,
      stt_configured: Boolean(stt.apiKey),
      session_secret_configured: Boolean(sessionSecret) && !usingDevSecret,
      handoff_webhook_configured: Boolean(
        process.env.ARVA_HANDOFF_WEBHOOK_URL ||
          process.env.ARVA_FLOW_INTAKE_URL ||
          process.env.FLOW_INTAKE_WEBHOOK_URL
      )
    },
    endpoints: {
      start: "/api/arva/session/start",
      answer: "/api/arva/session/answer",
      complete: "/api/arva/session/complete",
      tts: "/api/arva-tts"
    }
  });
}
