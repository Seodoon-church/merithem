from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from dotenv import load_dotenv

from app.routers import analysis

load_dotenv()

app = FastAPI(
    title="LUMI+ AI Service",
    description="AI-powered skin analysis service",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure based on environment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return JSONResponse(
        status_code=200,
        content={
            "status": "success",
            "message": "AI Service is healthy",
            "service": "LUMI+ AI Service",
            "version": "1.0.0"
        }
    )

# Include routers
app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["analysis"])

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to LUMI+ AI Service",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
