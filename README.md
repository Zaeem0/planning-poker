# 🃏 Planning Poker

A real-time Planning Poker application built with Next.js, Socket.io, and TypeScript. Perfect for agile teams to estimate story points collaboratively.

## ✨ Features

- **Real-time Collaboration** - Multiple users can join and vote simultaneously
- **Custom Usernames** - Enter your own name or get a random one automatically
- **Size-Based Voting Cards** - Intuitive size estimates:
  - 🐜 Extra Small (< 1 day)
  - 🐰 Small (1 - 2 days)
  - 🐶 Medium (1 week)
  - 🦒 Large (2 weeks)
  - 🦕 Extra Large (2+ weeks)
- **Vote Status Indicators** - See who has voted without revealing their choice
- **Reveal Mechanism** - Show all votes at once when ready
- **Results & Statistics** - View most common estimate and vote distribution
- **Reset Functionality** - Start a new round with one click
- **Shareable Game Links** - Easy game ID sharing for team collaboration
- **Responsive Design** - Works on desktop, tablet, and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:

```bash
cd planning-poker
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎮 How to Use

1. **Create a Game**

   - Click "Create New Game" on the home page
   - Share the game ID or URL with your team

2. **Join a Game**

   - Enter the game ID on the home page, or
   - Click the shared game link

3. **Vote**

   - Select a card value to cast your vote
   - Your vote is hidden until revealed

4. **Reveal**

   - Once everyone has voted, click "Reveal Cards"
   - View results and statistics

5. **New Round**
   - Click "New Round" to reset and start voting again

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: SCSS
- **Real-time**: Socket.io
- **State Management**: Zustand
- **Server**: Custom Node.js server with Socket.io

## 📁 Project Structure

```
planning-poker/
├── app/
│   ├── game/[id]/page.tsx    # Game room page
│   ├── page.tsx               # Home page
│   └── layout.tsx             # Root layout
├── components/
│   ├── PokerTable.tsx         # Poker table with player cards
│   ├── VotingCards.tsx        # Voting card selector with results
│   ├── GameHeader.tsx         # Header with controls
│   ├── GameControls.tsx       # Reveal/Reset buttons
│   ├── CreateGameButton.tsx   # Shared create game button
│   ├── JoinGameForm.tsx       # Join game form
│   └── Toast.tsx              # Toast notifications
├── styles/
│   ├── _variables.scss        # SCSS variables
│   ├── globals.scss           # Global styles
│   ├── game.scss              # Game page styles
│   └── poker-table.scss       # Table and card styles
├── lib/
│   ├── store.ts               # Zustand state management
│   ├── socket.ts              # Socket.io client hooks
│   └── constants.ts           # Card values
└── server.js                  # Custom Socket.io server
```

## 🔧 Configuration

The app runs on port 3000 by default. To change this, modify the `port` variable in `server.js`.

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is open source and available under the MIT License.
