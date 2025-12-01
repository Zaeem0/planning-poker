import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server, Socket } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Types
interface User {
  id: string;
  socketId: string;
  username: string;
  hasVoted: boolean;
}

interface Game {
  users: Map<string, User>;
  votes: Map<string, string>;
  revealed: boolean;
}

interface UserProfile {
  username: string;
}

interface UserData {
  userId: string;
  gameId: string;
}

interface JoinGamePayload {
  gameId: string;
  userId?: string;
  username?: string;
}

interface VotePayload {
  gameId: string;
  userId: string;
  vote: string;
}

interface RevealVotesPayload {
  gameId: string;
}

interface ResetVotesPayload {
  gameId: string;
}

interface ThrowEmojiPayload {
  gameId: string;
  targetUserId: string;
  emoji: string;
}

// Game state
const games = new Map<string, Game>();
const users = new Map<string, UserData>();
const userProfiles = new Map<string, UserProfile>();

function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    socket.on(
      "join-game",
      ({ gameId, userId: clientUserId, username }: JoinGamePayload) => {
        let userId = clientUserId;
        let finalUsername: string | null = null;
        let isReconnection = false;

        if (!userId) {
          userId = generateUserId();
        }

        if (userProfiles.has(userId)) {
          const profile = userProfiles.get(userId)!;
          finalUsername = profile.username;
          isReconnection = true;
        } else if (username) {
          finalUsername = username;
          userProfiles.set(userId, { username: finalUsername });
        } else {
          socket.emit("user-joined", {
            userId,
            username: null,
            users: [],
            votes: [],
            revealed: false,
          });
          return;
        }

        socket.join(gameId);

        const isNewGame = !games.has(gameId);
        if (isNewGame) {
          games.set(gameId, {
            users: new Map(),
            votes: new Map(),
            revealed: false,
          });
        }

        const game = games.get(gameId)!;

        const existingUser = game.users.get(userId);
        const hasVoted = existingUser ? existingUser.hasVoted : false;

        game.users.set(userId, {
          id: userId,
          socketId: socket.id,
          username: finalUsername,
          hasVoted,
        });

        users.set(socket.id, { userId, gameId });

        console.log(
          `User ${
            isReconnection ? "reconnected" : "joined"
          }: ${finalUsername} (${userId})`
        );

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

        socket.to(gameId).emit("user-list-updated", {
          users: Array.from(game.users.values()),
        });
      }
    );

    socket.on("vote", ({ gameId, userId, vote }: VotePayload) => {
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

    socket.on("reveal-votes", ({ gameId }: RevealVotesPayload) => {
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

    socket.on("reset-votes", ({ gameId }: ResetVotesPayload) => {
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

    socket.on(
      "throw-emoji",
      ({ gameId, targetUserId, emoji }: ThrowEmojiPayload) => {
        io.to(gameId).emit("emoji-thrown", { targetUserId, emoji });
      }
    );

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
