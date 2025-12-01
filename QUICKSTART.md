# Quick Start Guide

## Running the App

1. **Start the server:**

   ```bash
   npm run dev
   ```

2. **Open your browser:**

   - Navigate to http://localhost:3000

3. **Create a game:**

   - Click "Create New Game"
   - You'll be redirected to a game room with a unique ID

4. **Enter your name:**

   - Type your name or leave blank for a random name
   - Click "Join Game"

5. **Invite others:**

   - Share the URL or Game ID with your team
   - They can join by entering the Game ID or clicking the link

6. **Start voting:**
   - Each player selects a size estimate card:
     - 🐜 Extra Small (< 1 day)
     - 🐰 Small (1 - 2 days)
     - 🐶 Medium (1 week)
     - 🦒 Large (2 weeks)
     - 🦕 Extra Large (2+ weeks)
   - Click "Reveal Cards" when everyone has voted
   - View the results and most common estimate
   - Click "New Round" to start over

## Testing Locally

To test with multiple users on the same machine:

1. Open the game in your main browser
2. Copy the game URL
3. Open it in:
   - An incognito/private window
   - A different browser
   - Multiple tabs (each will be a different user)

## Features to Try

- ✅ Enter custom username or use auto-generated name
- ✅ Vote with size-based estimate cards (🐜 🐰 🐶 🦒 🦕)
- ✅ See striped pattern on cards when players have voted
- ✅ Reveal all votes at once
- ✅ View most common estimate with percentage overlays
- ✅ Reset and start a new round
- ✅ Copy game link to share
- ✅ Throw emojis at other players for fun

## Troubleshooting

**Port already in use?**

- Change the port in `server.js` (line 7)

**Socket connection issues?**

- Make sure the server is running
- Check browser console for errors

**Users not appearing?**

- Refresh the page
- Check that you're on the same game ID

Enjoy your Planning Poker sessions! 🃏
