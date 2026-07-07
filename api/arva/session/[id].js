import { sessionResponse } from "../../../lib/arva-state-machine.js";
import {
  decodeSession,
  encodeSession
} from "../../../lib/arva-session-token.js";
import { json, methodNotAllowed } from "../../../lib/arva-http.js";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    return methodNotAllowed(response, ["GET"]);
  }

  const { id } = request.query;
  const token =
    request.query.session_token ||
    request.headers["x-arva-session-token"];

  if (!token) {
    return json(response, 400, {
      error: "Missing session_token query param or x-arva-session-token header"
    });
  }

  try {
    const session = decodeSession(token);
    if (session.session_id !== id) {
      return json(response, 404, { error: "Session id does not match token" });
    }
    return json(response, 200, {
      ...sessionResponse(session),
      session_token: encodeSession(session)
    });
  } catch (error) {
    return json(response, 400, { error: error.message || "Invalid session token" });
  }
}
