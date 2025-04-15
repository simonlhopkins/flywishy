import { create } from "zustand";
import { IPlanetShaderOptions } from "../ThreeJS/Planet";

// Type for the user object
interface User {
  email: string;
}

export interface VisualizerOptions extends IPlanetShaderOptions {
  waveformEnabled: boolean;
  flower: boolean;
  wishyMode: boolean;
}

// Zustand store type
interface UserStore {
  user: User | null;
  hasSeenIntro: boolean;
  darkMode: boolean;
  visualizerOptions: VisualizerOptions;
  isPlaying: boolean;
  airplaneMode: boolean;
  setUser: (email: string) => void;
  clearUser: () => void;
  setHasSeenIntro: (seen: boolean) => void;
  setVisualizerOptions: (options: VisualizerOptions) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setAirplaneMode: (airplaneMode: boolean) => void;
  setDarkMode: (darkMode: boolean) => void;
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
    airplaneMode: true,
    darkMode: false,
    visualizerOptions: {
      waveformEnabled: false,
      flower: false,
      wishyMode: false,
    },
    isPlaying: false,
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
    setHasSeenIntro: (hasSeenIntro) => {
      localStorage.setItem("hasSeenIntro", String(hasSeenIntro));
      set({ hasSeenIntro });
    },
    setVisualizerOptions: (visualizerOptions) => {
      set({ visualizerOptions });
    },
    setIsPlaying: (isPlaying) => {
      set({ isPlaying });
    },
    setAirplaneMode: (airplaneMode) => {
      set({ airplaneMode });
    },
    setDarkMode: (darkMode) => {
      set({ darkMode });
    },
  };
});

export default useUserStore;
