import { create } from 'zustand';

export type UserRole = 'player' | 'spectator';

export interface User {
  id: string;
  displayName: string;
  role: UserRole;
  hasVoted: boolean;
  joinOrder: number;
  connected: boolean;
}

export interface Vote {
  userId: string;
  vote: string;
}

interface GameState {
  gameId: string;
  currentUserId: string;
  currentUserName: string;
  users: User[];
  votes: Vote[];
  revealed: boolean;
  selectedVote: string | null;
  setGameId: (gameId: string) => void;
  setCurrentUserId: (userId: string) => void;
  setCurrentUserName: (userName: string) => void;
  setUsers: (users: User[]) => void;
  setVotes: (votes: Vote[]) => void;
  setRevealed: (revealed: boolean) => void;
  setSelectedVote: (vote: string | null) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  gameId: '',
  currentUserId: '',
  currentUserName: '',
  users: [],
  votes: [],
  revealed: false,
  selectedVote: null,
  setGameId: (gameId) => set({ gameId }),
  setCurrentUserId: (currentUserId) => set({ currentUserId }),
  setCurrentUserName: (currentUserName) => set({ currentUserName }),
  setUsers: (users) => set({ users }),
  setVotes: (votes) => set({ votes }),
  setRevealed: (revealed) => set({ revealed }),
  setSelectedVote: (vote) => set({ selectedVote: vote }),
  reset: () => set({ selectedVote: null, votes: [], revealed: false }),
}));
