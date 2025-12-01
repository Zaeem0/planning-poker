# Planning Poker - Feature List

## ✅ Implemented Features

### Core Functionality

- [x] **Real-time Voting System**

  - Users can select from size-based estimate cards:
    - 🐜 Extra Small (< 1 day)
    - 🐰 Small (1 - 2 days)
    - 🐶 Medium (1 week)
    - 🦒 Large (2 weeks)
    - 🦕 Extra Large (2+ weeks)
  - Votes are hidden until revealed
  - Real-time synchronization across all users

- [x] **User Management**

  - Custom username input on join
  - Auto-generated usernames if no name provided (e.g., "Happy Panda", "Brave Tiger")
  - Automatic user addition when visiting the page
  - Visual distinction for current user
  - Emoji throwing between players for fun interactions

- [x] **Game Controls**

  - Reveal Cards button (enabled when votes exist)
  - New Round button (resets all votes)
  - Copy game link functionality

- [x] **Results & Statistics**
  - Results displayed directly on voting cards when revealed
  - Most common estimate highlighted in green
  - Percentage-based opacity to show vote distribution
  - Cards with no votes are faded

### User Interface

- [x] **Responsive Design**

  - Mobile-friendly layout
  - Tablet and desktop optimized
  - Grid-based card layout

- [x] **Visual Feedback**

  - Selected card highlighting
  - Striped pattern on cards when player has voted
  - Revealed votes displayed on player cards
  - Percentage overlays on voting cards when revealed

- [x] **Modern Styling**
  - Clean, professional design
  - Gradient backgrounds
  - Shadow effects and transitions
  - SCSS with design system variables

### Technical Features

- [x] **WebSocket Communication**

  - Socket.io for real-time updates
  - Automatic reconnection handling
  - Event-based architecture

- [x] **State Management**

  - Zustand for client-side state
  - Server-side game state management
  - Synchronized state across clients

- [x] **Game Sessions**
  - Unique game IDs
  - Multiple concurrent games support
  - Persistent game state during session

## 🎯 How It Compares to Reference Site

### Matching Features

✅ Voting cards with standard values
✅ Real-time vote status indicators
✅ Reveal mechanism
✅ Reset functionality
✅ User list display
✅ Shareable game links
✅ Clean, modern UI

### Simplified (for MVP)

- No user authentication (anonymous by default)
- No issue/story management
- No integrations (Jira, Linear, etc.)
- No voting history
- No premium features

## 🚀 Usage Flow

1. **Landing Page** → Create or join game
2. **Game Room** → Auto-assigned username
3. **Vote** → Select card value
4. **Wait** → See who has voted (checkmarks)
5. **Reveal** → View all votes and statistics
6. **Reset** → Start new round

## 🔧 Technical Architecture

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
Game State (In-Memory Map)
```

## 📊 Data Flow

1. User joins → Server assigns ID and username
2. User votes → Server stores vote, broadcasts status
3. Reveal clicked → Server broadcasts all votes
4. Reset clicked → Server clears votes, broadcasts reset

## 🎨 Design Principles

- **Simplicity**: Easy to understand and use
- **Real-time**: Instant feedback and updates
- **Responsive**: Works on all devices
- **Accessible**: Clear visual indicators
- **Professional**: Clean, modern aesthetic
