const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Game state
const games = new Map();
const users = new Map();

function generateUserId() {
  return `user_${Math.random().toString(36).substr(2, 9)}`;
}

function generateUsername() {
  const adjectives = [
    "Happy",
    "Clever",
    "Swift",
    "Brave",
    "Wise",
    "Kind",
    "Bold",
    "Calm",
  ];
  const animals = [
    "Panda",
    "Tiger",
    "Eagle",
    "Fox",
    "Wolf",
    "Bear",
    "Lion",
    "Hawk",
  ];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${
    animals[Math.floor(Math.random() * animals.length)]
  }`;
}

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-game", ({ gameId, username }) => {
      const userId = generateUserId();
      const finalUsername = username || generateUsername();

      socket.join(gameId);

      const isNewGame = !games.has(gameId);
      if (isNewGame) {
        games.set(gameId, {
          users: new Map(),
          votes: new Map(),
          revealed: false,
        });
      }

      const game = games.get(gameId);

      game.users.set(userId, {
        id: userId,
        socketId: socket.id,
        username: finalUsername,
        hasVoted: false,
      });

      users.set(socket.id, { userId, gameId });

      // Send current game state to the new user
      socket.emit("user-joined", {
        userId,
        username: finalUsername,
        users: Array.from(game.users.values()),
        votes: game.revealed
          ? Array.from(game.votes.entries()).map(([id, vote]) => ({
              userId: id,
              vote,
            }))
          : [],
        revealed: game.revealed,
      });

      // Notify others
      socket.to(gameId).emit("user-list-updated", {
        users: Array.from(game.users.values()),
      });
    });

    socket.on("vote", ({ gameId, userId, vote }) => {
      const game = games.get(gameId);
      if (!game) return;

      game.votes.set(userId, vote);
      const user = game.users.get(userId);
      if (user) {
        user.hasVoted = true;
      }

      // Broadcast vote status (not the actual vote unless revealed)
      io.to(gameId).emit("user-list-updated", {
        users: Array.from(game.users.values()),
      });
    });

    socket.on("reveal-votes", ({ gameId }) => {
      const game = games.get(gameId);
      if (!game) return;

      game.revealed = true;

      io.to(gameId).emit("votes-revealed", {
        votes: Array.from(game.votes.entries()).map(([userId, vote]) => ({
          userId,
          vote,
        })),
        revealed: true,
      });
    });

    socket.on("reset-votes", ({ gameId }) => {
      const game = games.get(gameId);
      if (!game) return;

      game.votes.clear();
      game.revealed = false;

      game.users.forEach((user) => {
        user.hasVoted = false;
      });

      io.to(gameId).emit("votes-reset", {
        users: Array.from(game.users.values()),
      });
    });

    socket.on("throw-emoji", ({ gameId, targetUserId, emoji }) => {
      io.to(gameId).emit("emoji-thrown", { targetUserId, emoji });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      const userData = users.get(socket.id);
      if (userData) {
        const { userId, gameId } = userData;
        const game = games.get(gameId);

        if (game) {
          game.users.delete(userId);
          game.votes.delete(userId);

          io.to(gameId).emit("user-list-updated", {
            users: Array.from(game.users.values()),
          });
        }

        users.delete(socket.id);
      }
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
