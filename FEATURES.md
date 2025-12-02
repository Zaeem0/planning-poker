# Planning Poker - Features Guide

## ✅ Core Features

### Real-time Voting System

**Size-Based Estimates:**

- 🐜 Extra Small (< 1 day)
- 🐰 Small (1-2 days)
- 🐶 Medium (1 week)
- 🦒 Large (2 weeks)
- 🦕 Extra Large (2+ weeks)
- ❓ Unknown

**Voting Methods:**

- Click voting cards at bottom of screen
- Keyboard shortcuts:
  - `S` → Small
  - `M` → Medium
  - `L` → Large
  - `X` then `S` → Extra Small
  - `X` then `L` → Extra Large
  - `?` → Unknown

**Vote Display:**

- Votes hidden until revealed
- Striped pattern shows who has voted
- Real-time synchronization across all users

### User Management

**Username System:**

- Custom username required on first visit
- Username stored on server and persists across sessions
- Automatic reconnection with stored username
- No random username generation

**Spectator Mode:**

- Toggle option on join form to join as spectator
- Spectators shown with 👁️ eye icon on their card
- Spectators cannot vote (no voting cards shown)
- Spectators excluded from vote count (e.g., "2 of 3 voted" won't count spectators)
- Keyboard voting disabled for spectators
- "(spectator)" label shown under spectator names

**User Display:**

- Visual distinction for current user
- Player cards arranged around poker table
- Emoji throwing between players for fun interactions
- Disconnected users shown with 🔌 plug icon
- Spectators shown with 👁️ eye icon

### Session Persistence

**Vote Persistence:**

- Votes maintained across page refreshes
- Works before and after votes are revealed
- Votes only cleared when "New Round" is clicked
- Selected vote restored on reconnection

**Position Persistence:**

- Users maintain their position around the table
- Join order tracked and preserved
- No visual "jumping" when users reconnect
- Disconnected users hold their position as placeholders

**Connection State:**

- Disconnected users marked with reduced opacity
- Plug icon (🔌) displayed for offline users
- Automatic reconnection when user returns
- Connection state visible to all players

### Game Controls

- **Reveal Cards** - Show all votes (enabled when votes exist)
- **New Round** - Reset all votes and start over
- **Copy Link** - Share game URL with team
- **Game Header** - Shows game ID and player count

### Results & Statistics

**Vote Display:**

- Results shown directly on voting cards
- Player cards show emoji + size text
- Most common estimate highlighted in green
- Percentage overlays on voting cards

**Statistics:**

- Vote distribution percentages
- Most common vote indicator
- Cards with no votes are faded
- "Votes revealed!" message when shown

### Visual Feedback

- Selected card highlighting
- Striped pattern when player has voted
- Revealed votes on player cards
- Percentage overlays on voting cards
- Toast notifications for actions
- Smooth transitions and animations

### Modern Styling

- Clean, professional design
- Dark theme with gradient backgrounds
- Shadow effects and hover states
- SCSS with design system variables
- Consistent spacing and typography

## 🔧 Technical Architecture

### Stack

- **Frontend**: Next.js 16, React 19, TypeScript 5
- **Styling**: SCSS (Sass)
- **Real-time**: Socket.io 4.8
- **State**: Zustand 5
- **Server**: Custom Node.js server with Socket.io
- **Runtime**: Node.js 22+ (LTS)

### Communication Flow

```
Client (Browser)
    ↓
Next.js App (React)
    ↓
Socket.io Client
    ↓
WebSocket Connection
    ↓
Socket.io Server (Node.js)
    ↓
Game State (In-Memory)
```

### State Management

**Client-side (Zustand):**

- Game ID, User ID, Username
- Users list, Votes, Revealed state
- Selected vote, UI state

**Server-side (In-Memory Maps):**

- `games` - Game state by game ID
- `users` - Socket ID to user data mapping (includes isSpectator flag)
- `userProfiles` - User ID to username mapping

### Data Persistence

**Persisted Across Disconnects:**

- User ID (localStorage)
- Username (server)
- Join order (server)
- Votes (server)
- Revealed state (server)

**Cleared on "New Round":**

- All votes
- Revealed state
- hasVoted flags

**Never Cleared:**

- User profiles
- Join order
- User list

## 🔌 Reconnection & Persistence

### How It Works

1. **First Visit:**
   - User provides username
   - Assigned unique user ID (stored in localStorage)
   - Username stored on server
   - Assigned join order position

2. **Subsequent Visits:**
   - User ID retrieved from localStorage
   - Username retrieved from server
   - Join order preserved
   - Vote restored if exists

3. **During Disconnect:**
   - User marked as `connected: false`
   - User kept in game state
   - Vote preserved
   - Position held with plug icon (🔌)

4. **On Reconnection:**
   - User marked as `connected: true`
   - Same position in table
   - Vote restored
   - UI state synchronized

### Benefits

- ✅ Seamless page refreshes
- ✅ No lost votes
- ✅ Stable player positions
- ✅ Transparent connection state
- ✅ Better user experience

## 🚀 Usage Flow

1. **Landing Page** → Create or join game
2. **Enter Username** → Required on first visit
3. **Choose Role** → Toggle spectator mode if observing only
4. **Vote** → Click card or use keyboard (voters only)
5. **Wait** → See who has voted (striped cards)
6. **Reveal** → View all votes and statistics
7. **New Round** → Reset and start over

## 🎯 Design Principles

- **Simplicity** - Easy to understand and use
- **Real-time** - Instant feedback and updates
- **Persistence** - Seamless across refreshes
- **Responsive** - Works on all devices
- **Accessible** - Clear visual indicators
- **Professional** - Clean, modern aesthetic
