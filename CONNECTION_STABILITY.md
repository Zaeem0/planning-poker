# Connection Stability Implementation

## Overview

This document describes the comprehensive connection stability solution implemented to prevent false disconnections when users switch tabs, teams, or browsers.

## Problem Statement

Users were appearing as disconnected when:
- Switching between browser tabs
- Switching between teams/windows
- Returning to the app after a period of inactivity
- Using mobile browsers (which aggressively throttle background tabs)

This happened because browsers throttle background tabs to save resources, causing Socket.IO ping/pong responses to be delayed or missed.

## Solution Components

We implemented a **multi-layered approach** combining four strategies:

### 1. ✅ Increased Socket.IO Timeouts

**File:** `server.ts` (lines 149-152)

**Changes:**
- `pingTimeout`: 120s → **240s** (4 minutes)
- `pingInterval`: 25s → **45s** (45 seconds)

**Why:** Gives more breathing room for throttled tabs to respond to pings before being marked as disconnected.

### 2. ✅ Page Visibility API

**File:** `lib/hooks/usePageVisibility.ts`

**How it works:**
- Listens for `visibilitychange` events
- When tab becomes visible, sends a `user-active` event to server
- Server marks user as connected and notifies other users
- Includes 1-second debounce to prevent spam from rapid tab switching

**Benefits:**
- Proactive reconnection when user returns
- No wasted resources on hidden tabs
- Works with browser throttling instead of fighting it

### 3. ✅ Activity-Based Heartbeats

**File:** `lib/hooks/useActivityHeartbeat.ts`

**How it works:**
- Sends heartbeat every 30 seconds (configurable)
- Also sends heartbeat on user activity:
  - Mouse clicks (`mousedown`)
  - Keyboard input (`keydown`)
  - Touch events (`touchstart`)
  - Scrolling (`scroll`)
- Includes 5-second debounce to prevent spam

**Benefits:**
- Proves user is actively using the app
- Maintains connection during periods of viewing (no interaction)
- Lightweight and efficient

### 4. ✅ Server-Side Heartbeat Handlers

**File:** `server.ts` (lines 332-384)

**Two event handlers:**

#### `user-active` (Page Visibility)
- Triggered when tab becomes visible
- Marks user as connected
- Updates socket ID mapping
- Notifies other users if user was previously disconnected

#### `heartbeat` (Activity & Interval)
- Triggered periodically and on user activity
- Same logic as `user-active`
- Ensures connection is maintained

## Integration

**File:** `app/game/[id]/page.tsx` (lines 71-84)

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
  intervalMs: 30000, // 30 seconds
});
```

**Enabled only when:** User has joined the game (has a username)

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

## Performance Considerations

### Network Traffic
- **Heartbeat interval:** 30 seconds (configurable)
- **Activity debounce:** 5 seconds minimum between heartbeats
- **Visibility debounce:** 1 second minimum between events
- **Result:** Minimal network overhead (~2 events/minute during activity)

### Server Load
- Heartbeat handlers are lightweight (simple user lookup and update)
- No database queries or heavy operations
- Scales well with many concurrent users

## Testing

The existing E2E tests in `e2e/persistence.spec.ts` cover disconnect scenarios:
- `should show disconnected state for offline users`
- `should maintain users after reconnection`

These tests verify that the disconnect/reconnect flow works correctly.

## Configuration

### Adjusting Heartbeat Interval

In `app/game/[id]/page.tsx`:
```typescript
useActivityHeartbeat({
  // ...
  intervalMs: 30000, // Change this value (in milliseconds)
});
```

**Recommendations:**
- **Development:** 30000 (30 seconds)
- **Production:** 30000-60000 (30-60 seconds)
- **High-traffic:** 60000 (1 minute) to reduce server load

### Adjusting Server Timeouts

In `server.ts`:
```typescript
pingTimeout: 240000, // Increase for more tolerance
pingInterval: 45000, // Increase to reduce ping frequency
```

## Monitoring

Server logs will show:
- `Tab became visible - sending heartbeat` (client-side)
- `User became active: [userId] in game: [gameId]` (server-side)
- `User heartbeat restored connection: [userId]` (server-side)

Monitor these logs to understand reconnection patterns.

## Future Improvements

Potential enhancements:
1. **Adaptive heartbeat intervals** based on user activity patterns
2. **Connection quality indicators** in the UI
3. **Reconnection notifications** for users
4. **Analytics** on disconnection/reconnection events

