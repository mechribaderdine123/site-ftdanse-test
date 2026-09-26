import { execFileSync, spawn } from "node:child_process";
import net from "node:net";

const localDatabaseUrl = "postgres://postgres:postgres@localhost:5432/federation";
const developmentEnv = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL || localDatabaseUrl,
  // Safe only for a local dev process. Production must set JWT_SECRET itself.
  JWT_SECRET: process.env.JWT_SECRET || "local-development-secret-change-before-production",
};

const waitForDatabase = () => new Promise((resolve, reject) => {
  const deadline = Date.now() + 60_000;
  const tryConnection = () => {
    const socket = net.connect({ host: "127.0.0.1", port: 5432 });
    socket.once("connect", () => { socket.end(); resolve(); });
    socket.once("error", () => {
      socket.destroy();
      if (Date.now() >= deadline) reject(new Error("PostgreSQL did not start on port 5432."));
      else setTimeout(tryConnection, 1000);
    });
  };
  tryConnection();
});

// Pick a port the API can actually bind. The docker-compose "api" service also
// publishes 4000, so probe for the first port in the range that is free.
const isPortFree = (port) => new Promise((resolve) => {
  const socket = net.connect({ host: "127.0.0.1", port });
  socket.once("connect", () => { socket.destroy(); resolve(false); });
  socket.once("error", () => { socket.destroy(); resolve(true); });
});
let apiPort = Number(process.env.PORT) || 4000;
while (!(await isPortFree(apiPort))) {
  if (apiPort >= 4000 + 20) throw new Error(`No free port found for the API between 4000 and ${apiPort}.`);
  apiPort += 1;
}
developmentEnv.PORT = String(apiPort);
developmentEnv.API_PORT = String(apiPort);
console.log(`[dev] API port: ${apiPort}`);

try {
  execFileSync("docker", ["compose", "up", "db", "-d"], { stdio: "inherit" });
  await waitForDatabase();
} catch (error) {
  console.error("Unable to start the local database. Install and start Docker Desktop, then run npm run dev again.");
  process.exit(1);
}

const run = (script) => process.platform === "win32"
  ? spawn(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", `npm run ${script}`], { stdio: "inherit", env: developmentEnv })
  : spawn("npm", ["run", script], { stdio: "inherit", env: developmentEnv });

const children = [run("dev:server"), run("dev:client")];

// npm is launched through cmd.exe on Windows. Terminating its complete process
// tree prevents a stale API from continuing to occupy its port after Ctrl+C.
const stop = () => children.forEach((child) => {
  if (!child.pid) return;
  if (process.platform === "win32") {
    try { execFileSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" }); } catch { /* already stopped */ }
  } else {
    child.kill();
  }
});
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
children.forEach((child) => child.on("exit", (code) => {
  if (code && code !== 0) process.exitCode = code;
}));
