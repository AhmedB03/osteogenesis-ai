import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests", timeout: 60000, workers: 1,
  use: { baseURL: "http://127.0.0.1:3100", browserName: "chromium", channel: "msedge", screenshot: "only-on-failure" },
  webServer: [
    { command: "python -m uvicorn osteogenesis.api:app --app-dir ../backend --port 8000", url: "http://127.0.0.1:8000/health", reuseExistingServer: !process.env.CI },
    { command: "npm run start -- --hostname 127.0.0.1 --port 3100", url: "http://127.0.0.1:3100", reuseExistingServer: !process.env.CI }
  ]
});
