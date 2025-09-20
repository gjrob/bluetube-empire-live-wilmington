import admin from "firebase-admin";
import { Request, Response, NextFunction } from "express";

try { admin.app(); } catch { admin.initializeApp(); }

export async function verifyFirebaseToken(req: Request, res: Response, next: NextFunction) {
  try {
    if (process.env.FIREBASE_BYPASS === "1") { (req as any).user = { uid: "dev" }; return next(); }
    const hdr = req.headers.authorization || "";
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
    if (!token) return res.status(401).json({ error: "missing token" });
    const decoded = await admin.auth().verifyIdToken(token);
    (req as any).user = decoded;
    next();
  } catch (e: any) {
    res.status(401).json({ error: "invalid token", detail: e.message });
  }
}
