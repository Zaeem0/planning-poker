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
- Yarn package manager (1.22.0 or higher)

### Installation

1. Navigate to the project directory:

```bash
cd planning-poker
```

2. Install dependencies:

```bash
yarn install
```

3. Run the development server:

```bash
yarn dev
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

### Environment Variables

The app uses environment variables for configuration. See `.env.example` for all available options:

- `PORT` - Server port (default: 3000)
- `HOSTNAME` - Server hostname (default: 0.0.0.0 for production)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - CORS origin for Socket.IO (default: \*)
- `NEXT_PUBLIC_SOCKET_URL` - WebSocket server URL (leave empty for same origin)

### Local Development

A `.env.local` file is included with sensible defaults for local development:

- Server runs on `localhost:3000`
- CORS allows all origins
- Socket.IO connects to same origin

You can customize these values by editing `.env.local` as needed.

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🚀 Deployment

This app is ready to deploy to Render.com for free!

### Quick Deploy

1. Push your code to GitHub
2. Sign up at [render.com](https://render.com)
3. Create a new Web Service and connect your repository
4. Render will automatically detect the `render.yaml` configuration
5. Click "Apply" and deploy!

Your app will be live at `https://your-app-name.onrender.com`

### Detailed Instructions

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete step-by-step deployment instructions, troubleshooting, and configuration options.

### Other Platforms

While this app is optimized for Render, you can also deploy to:

- **Railway.app** - Similar to Render, supports WebSockets
- **Fly.io** - Requires Docker configuration
- **Any VPS** - DigitalOcean, Linode, AWS EC2, etc.

**Note**: Vercel and Netlify are **not compatible** due to WebSocket requirements.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is open source and available under the MIT License.
