# 🃏 Planning Poker

A real-time Planning Poker application built with Next.js, Socket.io, and TypeScript. Perfect for agile teams to estimate story points collaboratively.

## ✨ Key Features

- **Real-time Collaboration** - Multiple users can join and vote simultaneously
- **Persistent Sessions** - Votes and positions maintained across page refreshes
- **Size-Based Voting** - Intuitive estimates (🐜 XS → 🦕 XL)
- **Keyboard Shortcuts** - Quick voting with S, M, L, XS, XL, ? keys
- **Vote Statistics** - View distribution and most common estimate
- **Disconnection Handling** - See who's offline with visual indicators

📖 **[View Complete Feature List →](./FEATURES.md)**

## 🚀 Quick Start

### Prerequisites

- Node.js 22+ (LTS)
- Yarn 1.22.0+

### Local Development

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Open http://localhost:3000
```

### Production Deployment

Deploy to Render.com in 5 minutes:

```bash
# Push to GitHub
git push origin main

# Then follow the deployment guide
```

📚 **[Full Deployment Guide →](./DEPLOYMENT.md)**

## 🎮 How to Use

1. **Create a Game** - Click "Create New Game" and share the URL
2. **Vote** - Select a card or use keyboard shortcuts (S, M, L, etc.)
3. **Reveal** - Click "Reveal Cards" to show all votes
4. **New Round** - Reset and start over

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript 5
- **Styling**: SCSS (Sass)
- **Real-time**: Socket.io 4.8
- **State Management**: Zustand 5
- **Server**: Custom Node.js server with Socket.io
- **Runtime**: Node.js 22+ (LTS), Yarn 1.22+

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
│   ├── Loader.tsx             # Loading spinner component
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
└── server.ts                  # Custom Socket.io server (TypeScript)
```

## 📝 Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint

## 📚 Documentation

- **[Features Guide](./FEATURES.md)** - Complete feature list and technical details
- **[Deployment Guide](./DEPLOYMENT.md)** - Step-by-step deployment instructions

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT License - feel free to use this project for your team!
