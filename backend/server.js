"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/server.ts
var ws_1 = require("ws");
var PORT = 5005;
var wss = new ws_1.WebSocketServer({ port: PORT });
wss.on('connection', function (socket) {
    console.log('Client connected');
    socket.on('message', function (data) {
        // RawData can be Buffer, ArrayBuffer, or string
        var msg = data.toString();
        console.log('received:', msg);
    });
    socket.send('Hello from the WebSocket server!');
});
console.log("WebSocket server running on ws://localhost:".concat(PORT));
