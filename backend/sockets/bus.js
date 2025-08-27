// backend/sockets/bus.js
// Simple WS broker to allow controllers to broadcast events
let wss = null;

function setWss(server) {
  wss = server;
}

let seq = 0;
function broadcast(type, data) {
  if (!wss) return;
  const id = Date.now() + (seq++);
  const payload = { message: { id, type, data } };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
  wss.clients.forEach((client) => {
    try {
      if (client.readyState === 1) client.send(encoded);
    } catch {}
  });
}

module.exports = { setWss, broadcast };
