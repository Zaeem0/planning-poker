import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server, Socket } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

type UserRole = 'player' | 'spectator';

interface User {
  id: string;
  socketId: string;
  displayName: string;
  role: UserRole;
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
  displayName: string;
}

interface UserData {
  userId: string;
  gameId: string;
}

interface JoinGamePayload {
  gameId: string;
  userId?: string;
  username?: string;
  isSpectator?: boolean;
}

interface VotePayload {
  gameId: string;
  userId: string;
  vote: string | null;
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

interface ToggleRolePayload {
  gameId: string;
  userId: string;
}

// In-memory state
const games = new Map<string, Game>();
const users = new Map<string, UserData>();
const userProfiles = new Map<string, UserProfile>();

// Helper functions for game state management

function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

function getOrCreateGame(gameId: string): Game {
  if (!games.has(gameId)) {
    games.set(gameId, {
      users: new Map(),
      votes: new Map(),
      revealed: false,
      nextJoinOrder: 0,
    });
  }
  return games.get(gameId)!;
}

function getSortedUsersByJoinOrder(game: Game): User[] {
  return Array.from(game.users.values()).sort(
    (a, b) => a.joinOrder - b.joinOrder
  );
}

// Returns all votes if revealed, otherwise just the user's own vote for restoring selection
function getVotesForUser(
  game: Game,
  currentUserId: string
): { userId: string; vote: string }[] {
  if (game.revealed) {
    return Array.from(game.votes.entries()).map(([voterId, vote]) => ({
      userId: voterId,
      vote,
    }));
  }
  const userVote = game.votes.get(currentUserId);
  return userVote ? [{ userId: currentUserId, vote: userVote }] : [];
}

function markUserAsDisconnected(game: Game, userId: string): void {
  const user = game.users.get(userId);
  if (user) {
    user.connected = false;
  }
}

function resetUserVotes(game: Game): void {
  game.votes.clear();
  game.revealed = false;
  game.users.forEach((user) => {
    user.hasVoted = false;
  });
}

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
    pingTimeout: 120000,
    pingInterval: 25000,
    connectTimeout: 45000,
    maxHttpBufferSize: 1e6,
    transports: ['websocket', 'polling'],
    allowUpgrades: true,
  });

  io.on('connection', (socket: Socket) => {
    console.log('New connection:', socket.id);

    socket.on('error', (error) => {
      console.error('Socket error for', socket.id, ':', error);
    });

    socket.on(
      'join-game',
      ({
        gameId,
        userId: clientUserId,
        username,
        isSpectator,
      }: JoinGamePayload) => {
        let userId = clientUserId;
        let finalUsername: string | null = null;

        if (!userId) {
          userId = generateUserId();
        }

        if (userProfiles.has(userId)) {
          finalUsername = userProfiles.get(userId)!.displayName;
        } else if (username) {
          finalUsername = username;
          userProfiles.set(userId, { displayName: finalUsername });
        } else {
          socket.emit('user-joined', {
            userId,
            username: null,
            users: [],
            votes: [],
            revealed: false,
          });
          return;
        }

        socket.join(gameId);

        const game = getOrCreateGame(gameId);

        // Preserve join order for reconnecting users, assign new order for first-time joiners
        const hasVoted = game.votes.has(userId);
        const existingUser = game.users.get(userId);
        const joinOrder = existingUser
          ? existingUser.joinOrder
          : game.nextJoinOrder++;

        const userRole: UserRole =
          existingUser?.role ?? (isSpectator ? 'spectator' : 'player');
        game.users.set(userId, {
          id: userId,
          socketId: socket.id,
          displayName: finalUsername,
          role: userRole,
          hasVoted,
          joinOrder,
          connected: true,
        });

        users.set(socket.id, { userId, gameId });

        const votesData = getVotesForUser(game, userId);
        const sortedUsers = getSortedUsersByJoinOrder(game);

        console.log(
          'User joined:',
          finalUsername,
          'userId:',
          userId,
          'gameId:',
          gameId,
          'socketId:',
          socket.id
        );

        socket.emit('user-joined', {
          userId,
          username: finalUsername,
          users: sortedUsers,
          votes: votesData,
          revealed: game.revealed,
        });

        // Notify other users in the game
        socket.to(gameId).emit('user-list-updated', {
          users: sortedUsers,
        });
      }
    );

    // Handle vote submission
    socket.on('vote', ({ gameId, userId, vote }: VotePayload) => {
      const game = games.get(gameId);
      if (!game) return;

      const user = game.users.get(userId);
      if (vote === null) {
        game.votes.delete(userId);
        if (user) {
          user.hasVoted = false;
        }
      } else {
        game.votes.set(userId, vote);
        if (user) {
          user.hasVoted = true;
        }
      }

      // Broadcast updated user list (shows who has voted)
      io.to(gameId).emit('user-list-updated', {
        users: getSortedUsersByJoinOrder(game),
      });
    });

    // Handle vote reveal
    socket.on('reveal-votes', ({ gameId }: RevealVotesPayload) => {
      const game = games.get(gameId);
      if (!game) return;

      game.revealed = true;

      // Broadcast all votes to all users
      io.to(gameId).emit('votes-revealed', {
        votes: Array.from(game.votes.entries()).map(([userId, vote]) => ({
          userId,
          vote,
        })),
        revealed: true,
      });
    });

    // Handle new round (reset votes)
    socket.on('reset-votes', ({ gameId }: ResetVotesPayload) => {
      const game = games.get(gameId);
      if (!game) return;

      resetUserVotes(game);

      io.to(gameId).emit('votes-reset', {
        users: getSortedUsersByJoinOrder(game),
      });
    });

    // Handle emoji throwing between users
    socket.on(
      'throw-emoji',
      ({ gameId, targetUserId, emoji }: ThrowEmojiPayload) => {
        io.to(gameId).emit('emoji-thrown', { targetUserId, emoji });
      }
    );

    socket.on('toggle-role', ({ gameId, userId }: ToggleRolePayload) => {
      const game = games.get(gameId);
      if (!game) return;

      const user = game.users.get(userId);
      if (!user) return;

      const newRole: UserRole = user.role === 'player' ? 'spectator' : 'player';
      user.role = newRole;

      if (newRole === 'spectator') {
        game.votes.delete(userId);
        user.hasVoted = false;
      }

      io.to(gameId).emit('user-list-updated', {
        users: getSortedUsersByJoinOrder(game),
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', socket.id, 'Reason:', reason);
      const userData = users.get(socket.id);
      if (userData) {
        const { userId, gameId } = userData;
        const game = games.get(gameId);

        if (game) {
          markUserAsDisconnected(game, userId);

          // Broadcast updated user list so others see disconnected state
          io.to(gameId).emit('user-list-updated', {
            users: getSortedUsersByJoinOrder(game),
          });
        }

        users.delete(socket.id);
      }
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
