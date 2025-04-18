import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { plugin as mdPlugin, Mode } from "vite-plugin-markdown";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    mdPlugin({
      mode: [Mode.REACT],
    }),
  ],
  server: {
    cors: true,
  },
});
