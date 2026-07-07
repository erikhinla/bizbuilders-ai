import {
  applyAnswer,
  sessionResponse
} from "../../../lib/arva-state-machine.js";
import {
  json,
  loadSessionFromRequest,
  methodNotAllowed,
  parseBody,
  withSessionToken
} from "../../../lib/arva-http.js";
import { transcribeAudio } from "../../../lib/arva-providers.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return methodNotAllowed(response, ["POST"]);
  }

  try {
    const body = parseBody(request);
    const session = loadSessionFromRequest(request);
    let spokenAnswer = typeof body.spoken_answer === "string" ? body.spoken_answer.trim() : "";

    if (!spokenAnswer && body.audio_base64) {
      const stt = await transcribeAudio({
        audioBase64: body.audio_base64,
        mimeType: body.audio_mime_type || "audio/wav"
      });
      if (!stt.ok) {
        return json(response, 400, {
          error: stt.error,
          provider: stt.provider,
          hint: "Send spoken_answer text or configure ARVA_STT_PROVIDER=deepgram with DEEPGRAM_API_KEY."
        });
      }
      spokenAnswer = stt.transcript;
    }

    if (!spokenAnswer) {
      return json(response, 400, { error: "Missing spoken_answer or audio_base64" });
    }

    const mode = body.mode === "manual" ? "manual" : "voice";
    const { session: nextSession, response: answerResponse } = applyAnswer(session, spokenAnswer, {
      mode
    });

    return json(response, 200, withSessionToken(nextSession, answerResponse));
  } catch (error) {
    return json(response, 400, { error: error.message || "Invalid session" });
  }
}
