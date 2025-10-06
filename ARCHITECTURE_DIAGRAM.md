# 🏗️ System Architecture Diagram

## Overall System Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         REALTIME INTERVIEW AI                            │
│                    Bilateral Video Streaming System                      │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐                              ┌──────────────────────┐
│   INTERVIEWER        │                              │    PARTICIPANT       │
│   (Initiator)        │                              │    (Responder)       │
└──────────────────────┘                              └──────────────────────┘
         │                                                       │
         │  1. Request Camera/Mic Access                        │
         │  ←─────────────────────────────                     │
         │                                                       │
         │  2. Allow Permissions                                │
         │  ──────────────────────────→                        │
         │                                                       │
         ├────────────────── 3. Connect via Socket.IO ─────────┤
         │                           ↓                           │
         │                  ┌─────────────────┐                 │
         │                  │  Backend Server │                 │
         │                  │   (Node.js +    │                 │
         │                  │   Socket.IO)    │                 │
         │                  │  Port: 5000     │                 │
         │                  └─────────────────┘                 │
         │                           │                           │
         ├──── 4. Join Room "interview-room" ───────────────────┤
         │                           │                           │
         │  5. Create WebRTC Offer ──→                          │
         │                           │                           │
         │                      6. Forward Offer ──→            │
         │                           │                           │
         │                      7. Create Answer ←──            │
         │                           │                           │
         │  8. Receive Answer ←── Forward Answer                │
         │                           │                           │
         ├──────── 9. Exchange ICE Candidates (via server) ─────┤
         │                           │                           │
         │                                                       │
         │  10. Establish Direct P2P Connection                 │
         │  ═════════════════════════════════════════════════  │
         │              WebRTC Media Stream                      │
         │  ═════════════════════════════════════════════════  │
         │                                                       │
         │         Video/Audio flows directly                    │
         │         (not through server)                          │
         │                                                       │
         └───────────────────────────────────────────────────────┘
```

## Component Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         FRONTEND                               │
│                    (React Application)                          │
└────────────────────────────────────────────────────────────────┘

┌───────────────────┐        ┌───────────────────┐
│  JoinInterview.js │        │ JoinParticipant.js│
│   (Interviewer)   │        │   (Participant)   │
└────────┬──────────┘        └─────────┬─────────┘
         │                              │
         │  Uses                   Uses │
         │                              │
         ├──────────┬───────────────────┤
         │          │                   │
         ▼          ▼                   ▼
    ┌─────────────────────┐    ┌─────────────┐
    │  useWebRTC Hook     │    │  Socket.IO  │
    │  (WebRTC Logic)     │    │   Client    │
    └──────┬──────────────┘    └──────┬──────┘
           │                          │
           │ Creates                  │ Connects
           │                          │
           ▼                          ▼
    ┌─────────────────┐      ┌──────────────┐
    │ RTCPeerConnection│      │ Socket Events│
    │  (WebRTC API)    │      │  - join-room │
    └──────────────────┘      │  - offer     │
                              │  - answer    │
                              │  - candidate │
                              └──────────────┘

┌────────────────────────────────────────────────────────────────┐
│                          BACKEND                               │
│                   (Node.js + Socket.IO)                         │
└────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────┐
    │           server.js                     │
    ├─────────────────────────────────────────┤
    │                                         │
    │  WebRTC Signaling:                      │
    │  • join-room                            │
    │  • offer ──→ Forward to room           │
    │  • answer ──→ Forward to room          │
    │  • ice-candidate ──→ Forward to room   │
    │                                         │
    │  Meeting Control:                       │
    │  • start-meeting                        │
    │  • end-meeting                          │
    │  • Timer broadcast (1s interval)        │
    │                                         │
    │  State Sync:                            │
    │  • interviewer-toggle                   │
    │  • participant-toggle                   │
    │  • new-question                         │
    │  • new-answer                           │
    │                                         │
    └─────────────────────────────────────────┘
```

## Data Flow Diagram

### Camera Toggle Flow
```
┌──────────────┐                                      ┌──────────────┐
│ Interviewer  │                                      │ Participant  │
└──────┬───────┘                                      └──────┬───────┘
       │                                                     │
       │ 1. Click Camera Button                             │
       │ ──────────────────→                                │
       │                                                     │
       │ 2. Toggle Local Video Track (immediate)            │
       │    track.enabled = !track.enabled                  │
       │                                                     │
       │ 3. Emit State Change                               │
       │    socket.emit('interviewer-toggle', {...})        │
       │                     │                              │
       │                     ↓                              │
       │            ┌─────────────────┐                     │
       │            │  Backend Server │                     │
       │            └────────┬────────┘                     │
       │                     │                              │
       │                     │ 4. Broadcast to All          │
       │                     │    io.emit('update-          │
       │                     │    interviewer', state)      │
       │                     │                              │
       │                     ↓                              │
       │                                              5. Receive Update
       │                                                     │
       │                                              6. Update UI
       │                                                 "Cam: ❌ Off"
       │                                                     │
```

### Video Streaming Flow
```
┌──────────────┐                                      ┌──────────────┐
│ Interviewer  │                                      │ Participant  │
│   Camera     │                                      │   Camera     │
└──────┬───────┘                                      └──────┬───────┘
       │                                                     │
       │ Local MediaStream                                  │ Local MediaStream
       │ ────────────────→                                  │ ────────────────→
       ↓                                                     ↓
┌─────────────────┐                              ┌─────────────────┐
│ Local Video     │                              │ Local Video     │
│ <video> Element │                              │ <video> Element │
└─────────────────┘                              └─────────────────┘
       │                                                     │
       │ MediaStream added to                               │
       │ RTCPeerConnection                                  │
       │                                                     │
       │           WebRTC P2P Connection                    │
       │  ═══════════════════════════════════════════════  │
       │              (Direct transmission)                 │
       │  ═══════════════════════════════════════════════  │
       │                                                     │
       ↓                                                     ↓
┌─────────────────┐                              ┌─────────────────┐
│ Remote Video    │                              │ Remote Video    │
│ <video> Element │                              │ <video> Element │
│ (Shows Participant)                            │ (Shows Interviewer)
└─────────────────┘                              └─────────────────┘
```

### Timer Synchronization Flow
```
┌──────────────┐                                      ┌──────────────┐
│ Interviewer  │                                      │ Participant  │
└──────┬───────┘                                      └──────┬───────┘
       │                                                     │
       │ 1. Click "Start Interview"                         │
       │    socket.emit('start-meeting')                    │
       │                     │                              │
       │                     ↓                              │
       │            ┌─────────────────┐                     │
       │            │  Backend Server │                     │
       │            │                 │                     │
       │            │ meetingStartTime│                     │
       │            │     = Date.now()│                     │
       │            │                 │                     │
       │            │ setInterval(() =>                     │
       │            │   broadcast time                      │
       │            │ , 1000)         │                     │
       │            └────────┬────────┘                     │
       │                     │                              │
       │    ┌────────────────┼────────────────┐            │
       │    │  Every 1 second               │            │
       │    ↓                               ↓            │
       │ io.emit('meeting-status',                         │
       │         {time: elapsed})                          │
       │                                                     │
       ├─────────────────────┼─────────────────────────────┤
       │                                                     │
       │ 2. Receive Timer Update            3. Receive Timer Update
       │    setTime(data.time)                  setTime(data.time)
       │                                                     │
       │ 4. Display: 00:01                  5. Display: 00:01
       │            00:02                              00:02
       │            00:03                              00:03
       │             ...                                ...
```

## WebRTC Connection States

```
┌────────────────────────────────────────────────────────────────┐
│                 WebRTC Connection Lifecycle                     │
└────────────────────────────────────────────────────────────────┘

    NEW
     │
     │  Join room
     │
     ↓
  CONNECTING ────────────────┐
     │                       │
     │  Signaling            │  Timeout/Error
     │  (offer/answer/ICE)   │
     │                       │
     ↓                       ↓
  CONNECTED               FAILED
     │                       │
     │  Streaming            │  Retry logic
     │  video/audio          │
     │                       │
     │  User disconnects     │
     │  or network issue     │
     │                       │
     ↓                       ↓
  DISCONNECTED ───────────→ CLOSED
```

## Technology Stack

```
┌────────────────────────────────────────────────────────────────┐
│                      TECHNOLOGY STACK                           │
└────────────────────────────────────────────────────────────────┘

Frontend:
  ┌─────────────────────────────────────────────┐
  │ • React 19.1.1                              │
  │ • Socket.IO Client 4.8.1                    │
  │ • React Icons 5.5.0                         │
  │ • WebRTC API (browser native)               │
  │ • Custom Hooks (useWebRTC)                  │
  └─────────────────────────────────────────────┘

Backend:
  ┌─────────────────────────────────────────────┐
  │ • Node.js v20.12.0                          │
  │ • Express 5.1.0                             │
  │ • Socket.IO 4.8.1                           │
  │ • MongoDB (Mongoose 8.18.2)                 │
  │ • JWT (jsonwebtoken 9.0.2)                  │
  └─────────────────────────────────────────────┘

Communication:
  ┌─────────────────────────────────────────────┐
  │ • WebRTC (Peer-to-Peer)                     │
  │ • Socket.IO (Signaling & State Sync)        │
  │ • STUN Servers (Google)                     │
  └─────────────────────────────────────────────┘

Protocols:
  ┌─────────────────────────────────────────────┐
  │ • WebSocket (Socket.IO transport)           │
  │ • RTP/RTCP (Media streaming)                │
  │ • DTLS/SRTP (Encryption)                    │
  │ • ICE (NAT traversal)                       │
  └─────────────────────────────────────────────┘
```

## File Structure

```
RealTime-InterviewAI/
│
├── backend/
│   └── node/
│       ├── server.js ⭐ (Updated with WebRTC signaling)
│       ├── .env
│       └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── hooks/
│   │   │   └── useWebRTC.js ⭐ (NEW - WebRTC logic)
│   │   │
│   │   ├── pages/
│   │   │   ├── JoinInterview.js ⭐ (Updated with bilateral video)
│   │   │   └── joinParticipant.js ⭐ (Updated with bilateral video)
│   │   │
│   │   └── ... (other components)
│   │
│   └── package.json
│
└── Documentation/
    ├── VIDEO_STREAMING_IMPLEMENTATION.md ⭐
    ├── QUICK_START.md ⭐
    ├── IMPLEMENTATION_SUMMARY.md ⭐
    └── ARCHITECTURE_DIAGRAM.md ⭐ (This file)
```

## Network Topology

```
┌────────────────────────────────────────────────────────────────┐
│                      NETWORK TOPOLOGY                           │
└────────────────────────────────────────────────────────────────┘

Public Internet
     │
     │  STUN Request (NAT type detection)
     │
     ↓
┌─────────────────────────┐
│ Google STUN Server      │
│ stun:stun.l.google.com  │
└──────────┬──────────────┘
           │
           │  Public IP/Port info
           │
           ↓
    ┌──────────────┐              ┌──────────────┐
    │   Router/    │              │   Router/    │
    │   NAT        │              │   NAT        │
    └──────┬───────┘              └──────┬───────┘
           │                             │
           │                             │
    ┌──────┴───────┐              ┌─────┴────────┐
    │ Interviewer  │◄════════════►│ Participant  │
    │ (Browser)    │   WebRTC P2P │ (Browser)    │
    └──────────────┘   Connection └──────────────┘
           │                             │
           │                             │
           └─────────────┬───────────────┘
                         │
                         │ Signaling only
                         │
                         ↓
                ┌─────────────────┐
                │ Backend Server  │
                │ Socket.IO       │
                │ Port 5000       │
                └─────────────────┘
```

## Security Layers

```
┌────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                            │
└────────────────────────────────────────────────────────────────┘

Application Layer:
  ┌─────────────────────────────────────────────┐
  │ • User permissions (browser enforced)       │
  │ • Room-based isolation                      │
  │ • Input validation                          │
  └─────────────────────────────────────────────┘

Transport Layer:
  ┌─────────────────────────────────────────────┐
  │ • DTLS (Datagram TLS) for WebRTC            │
  │ • SRTP (Secure RTP) for media               │
  │ • WebSocket over TLS (production)           │
  └─────────────────────────────────────────────┘

Network Layer:
  ┌─────────────────────────────────────────────┐
  │ • ICE (prevents IP spoofing)                │
  │ • STUN (secure NAT traversal)               │
  │ • Firewall traversal                        │
  └─────────────────────────────────────────────┘
```

---

**This architecture provides a scalable, secure, and performant video conferencing system! 🚀**
