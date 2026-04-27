# Connection Stability Implementation

## Overview

This document describes the comprehensive connection stability solution implemented to prevent false disconnections when users switch tabs, teams, or browsers.

## Problem Statement

Users were appearing as disconnected when:

- Switching between browser tabs
- Switching between teams/windows
- Returning to the app after a period of inactivity
- Using mobile browsers (which aggressively throttle background tabs)
- Joining or reconnecting to a game (socket teardown/rebuild cycle)

This happened because browsers throttle background tabs to save resources, causing Socket.IO ping/pong responses to be delayed or missed. Additionally, the client socket was being torn down and recreated whenever user form data changed, causing transient disconnects visible to other players.

## Solution Components

We implemented a **multi-layered approach** combining several strategies:

### 0. Connection Guard on All Emitters

**File:** `lib/socket.ts`

All emit functions (`emitVote`, `emitReveal`, `emitReset`, `emitThrowEmoji`, `emitToggleRole`, `emitUserActive`, `emitHeartbeat`) use an `isConnected()` type guard that checks both `socket !== null` and `socket.connected`. This prevents Socket.IO from buffering stale events during disconnection that would be replayed on reconnect with potentially outdated game state.

### 1. Increased Socket.IO Timeouts

**File:** `server.ts`

- `pingTimeout`: **240s** (4 minutes)
- `pingInterval`: **45s** (45 seconds)

Gives more breathing room for throttled tabs to respond to pings before being marked as disconnected.

### 2. Stable Socket Connection & Join-Game Rules

**File:** `lib/socket.ts`

The socket connection is kept stable across prop changes by storing `displayName`, `isSpectator`, and `cardSet` in React refs rather than as `useEffect` dependencies. This prevents the socket from being torn down and recreated when form data changes (e.g. when a user submits the join form).

#### Join-Game Scenarios

There are exactly two scenarios that send a `join-game` event to the server:

| Scenario                | Trigger                                                     | displayName                                                           | Server behaviour                                                                                                                                                   |
| ----------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Connect/Reconnect**   | Socket `connect` event                                      | May be undefined (page reload) or set (returning user with form data) | Server resolves username from stored profile using userId. If no profile exists and no name provided, responds with `username: null` which triggers the join form. |
| **Display name change** | `displayName` or `isSpectator` prop changes while connected | Always set                                                            | Server updates stored profile with the new name.                                                                                                                   |

**Dedup mechanism:** When both scenarios fire simultaneously (user already has a displayName when the socket first connects), the connect handler sets `skipNextDisplayNameJoinRef` to `true`. The displayName effect checks this flag and skips its emission to avoid a duplicate `join-game`.

#### Key invariant

On page reload, `displayName` is `undefined` (form state is not persisted — only `hasJoined` flag is in localStorage). The socket connects and sends `join-game` with no username. The server looks up the userId in its `userProfiles` map and responds with the stored display name. This is how persistence works without re-showing the join form.

### 3. Page Visibility API

**File:** `lib/hooks/usePageVisibility.ts`

- Listens for `visibilitychange` events
- When tab becomes visible, sends a `user-active` event to server **only if socket is connected**
- Server marks user as connected and notifies other users
- Includes 1-second debounce to prevent spam from rapid tab switching

### 4. Activity-Based Heartbeats

**File:** `lib/hooks/useActivityHeartbeat.ts`

- Sends heartbeat every 30 seconds (configurable)
- Also sends heartbeat on user activity (mousedown, keydown, touchstart, scroll)
- Includes 5-second debounce to prevent spam
- Only emits when `socket.connected` is true to avoid buffering stale heartbeats

### 5. Server-Side Heartbeat Handlers

**File:** `server.ts`

Two event handlers:

**`user-active`** (Page Visibility) — Triggered when tab becomes visible. Marks user as connected, updates socket ID mapping, notifies other users if previously disconnected.

**`heartbeat`** (Activity & Interval) — Triggered periodically and on user activity. Same logic as `user-active`.

### 6. Server-Side Disconnect Grace Period (Debouncing)

**File:** `server.ts`

When a socket disconnects, the server waits **2 seconds** before broadcasting the disconnected state to other users. If the user reconnects within that window (via `join-game`), the pending timer is cancelled via `clearTimeout` and no disconnect is ever broadcast.

The timer also checks that the `socketId` still matches the disconnected socket, preventing a race condition where a user who already reconnected with a new socket would be incorrectly marked as disconnected.

This absorbs Socket.IO's built-in reconnection cycle (~1 second for first retry) and brief network drops without any UI flicker for other players.

### 7. Unconditional Rejoining on Refresh

**File:** `lib/socket.ts`

When a returning user refreshes the page, their React state (including their `displayName`) is cleared. However, the socket connection must still be established and emit a `join-game` event. By unconditionally emitting the `join-game` event even when `displayName` is empty, the server can use the client's `userId` (persisted in `localStorage`) to look up their session from its `userProfiles` memory mapping and immediately restore their session in the room without requiring them to re-enter their name.

### 8. Zombie Session Recovery

**File:** `app/game/[id]/page.tsx`

In the event of a server restart or cache clear, the server loses all memory of the user's session (`userProfiles` is wiped). If a user then refreshes their page, their local state (`hasJoinedThisGame = true`) will cause the app to attempt to load the game directly, bypassing the join form. However, because the server has forgotten them, it will reply to the `join-game` event with an empty username.
To handle this, a `useEffect` acts as a zombie session detector. If the user's client thinks it has joined, but the server's response confirms they have no name (and no name was just entered locally), the client resets its `hasJoinedThisGame` state and removes the `localStorage` token. This safely bumps the user back to the `JoinGameForm`.

## Integration

**File:** `app/game/[id]/page.tsx`

Both hooks are integrated into the game page:

```typescript
usePageVisibility({
  socket,
  gameId,
  userId: currentUserId,
  enabled: !!currentUserName,
});

useActivityHeartbeat({
  socket,
  gameId,
  userId: currentUserId,
  enabled: !!currentUserName,
  intervalMs: 30000,
});
```

Enabled only when user has joined the game (has a username).

## How It Works Together

### Scenario 1: User Switches Tabs

1. Browser throttles the background tab
2. Socket.IO pings may be delayed
3. **4-minute timeout** prevents premature disconnection
4. When user returns, **Page Visibility API** sends `user-active`
5. User immediately marked as connected

### Scenario 2: User is Inactive but Viewing

1. User is reading/thinking (no interaction)
2. **Interval heartbeat** (every 30s) maintains connection
3. Server knows user is still there
4. No false disconnection

### Scenario 3: User is Actively Voting

1. User clicks cards, types, scrolls
2. **Activity heartbeat** sends on each interaction
3. Connection constantly refreshed
4. Guaranteed to stay connected

### Scenario 4: Mobile Browser Background

1. Mobile browser aggressively throttles
2. **4-minute timeout** gives maximum grace period
3. When app returns to foreground, **Page Visibility API** reconnects
4. Seamless experience for mobile users

### Scenario 5: User Joins or Reconnects

1. User submits join form or socket reconnects
2. **Stable socket** stays connected — no teardown/rebuild
3. `join-game` emitted on existing socket
4. **Grace period** absorbs any transient drops
5. Other users never see a disconnect flash

## Performance Considerations

### Network Traffic

- **Heartbeat interval:** 30 seconds (configurable)
- **Activity debounce:** 5 seconds minimum between heartbeats
- **Visibility debounce:** 1 second minimum between events
- **Result:** Minimal network overhead (~2 events/minute during activity)

### Server Load

- Heartbeat handlers are lightweight (simple user lookup and update)
- Disconnect timers are simple `setTimeout`/`clearTimeout` pairs
- No database queries or heavy operations
- Scales well with many concurrent users

## Testing

E2E tests covering disconnect/reconnect scenarios:

**`e2e/connection-stability.spec.ts`:**

- Automatic reconnection after temporary disconnection
- Vote preservation after reconnection
- User list sync after reconnection
- Revealed state maintenance after reconnection
- Multiple rapid disconnects and reconnects
- Tab switching simulation
- Stale vote guard: votes emitted while disconnected are not applied after reconnection
- Successful voting after reconnection

**`e2e/persistence.spec.ts`:**

- Disconnected state for offline users
- User maintenance after reconnection

## Configuration

### Adjusting Heartbeat Interval

In `app/game/[id]/page.tsx`:

```typescript
useActivityHeartbeat({
  intervalMs: 30000, // Change this value (in milliseconds)
});
```

- **Development:** 30000 (30 seconds)
- **Production:** 30000-60000 (30-60 seconds)
- **High-traffic:** 60000 (1 minute) to reduce server load

### Adjusting Server Timeouts

In `server.ts`:

```typescript
pingTimeout: 240000,  // Increase for more tolerance
pingInterval: 45000,  // Increase to reduce ping frequency
```

### Adjusting Disconnect Grace Period

In `server.ts`:

```typescript
}, 2000); // Delay in ms before broadcasting disconnect
```

Must be greater than Socket.IO's `reconnectionDelay` (default 1000ms) to absorb automatic retries.
