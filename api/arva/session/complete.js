import {
  completeSession,
  sessionResponse
} from "../../../lib/arva-state-machine.js";
import { dispatchHandoff } from "../../../lib/arva-handoff.js";
import {
  json,
  loadSessionFromRequest,
  methodNotAllowed,
  withSessionToken
} from "../../../lib/arva-http.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return methodNotAllowed(response, ["POST"]);
  }

  try {
    const session = loadSessionFromRequest(request);
    const completed = completeSession(session);
    const handoff = await dispatchHandoff(completed);
    return json(
      response,
      200,
      withSessionToken(completed, {
        ...sessionResponse(completed),
        result_artifact: completed.result_artifact,
        handoff_ready: true,
        handoff
      })
    );
  } catch (error) {
    return json(response, 400, { error: error.message || "Invalid session" });
  }
}
