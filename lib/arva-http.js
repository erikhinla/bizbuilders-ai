import { decodeSession, encodeSession } from "./arva-session-token.js";

export function json(response, status, body) {
  return response.status(status).json(body);
}

export function methodNotAllowed(response, methods = ["POST"]) {
  response.setHeader("Allow", methods.join(", "));
  return json(response, 405, { error: "Method not allowed" });
}

export function parseBody(request) {
  return request.body || {};
}

export function withSessionToken(session, payload) {
  return {
    ...payload,
    session_token: encodeSession(session)
  };
}

export function loadSessionFromRequest(request) {
  const body = parseBody(request);
  const token =
    body.session_token ||
    request.headers["x-arva-session-token"] ||
    request.query?.session_token;
  return decodeSession(token);
}
