# 🃏 Planning Poker

A real-time Planning Poker application built with Next.js, Socket.io, and TypeScript. Perfect for agile teams to estimate story points collaboratively.

## ✨ Key Features

- **Real-time Collaboration** - Multiple users can join and vote simultaneously
- **Persistent Sessions** - Votes and positions maintained across page refreshes
- **Size-Based Voting** - Intuitive estimates (🐜 XS → 🦕 XL)
- **Keyboard Shortcuts** - Quick voting with S, M, L, XS, XL, ? keys
- **Vote Statistics** - View distribution and most common estimate
- **Disconnection Handling** - See who's offline with visual indicators
- **Spectator Mode** - Join as observer without voting ability
- **Celebration Confetti** - Animated confetti burst for 100% unanimous votes
- **Emoji Throwing** - Fun interactions between players

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
│   ├── PlayerCard.tsx         # Individual player card component
│   ├── ConfettiContainer.tsx  # Confetti animation container
│   ├── EmojiPicker.tsx        # Emoji selection for throwing
│   ├── EmojiProjectile.tsx    # Emoji animation component
│   ├── GameHeader.tsx         # Header with controls
│   ├── GameControls.tsx       # Reveal/Reset buttons
│   ├── GameSettingsButton.tsx # Game settings dropdown menu
│   ├── RoleToggle.tsx         # Player/Spectator role switch
│   ├── ThemeToggle.tsx        # Light/Dark mode switch
│   ├── CardSetSelector.tsx    # Voting scale selection
│   ├── CreateGameButton.tsx   # Shared create game button
│   ├── JoinGameForm.tsx       # Join game form
│   ├── GitInfo.tsx            # Git commit info display
│   ├── Loader.tsx             # Loading spinner component
│   └── Toast.tsx              # Toast notifications
├── styles/
│   ├── _variables.scss        # SCSS variables
│   ├── globals.scss           # Global styles
│   ├── game.scss              # Game page styles
│   ├── poker-table.scss       # Table, card, and confetti styles
│   └── components.scss        # Shared component styles
├── lib/
│   ├── hooks/
│   │   ├── useConfetti.ts           # Confetti animation hook
│   │   ├── useConfettiOrigin.ts     # Confetti origin calculation
│   │   ├── useEmojiAnimations.ts    # Emoji throwing animations
│   │   ├── useKeyboardVoting.ts     # Keyboard shortcuts
│   │   ├── useGameActions.ts        # Game action handlers
│   │   ├── usePageVisibility.ts     # Tab visibility tracking
│   │   ├── useActivityHeartbeat.ts  # Idle detection & pings
│   │   ├── useUnanimousChime.ts     # Audio feedback for reveals
│   │   └── useCopyToClipboard.ts    # Clipboard functionality
│   ├── store.ts               # Zustand state management
│   ├── socket.ts              # Socket.io client hooks
│   ├── constants.ts           # Card values and emojis
│   ├── vote-utils.ts          # Vote calculation utilities
│   ├── card-utils.ts          # Card className utilities
│   ├── game-utils.ts          # Game ID generation
│   └── clipboard.ts           # Clipboard helper
├── e2e/
│   ├── connection-stability.spec.ts # Reconnect & timeout tests
│   ├── role-switching.spec.ts       # Spectator/Player toggle tests
│   ├── voting.spec.ts         # Voting E2E tests
│   ├── multi-user-sync.spec.ts # Multi-user E2E tests
│   ├── persistence.spec.ts    # Persistence E2E tests
│   └── joining.spec.ts        # Join flow E2E tests
└── server.ts                  # Custom Socket.io server (TypeScript)
```

## 📝 Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint
- `yarn test:e2e` - Run Playwright E2E tests
- `yarn test:e2e:ui` - Run E2E tests with UI

## 📚 Documentation

- **[Features Guide](./FEATURES.md)** - Complete feature list and technical details
- **[Deployment Guide](./DEPLOYMENT.md)** - Step-by-step deployment instructions

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT License - feel free to use this project for your team!
