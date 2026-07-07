export function buildHandoffPayload(session) {
  const artifact = session.result_artifact || {};
  const firstGap = artifact.layer_reads?.find(read => read.flagged);

  return {
    schema: "arva_diagnostic_handoff",
    version: "1.0",
    source: "bizbuilders.ai/diagnostic",
    channel: session.channel || "browser",
    session_id: session.session_id,
    completed_at: session.completed_at || new Date().toISOString(),
    diagnostic_type: "bbai_arva",
    status: "Report Generated",
    earliest_unstable_layer: firstGap?.layer || null,
    route: artifact.routing_decision || null,
    activation_recommendation: artifact.activation_recommendation || null,
    executive_read: artifact.executive_read || null,
    sequence_rule: artifact.sequence_rule || null,
    tally_by_layer: artifact.tally_by_layer || {},
    layer_reads: artifact.layer_reads || [],
    operational_notes: artifact.operational_notes || [],
    transcript: session.transcript || [],
    notion: {
      create_arva_session: true,
      create_layer_reads: true,
      create_context_capsule: true,
      create_follow_up_action: true
    },
    flow_memory: {
      artifact_type: "arva_diagnostic_session",
      queue: "runtime/queues/completed"
    }
  };
}

export async function dispatchHandoff(session) {
  const webhookUrl =
    process.env.ARVA_HANDOFF_WEBHOOK_URL ||
    process.env.ARVA_FLOW_INTAKE_URL ||
    process.env.FLOW_INTAKE_WEBHOOK_URL;

  if (!webhookUrl) {
    return {
      ok: false,
      skipped: true,
      reason: "No handoff webhook configured"
    };
  }

  const payload = buildHandoffPayload(session);
  const headers = { "Content-Type": "application/json" };
  const secret = process.env.ARVA_HANDOFF_WEBHOOK_SECRET;
  if (secret) {
    headers["x-arva-handoff-secret"] = secret;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    return {
      ok: false,
      skipped: false,
      status: response.status,
      detail
    };
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = { accepted: true };
  }

  return { ok: true, skipped: false, body };
}
