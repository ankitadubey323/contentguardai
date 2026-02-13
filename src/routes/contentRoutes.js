

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



// import express from 'express'
// import * as contentController from '../controllers/contentController.js'

// const router = express.Router()

// // POST /api/content - Create new content for analysis
// router.post('/content', contentController.createContent)

// // GET /api/content - Get all content (paginated)
// router.get('/content', contentController.getContent)

// // GET /api/content/stats - Get statistics
// router.get('/content/stats', contentController.getStats)

// // GET /api/content/:id - Get single content by ID
// router.get('/content/:id', contentController.getContentById)

// // DELETE /api/content/:id - Delete content
// router.delete('/content/:id', contentController.deleteContent)

// export default router

// import express from 'express'
// import { 
//   createContent, 
//   getContent, 
//   getContentById, 
//   deleteContent, 
//   getStats 
// } from '../controllers/contentController.js'

// const router = express.Router()

// // POST /api/content - Create new content for analysis
// router.post('/content', createContent)

// // GET /api/content - Get all content (paginated)
// router.get('/content', getContent)

// // GET /api/content/stats - Get statistics
// router.get('/content/stats', getStats)

// // GET /api/content/:id - Get single content by ID
// router.get('/content/:id', getContentById)

// // DELETE /api/content/:id - Delete content
// router.delete('/content/:id', deleteContent)

// export default router
