// backend/server.ts
import WebSocket, { WebSocketServer, RawData } from 'ws';

const PORT = 5005;
const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (socket: WebSocket) => {
  console.log('Client connected');

  socket.on('message', (data: RawData) => {
    // RawData can be Buffer, ArrayBuffer, or string
    const msg = data.toString();
    console.log('received:', msg);
  });

  socket.send('Hello from the WebSocket server!');
});

console.log(`WebSocket server running on ws://localhost:${PORT}`);

