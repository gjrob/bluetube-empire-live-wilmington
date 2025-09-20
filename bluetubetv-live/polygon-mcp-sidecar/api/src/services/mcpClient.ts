// api/src/services/mcpClient.ts
const MCP_BASE = process.env.MCP_BASE!;
const MCP_KEY  = process.env.MCP_SHARED_KEY || "";

// Named export (CommonJS-friendly)
export async function getQuote(symbol: string) {
  const r = await fetch(`${MCP_BASE}/tools/get_quote`, {
    method: "POST",
    headers: { "Content-Type":"application/json", "X-Api-Key": MCP_KEY },
    body: JSON.stringify({ symbol })
  });
  if (!r.ok) throw new Error(`get_quote ${r.status}`);
  return r.json();
}
