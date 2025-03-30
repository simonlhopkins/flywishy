import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  server: {
    // headers: {
    //   "Content-Type": "video/mp4",
    //   "Accept-Ranges": "bytes", // Ensure range requests are supported
    // },
  },
  plugins: [react()],
});
