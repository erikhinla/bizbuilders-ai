import crypto from "crypto";

function secret() {
  return (
    process.env.ARVA_SESSION_SECRET ||
    process.env.ELEVENLABS_API_KEY ||
    "arva-dev-only-change-in-production"
  );
}

export function encodeSession(session) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function decodeSession(token) {
  if (!token || typeof token !== "string") {
    throw new Error("Missing session token");
  }
  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    throw new Error("Invalid session token format");
  }
  const expected = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    sigBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    throw new Error("Invalid session token signature");
  }
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
}
