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
  joinOrder: number;
  connected: boolean;
}

interface Game {
  users: Map<string, User>;
  votes: Map<string, string>;
  revealed: boolean;
  nextJoinOrder: number;
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
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
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
            nextJoinOrder: 0,
          });
        }

        const game = games.get(gameId)!;

        // Check if user has voted by looking at game.votes
        const hasVoted = game.votes.has(userId);

        // Check if user already has a join order (reconnecting)
        const existingUser = game.users.get(userId);
        const joinOrder = existingUser
          ? existingUser.joinOrder
          : game.nextJoinOrder++;

        game.users.set(userId, {
          id: userId,
          socketId: socket.id,
          username: finalUsername,
          hasVoted,
          joinOrder,
          connected: true,
        });

        users.set(socket.id, { userId, gameId });

        console.log(
          `User ${
            isReconnection ? "reconnected" : "joined"
          }: ${finalUsername} (${userId})`
        );

        const votesData = game.revealed
          ? Array.from(game.votes.entries()).map(([id, vote]) => ({
              userId: id,
              vote,
            }))
          : [];

        console.log("Sending user-joined event:", {
          userId,
          username: finalUsername,
          usersCount: game.users.size,
          votesCount: votesData.length,
          revealed: game.revealed,
          totalVotesInGame: game.votes.size,
        });

        // Sort users by join order to maintain consistent positioning
        // Send all users (connected and disconnected) so client can show disconnected state
        const sortedUsers = Array.from(game.users.values()).sort(
          (a, b) => a.joinOrder - b.joinOrder
        );

        socket.emit("user-joined", {
          userId,
          username: finalUsername,
          users: sortedUsers,
          votes: votesData,
          revealed: game.revealed,
        });

        socket.to(gameId).emit("user-list-updated", {
          users: sortedUsers,
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
      const sortedUsers = Array.from(game.users.values()).sort(
        (a, b) => a.joinOrder - b.joinOrder
      );
      io.to(gameId).emit("user-list-updated", {
        users: sortedUsers,
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

      const sortedUsers = Array.from(game.users.values()).sort(
        (a, b) => a.joinOrder - b.joinOrder
      );
      io.to(gameId).emit("votes-reset", {
        users: sortedUsers,
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
          const user = game.users.get(userId);
          if (user) {
            // Mark user as disconnected instead of deleting
            user.connected = false;
          }

          // Keep votes on disconnect to allow reconnection with vote intact
          // Votes are only cleared when "New Round" is clicked

          // Send all users so client can show disconnected state
          const sortedUsers = Array.from(game.users.values()).sort(
            (a, b) => a.joinOrder - b.joinOrder
          );

          io.to(gameId).emit("user-list-updated", {
            users: sortedUsers,
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
