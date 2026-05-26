P2P implementation notes:
PeerJS uses a signaling server. Our backend can run it via the `peer` package on a separate path or port, or we can use Socket.IO directly for signaling WebRTC connections.
Since I see `socket.io` and `socket.io-client` are already used extensively, we will implement WebRTC signaling directly over Socket.io to avoid adding unnecessary dependencies.

1. Backend (server.js): Add WebRTC signaling endpoints (offer, answer, ice-candidate).
2. Frontend (App.js/WebRTC.js): Wrap the socket to establish an RTCPeerConnection for timer and random ring.
