import { create } from 'zustand';

export interface User {
  id: string;
  username: string;
  hasVoted: boolean;
  joinOrder: number;
  connected: boolean;
  isSpectator: boolean;
}

export interface Vote {
  userId: string;
  vote: string;
}

interface GameState {
  gameId: string;
  userId: string;
  username: string;
  users: User[];
  votes: Vote[];
  revealed: boolean;
  selectedVote: string | null;
  gameCreatorUserId: string | null;
  setGameId: (gameId: string) => void;
  setUserId: (userId: string) => void;
  setUsername: (username: string) => void;
  setUsers: (users: User[]) => void;
  setVotes: (votes: Vote[]) => void;
  setRevealed: (revealed: boolean) => void;
  setSelectedVote: (vote: string | null) => void;
  setGameCreatorUserId: (gameCreatorUserId: string | null) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  gameId: '',
  userId: '',
  username: '',
  users: [],
  votes: [],
  revealed: false,
  selectedVote: null,
  gameCreatorUserId: null,
  setGameId: (gameId) => set({ gameId }),
  setUserId: (userId) => set({ userId }),
  setUsername: (username) => set({ username }),
  setUsers: (users) => set({ users }),
  setVotes: (votes) => set({ votes }),
  setRevealed: (revealed) => set({ revealed }),
  setSelectedVote: (vote) => set({ selectedVote: vote }),
  setGameCreatorUserId: (gameCreatorUserId) => set({ gameCreatorUserId }),
  reset: () => set({ selectedVote: null, votes: [], revealed: false }),
}));
