import { loadEnvConfig } from "@next/env";

// Carga las variables igual que Next.js. Con NODE_ENV=test se lee .env (y .env.test), pero no .env.local
loadEnvConfig(process.cwd());
