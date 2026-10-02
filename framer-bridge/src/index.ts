import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { loadConfig } from "./config.js";
import { handleWebhookRequest } from "./webhook/handler.js";

const config = loadConfig();

async function readRawBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function sendJson(res: ServerResponse, status: number, body: Record<string, unknown>): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

    if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/health")) {
      sendJson(res, 200, {
        ok: true,
        service: "witflow-framer-bridge",
        phase: 3,
        webhookPath: "/webhook",
      });
      return;
    }

    if (url.pathname === "/webhook") {
      if (req.method === "GET") {
        sendJson(res, 405, { ok: false, error: "Method not allowed" });
        return;
      }
      if (req.method !== "POST") {
        sendJson(res, 405, { ok: false, error: "Method not allowed" });
        return;
      }

      const rawBody = await readRawBody(req);
      const result = await handleWebhookRequest(config, rawBody, req.headers);
      sendJson(res, result.status, result.body);
      return;
    }

    sendJson(res, 404, { ok: false, error: "Not found" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    sendJson(res, 500, { ok: false, error: message });
  }
});

server.listen(config.port, config.host, () => {
  console.log(
    `[witflow-framer-bridge] listening on http://${config.host}:${config.port}/webhook`
  );
  console.log(
    `[witflow-framer-bridge] collection="${config.framerCollectionName}" autoDeploy=${config.autoDeploy}`
  );
});
