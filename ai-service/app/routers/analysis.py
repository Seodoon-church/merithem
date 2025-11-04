from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional
import logging

from app.services.skin_analysis import skin_analysis_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/skin")
async def analyze_skin(
    file: UploadFile = File(..., description="Skin image for analysis")
):
    """
    Analyze skin image and return comprehensive skin health metrics

    Returns:
    - 7 skin health scores (0-100)
    - Extracted features
    - Personalized recommendations
    - Overall skin health score
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail="File must be an image (JPEG, PNG, etc.)"
            )

        # Read image bytes
        image_bytes = await file.read()

        if len(image_bytes) == 0:
            raise HTTPException(
                status_code=400,
                detail="Empty file uploaded"
            )

        # Perform analysis
        result = skin_analysis_service.analyze_skin(image_bytes)

        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "message": "Skin analysis completed successfully",
                "data": result
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing skin image: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze image: {str(e)}"
        )


@router.post("/quick-scan")
async def quick_skin_scan(
    file: UploadFile = File(..., description="Skin image for quick scan")
):
    """
    Quick skin scan with basic metrics only

    Returns:
    - 7 skin health scores
    - Overall score
    """
    try:
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail="File must be an image"
            )

        image_bytes = await file.read()

        if len(image_bytes) == 0:
            raise HTTPException(
                status_code=400,
                detail="Empty file uploaded"
            )

        # Perform analysis
        result = skin_analysis_service.analyze_skin(image_bytes)

        # Return only scores and overall score for quick scan
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "message": "Quick scan completed",
                "data": {
                    "scores": result["scores"],
                    "overall_score": result["overall_score"],
                    "face_detected": result["face_detected"]
                }
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in quick scan: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to perform quick scan: {str(e)}"
        )


@router.get("/test")
async def test_analysis_service():
    """Test endpoint to verify analysis service is working"""
    return {
        "status": "success",
        "message": "Analysis service is operational",
        "endpoints": {
            "analyze_skin": "POST /api/v1/analysis/skin",
            "quick_scan": "POST /api/v1/analysis/quick-scan"
        }
    }
