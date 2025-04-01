import { create } from "zustand";

// Type for the user object
interface User {
  email: string;
}

// Zustand store type
interface UserStore {
  user: User | null;
  hasSeenIntro: boolean;
  setUser: (email: string) => void;
  clearUser: () => void;
  setHasSeenIntro: (seen: boolean) => void;
}

// LocalStorage persistence handler
const localStorageKey = "user";

function loadOrDefault<T>(key: string, initial: T): T {
  const storedValue = localStorage.getItem(key);
  return storedValue ? JSON.parse(storedValue) : initial;
}

const useUserStore = create<UserStore>((set) => {
  return {
    user: loadOrDefault<User | null>("user", null),
    hasSeenIntro: loadOrDefault<boolean>("hasSeenIntro", false),
    // Set user and persist to localStorage
    setUser: (email) => {
      const newUser = { email };
      localStorage.setItem(localStorageKey, JSON.stringify(newUser));
      set({ user: newUser });
    },
    // Clear user and remove from localStorage
    clearUser: () => {
      localStorage.removeItem(localStorageKey);
      set({ user: null });
    },
    setHasSeenIntro: (seen) => {
      localStorage.setItem("hasSeenIntro", String(seen));
      set({ hasSeenIntro: seen });
    },
  };
});

export default useUserStore;
