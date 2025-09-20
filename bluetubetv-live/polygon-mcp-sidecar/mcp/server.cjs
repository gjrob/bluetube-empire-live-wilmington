const express = require("express");
const app = express();
app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/", (_req, res) => res.type("text").send("MCP up"));
const port = Number(process.env.PORT || 8080);
app.listen(port, "0.0.0.0", () => console.log(`[MCP] listening on :${port}`));
