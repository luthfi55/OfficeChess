import express from "express";
import { createServer } from "http";
import cors from "cors";
import { initSocket } from "./socket";

const app = express();
const httpServer = createServer(app);

const allowedOrigins = (process.env.CLIENT_URL ?? "http://localhost:3000").split(",").map((o) => o.trim());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/health", (_, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

initSocket(httpServer);

const PORT = process.env.PORT ?? 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
