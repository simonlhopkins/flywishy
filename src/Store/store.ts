import { create } from "zustand";

interface State {
  isPlaying: boolean;
  videoSource: string;
  setIsPlaying(newIsPlaying: boolean): void;
  updateVideoSource(newSource: string): void;
}
const useStore = create<State>()((set) => ({
  isPlaying: false,
  videoSource: "./video/flyVideoSmall.mp4",
  updateVideoSource: (newSource: string) => {
    set((_state) => ({ isPlaying: false, videoSource: newSource }));
  },
  setIsPlaying: (newIsPlaying: boolean) =>
    set((_state) => ({ isPlaying: newIsPlaying })),
}));

export default useStore;
