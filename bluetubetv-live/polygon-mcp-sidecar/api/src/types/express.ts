// api/src/types/express.d.ts
import "express-serve-static-types";

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        [k: string]: any; // decoded Firebase fields
      };
    }
  }
}
