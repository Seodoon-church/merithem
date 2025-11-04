import express from 'express'
import multer from 'multer'
import { auth } from '../middleware/auth'
import { analyzeSkinImage, quickSkinScan, getAIServiceHealth } from '../controllers/aiController'

const router = express.Router()

// Configure multer for memory storage (we'll forward to AI service)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  },
})

// POST /api/v1/ai/analyze - Full skin analysis
router.post('/analyze', auth, upload.single('image'), analyzeSkinImage)

// POST /api/v1/ai/quick-scan - Quick skin scan
router.post('/quick-scan', auth, upload.single('image'), quickSkinScan)

// GET /api/v1/ai/health - AI service health check
router.get('/health', auth, getAIServiceHealth)

export default router
