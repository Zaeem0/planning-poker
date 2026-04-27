# Bug Tracking & Resolution

This document tracks the recently identified bugs in the application, specifically focusing on connection stability, socket logic, voting synchronization, and edge cases with session persistence.

## Fixed Bugs

### BUG-1: Silent Disconnection (Broadcasts Not Received)
**Issue:** Users who temporarily disconnected and reconnected would stop receiving new vote broadcasts and room updates, despite appearing connected.
**Resolution:** Re-architected `lib/socket.ts` to maintain a stable socket reference across React renders. Re-joining logic now fires on the *existing* socket connection using stable refs instead of tearing down the socket when state changes. E2E tests added to verify reconnected users see new votes.

### BUG-2: Server Accepted Spectator Votes
**Issue:** Spectators could bypass the UI restrictions and emit raw socket events to cast votes.
**Resolution:** Added server-side validation in `server.ts` to explicitly reject any `vote` events originating from users marked with the `spectator` role. E2E tests added.

### BUG-3: Server Accepted Votes Post-Reveal
**Issue:** Players could bypass the UI to change their votes directly over the socket after cards had already been revealed.
**Resolution:** Added a server-side guard in `server.ts` rejecting vote mutations if the `revealed` flag for the game is `true`. E2E tests added.

### BUG-4: Infinite Loading Screen on Refresh (Regression)
**Issue:** Returning users refreshing the page were getting stuck on the `<Loader />` indefinitely. The client was waiting for a `displayName` before emitting a `join-game` event, but the React state had wiped the name.
**Resolution:** Removed the client-side guard requiring `displayName` before emitting `join-game` in `lib/socket.ts`. The server now accepts empty usernames on join, looks up the session in `userProfiles` via the persisted `userId`, and cleanly admits the user back into the room.

### BUG-5: Zombie Session Hangs
**Issue:** If the server was restarted (clearing in-memory sessions), users with `hasJoinedThisGame = true` in their `localStorage` would bypass the join form but end up in a broken, nameless state on the game page.
**Resolution:** Added a "Zombie Session Detector" in `app/game/[id]/page.tsx` that detects when a client thinks it has joined, but the server confirms they have no name. It clears local state and cleanly bumps them back to the `JoinGameForm`.

### BUG-6: Create Game Form Bounce
**Issue:** New users entering their name and clicking "Create Game" were occasionally bumped immediately back to the join form due to the "Zombie Session Detector" firing too eagerly before the server responded with their assigned name.
**Resolution:** Adjusted the zombie session check in `page.tsx` to ensure it only fires if the user does *not* have a pending name in their local `joinFormData`. An explicit E2E test (`should not bounce back to form when creating game after initial connection`) was added to prevent regressions.

### BUG-7: Event Listener Cleanup
**Issue:** Unnecessary and duplicative event listeners in React effects leading to minor memory leaks and multiple event executions.
**Resolution:** Refactored `useSocket` to properly clean up and subscribe to socket events using `useSyncExternalStore` and stable references.
