// MediLens demo backend — transparent rules only; no diagnosis or AI model.
// Ranges and combination rules live in public/rules.js (shared with the browser UI).
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const PORT = Number(process.env.PORT || 3000);
const PUBLIC = path.join(__dirname, "public");
const { definitions, statusOf, findCombinations } = require("./public/rules.js");
function send(res, status, data, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" });
  res.end(type.startsWith("application/json") ? JSON.stringify(data) : data);
}
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (req.method === "GET" && url.pathname === "/api/health") return send(res, 200, { status: "ok", service: "MediLens demo API", mode: "rules-only", medicalAI: false });
  if (req.method === "POST" && url.pathname === "/api/analyze") {
    let body = "";
    req.on("data", chunk => { body += chunk; if (body.length > 32_000) req.destroy(); });
    req.on("end", () => {
      try {
        const input = JSON.parse(body);
        if (!Array.isArray(input.results) || input.results.length > 50) return send(res, 400, { error: "Provide a results array with at most 50 entries." });
        const analyzed = [];
        for (const item of input.results) {
          const d = Object.hasOwn(definitions, item.key) ? definitions[item.key] : null;
          if (!d || typeof item.value !== "number" || !Number.isFinite(item.value)) continue;
          const status = statusOf(item.key, item.value);
          analyzed.push({ key: item.key, label: d.name, value: item.value, unit: d.unit, illustrativeRange: d.range, status, explanation: status === "normal" ? "Inside this demo's configured range only; this does not confirm health." : `Outside this demo's illustrative range. This does not identify a cause or diagnose a condition.` });
        }
        return send(res, 200, { mode: "transparent-rules-only", disclaimer: "Not a medical diagnosis. Illustrative ranges only; seek qualified clinical interpretation.", results: analyzed, combinations: findCombinations(analyzed) });
      } catch { return send(res, 400, { error: "Invalid JSON request." }); }
    });
    return;
  }
  if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, { error: "Method not allowed" });
  const requested = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const file = path.resolve(PUBLIC, "." + requested);
  if (!file.startsWith(PUBLIC + path.sep)) return send(res, 403, { error: "Forbidden" });
  fs.readFile(file, (err, bytes) => {
    if (err) return send(res, 404, "Not found", "text/plain; charset=utf-8");
    const ext = path.extname(file);
    const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".txt": "text/plain; charset=utf-8" };
    send(res, 200, req.method === "HEAD" ? "" : bytes, types[ext] || "application/octet-stream");
  });
});
if (require.main === module) server.listen(PORT, () => console.log(`MediLens running at http://localhost:${PORT}`));
module.exports = server;
