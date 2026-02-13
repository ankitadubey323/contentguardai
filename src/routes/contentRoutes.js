// // import {createContent } from "../controllers/contentControllers.js";
// // import validationanalyzeContent from '../middlewear/validation.js';

// // import express from "express";
// // const router = express.Router();

// // router.post("/content", validationanalyzeContent,createContent);


// // export default router

// import express from "express";
// import {
//   createContent,
//   getAllContent,
//   getContentById,
//   deleteContent,
//   getStats,
// } from "../controllers/contentControllers.js";
// import validationanalyzeContent from "../middlewear/validation.js";

// const router = express.Router();


// router.post("/content",         validationanalyzeContent, createContent);


// router.get("/content/stats",    getStats);


// router.get("/content",          getAllContent);


// router.get("/content/:id",      getContentById);


// router.delete("/content/:id",   deleteContent);

// export default router;

/**
 * ============================================
 * CONTENT ROUTES — ALTERNATIVE VERSION
 * Custom Rate Limits Per Endpoint
 * ============================================
 */

import express from "express";
import {
  createContent,
  getAllContent,
  getContentById,
  deleteContent,
  getStats,
} from "../controllers/contentControllers.js";

import validationanalyzeContent from "../middlewear/validation.js";
import rateLimiter from "../middlewear/reatelimiter.js";
import { idempotency } from "../middlewear/idempotency.js";

const router = express.Router();

// STRICT
router.post(
  "/content",
  rateLimiter({
    windowMs: 60000,
    max: 5,
    tier: "strict",
  }),
  idempotency({ ttl: 86400 }),
  validationanalyzeContent,
  createContent
);

// MODERATE
router.get(
  "/content/stats",
  rateLimiter({ max: 20 }),
  getStats
);

router.get(
  "/content",
  rateLimiter({ max: 20 }),
  getAllContent
);

router.get(
  "/content/:id",
  rateLimiter({ max: 20 }),
  getContentById
);

// DELETE
router.delete(
  "/content/:id",
  rateLimiter({ max: 10 }),
  deleteContent
);

export default router;