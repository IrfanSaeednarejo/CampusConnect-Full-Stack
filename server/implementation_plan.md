# Socket Refactor Implementation Plan

This plan details the code changes required to implement the 8-step socket architecture improvements.

## Proposed Changes

### [MODIFY] [sockets/index.js](file:///d:/CampusConnect/CampusConnect-Full-Stack/server/src/sockets/index.js)

**1. Fix Online Users Tracking (Step 1)**
- Change `onlineUsers` from `Map<userId, socketId>` to `Map<userId, Set<socketId>>`.
- Update connection logic: `onlineUsers.get(userId).add(socket.id)`.
- Update disconnect logic: remove `socket.id` from the Set. Only emit `user:offline` and delete the map entry if `Set.size === 0`.
- Update `getOnlineUsers` export or usage for compatibility with presence handler.

**2. Auto-Join Rooms & Reconnection (Steps 2 & 3)**
- In `io.on("connection")`, after joining `user:${userId}`:
  - Query DB: `const userChats = await Chat.find({ "members.userId": userId, isArchived: false }).select("_id");`
  - Map to room names: `const chatRooms = userChats.map(c => "chat:" + c._id.toString());`
  - Join all at once: `socket.join(chatRooms);`
- This completely replaces the client-side `chat:join` necessity and automatically recovers room state upon any reconnection (since Socket.IO natively triggers a new `connection` event on reconnect).

**3. Authentication Hardening (Step 7)**
- Inside `io.use()` where `jwt.verify` succeeds, calculate the remaining token lifespan: `const timeRemaining = (decoded.exp * 1000) - Date.now();`
- Attach a timeout to the socket to forcefully disconnect it when the token naturally expires:
  ```javascript
  socket.authTimeout = setTimeout(() => {
      socket.emit("error:auth", { message: "Token expired" });
      socket.disconnect(true);
  }, timeRemaining);
  ```
- Clear this timeout on the `disconnect` event to avoid memory leaks.

---

### [MODIFY] [sockets/chat.socket.js](file:///d:/CampusConnect/CampusConnect-Full-Stack/server/src/sockets/chat.socket.js)

**4. Message Delivery Reliability & Emitting to BOTH (Steps 2 & 4)**
- Update the `message:send` handler signature to accept an acknowledgment callback: `socket.on("message:send", async (data, ackCallback) => { ... })`.
- Wrap the DB logic in strict `try/catch`. 
- **Enforce Flow:** Await `Message.sendNewMessage(...)`. Only if successful, emit.
- **Emit to BOTH:** 
  ```javascript
  const targetMembers = chat.members.map(m => `user:${m.userId.toString()}`);
  io.to(`chat:${chatId}`).to(targetMembers).emit("message:new", populated);
  ```
- Trigger the callback: `if (typeof ackCallback === "function") ackCallback({ success: true, message: populated });`
- Handle errors cleanly via `ackCallback({ error: err.message })`.

**5. Security & Rate Limiting (Step 6)**
- Implement an in-memory rate limiter for `message:send` using `Map<userId, { count: number, resetAt: number }>`.
- Allow max 5 messages per 3 seconds. Return an error via `ackCallback` if exceeded.

**6. Offline Message Sync (Step 5)**
- Add a new socket event: `socket.on("chat:sync", async ({ lastMessageAt }, ackCallback) => { ... })`.
- Client emits this immediately after connecting, providing their last known message timestamp.
- Server queries: 
  ```javascript
  const missedMessages = await Message.find({
      chat: { $in: userChats }, // cached from connection
      createdAt: { $gt: new Date(lastMessageAt) }
  }).sort({ createdAt: 1 }).populate(...);
  ```
- Return the array via `ackCallback({ success: true, messages: missedMessages })`.

## Review & Verification (Step 8)
Once implemented, the setup will guarantee:
- Devices share presence perfectly (Set logic).
- Sockets never miss messages (auto-joined to rooms + user rooms).
- Sockets sync anything missed while disconnected via the `chat:sync` event.
- Rate limiting protects the DB from spam loops.
- Sockets automatically drop when their token expires.
