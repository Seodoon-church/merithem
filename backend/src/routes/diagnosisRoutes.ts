import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import {
  getDiagnoses,
  getDiagnosis,
  createDiagnosis,
  deleteDiagnosis,
  getDiagnosisStats,
} from '../controllers/diagnosisController'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

/**
 * @route   GET /api/v1/diagnoses
 * @desc    Get all diagnoses for current user
 * @access  Private
 */
router.get('/', getDiagnoses)

/**
 * @route   GET /api/v1/diagnoses/stats
 * @desc    Get diagnosis statistics
 * @access  Private
 */
router.get('/stats', getDiagnosisStats)

/**
 * @route   GET /api/v1/diagnoses/:id
 * @desc    Get diagnosis by ID
 * @access  Private
 */
router.get('/:id', getDiagnosis)

/**
 * @route   POST /api/v1/diagnoses
 * @desc    Create a new diagnosis record
 * @access  Private
 */
router.post('/', createDiagnosis)

/**
 * @route   DELETE /api/v1/diagnoses/:id
 * @desc    Delete diagnosis
 * @access  Private
 */
router.delete('/:id', deleteDiagnosis)

export default router
