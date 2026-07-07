import {
  createSession,
  sessionResponse
} from "../../../lib/arva-state-machine.js";
import { json, methodNotAllowed, parseBody, withSessionToken } from "../../../lib/arva-http.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return methodNotAllowed(response, ["POST"]);
  }

  const body = parseBody(request);
  const startIndex = Number.isInteger(body.start_index) ? body.start_index : 0;
  const channel = typeof body.channel === "string" ? body.channel : "browser";

  const session = createSession({ channel, startIndex: Math.max(0, startIndex) });
  return json(response, 200, withSessionToken(session, sessionResponse(session)));
}
