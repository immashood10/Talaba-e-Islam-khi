// Socket.IO live-status service.
//
// Watches MediaMTX's control API and pushes real-time events to every
// connected browser: whether a broadcast is live, and how many viewers
// currently have the /live page open (counted by socket connections,
// which works for both WebRTC and HLS playback).

const http = require('http');
const { Server } = require('socket.io');

const MEDIAMTX_API = process.env.MEDIAMTX_API_URL || 'http://mediamtx:9997';
const PORT = Number(process.env.PORT || 4000);
const POLL_MS = 3000;

const httpServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('live-status-server ok');
});

const io = new Server(httpServer, {
  cors: { origin: '*' },
});

let isLive = false;

async function checkLive() {
  try {
    const res = await fetch(`${MEDIAMTX_API}/v3/paths/get/live`);
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.ready);
  } catch {
    return false; // MediaMTX unreachable
  }
}

function broadcastStatus() {
  io.emit('status', { isLive, viewers: io.engine.clientsCount });
}

setInterval(async () => {
  const next = await checkLive();
  if (next !== isLive) {
    isLive = next;
    console.log(`[status] stream is now ${isLive ? 'LIVE' : 'offline'}`);
    broadcastStatus();
  }
}, POLL_MS);

io.on('connection', (socket) => {
  broadcastStatus();
  socket.on('disconnect', () => broadcastStatus());
});

checkLive().then((live) => {
  isLive = live;
  httpServer.listen(PORT, () => {
    console.log(`[status] listening on :${PORT}, MediaMTX at ${MEDIAMTX_API}, stream ${isLive ? 'LIVE' : 'offline'}`);
  });
});
