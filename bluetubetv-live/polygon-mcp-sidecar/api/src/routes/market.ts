import { Router } from "express";
import { LRUCache } from "lru-cache";              // ✅ use LRUCache
import { verifyFirebaseToken } from "../middleware/auth";
import { getQuote } from "../services/mcpClient";

const router = Router();
router.use(verifyFirebaseToken);

const cache = new LRUCache<string, any>({ max: 500, ttl: 500 });

router.get("/quote/:symbol", async (req, res) => {
  try {
    const sym = req.params.symbol.toUpperCase();
    const hit = cache.get(sym);
    if (hit) return res.json(hit);
    const data = await getQuote(sym);
    cache.set(sym, data);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
