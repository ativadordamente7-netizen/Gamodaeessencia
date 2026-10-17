import { defineConfig, devices } from '@playwright/test';

// Testes de ponta a ponta: rodam sobre a versão de produção gerada por `npm run build`.
// Uso: npm run build && npm test   (na primeira vez: npx playwright install chromium)
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 0,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4321' },
  webServer: { command: 'npx vite preview --port 4321 --strictPort', url: 'http://localhost:4321', reuseExistingServer: true },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'celular', use: { ...devices['Pixel 7'] } },
  ],
});
