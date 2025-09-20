import express from "express";
import cors from "cors";
import market from "./routes/market";
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.json());

// Keep health check public
app.get("/health", (_req, res) => res.json({ ok: true }));

// Entire /api/market is already guarded by router.use(verifyFirebaseToken)
app.use("/api/market", market);

app.listen(process.env.PORT || 8080);
