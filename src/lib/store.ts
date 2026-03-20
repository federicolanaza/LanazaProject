
import { create } from 'zustand';
import { User, VisitEntry } from './types';
import { MOCK_USERS, MOCK_VISITS } from './mock-data';

interface AppState {
  currentUser: User | null;
  users: User[];
  visits: VisitEntry[];
  setCurrentUser: (user: User | null) => void;
  addVisit: (visit: VisitEntry) => void;
  toggleBlockUser: (userId: string) => void;
  searchUsers: (query: string) => User[];
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  users: MOCK_USERS,
  visits: MOCK_VISITS,
  setCurrentUser: (user) => set({ currentUser: user }),
  addVisit: (visit) => set((state) => ({ visits: [visit, ...state.visits] })),
  toggleBlockUser: (userId) => set((state) => ({
    users: state.users.map(u => u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u)
  })),
  searchUsers: (query) => {
    if (!query) return get().users;
    return get().users.filter(u => 
      u.name.toLowerCase().includes(query.toLowerCase()) || 
      u.email.toLowerCase().includes(query.toLowerCase())
    );
  }
}));
