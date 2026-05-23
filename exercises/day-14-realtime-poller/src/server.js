// createStatusServer(getStats, port)
//   creates an HTTP server with two routes:
//
//   GET /status
//     returns { online: true, stats: getStats(), timestamp }
//
//   GET /health
//     returns { status: "ok" }
//
//   returns { start(), stop() }

import http from "node:http";

export function createStatusServer(getStats, port) {
    const server = http.createServer((req, res) => {
        if (req.method === "GET" && req.url === "/health") {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ status: "ok" }));
            return;
        }

        if (req.method === "GET" && req.url === "/status") {
            const data = {
                online: true,
                stats: getStats(),
                timestamp: new Date().toISOString()
            };

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(data));
            return;
        }
        
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Not found" }));
    });

    return {
        start() {
            server.listen(port);
        },

        stop() {
            server.close();
        }
    };
}