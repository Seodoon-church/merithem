import numpy as np
from typing import Dict, Optional
import random

from app.utils.image_processing import ImageProcessor


class SkinAnalysisService:
    """Service for AI-powered skin analysis"""

    def __init__(self):
        self.image_processor = ImageProcessor()
        # In production, load actual ML models here
        # self.model = load_model('path/to/model')

    def analyze_skin(self, image_bytes: bytes) -> Dict:
        """
        Perform comprehensive skin analysis on uploaded image

        Args:
            image_bytes: Raw image bytes

        Returns:
            Dictionary with analysis results including 7 skin metrics
        """
        # Preprocess image
        image = self.image_processor.preprocess_for_model(image_bytes, target_size=(224, 224))
        original_image = self.image_processor.load_image_from_bytes(image_bytes)

        # Detect face region (optional enhancement)
        face_region = self.image_processor.detect_face_region(original_image)

        # Extract features
        features = self.image_processor.extract_skin_features(original_image)

        # Calculate individual metrics
        scores = self._calculate_skin_scores(original_image, features)

        # Generate recommendations
        recommendations = self._generate_recommendations(scores)

        return {
            "scores": scores,
            "features": features,
            "face_detected": face_region is not None,
            "recommendations": recommendations,
            "overall_score": self._calculate_overall_score(scores)
        }

    def _calculate_skin_scores(self, image: np.ndarray, features: Dict) -> Dict[str, int]:
        """
        Calculate 7 skin health scores

        In production, these would use trained ML models.
        Currently using rule-based heuristics for demonstration.
        """
        # 1. Moisture (based on lightness and saturation)
        moisture_score = self._calculate_moisture_score(features)

        # 2. Elasticity (based on texture and brightness variance)
        elasticity_score = self._calculate_elasticity_score(features)

        # 3. Wrinkles (based on texture analysis)
        wrinkles_score = self.image_processor.calculate_texture_score(image)

        # 4. Pores (based on high-frequency texture)
        pores_score = self._calculate_pores_score(image)

        # 5. Pigmentation (based on color uniformity)
        pigmentation_score = self._calculate_pigmentation_score(features)

        # 6. Redness (based on red color detection)
        redness_score = self.image_processor.detect_redness(image)

        # 7. Acne (based on spot detection)
        acne_score = self._calculate_acne_score(image)

        return {
            "moisture": int(moisture_score),
            "elasticity": int(elasticity_score),
            "wrinkles": int(wrinkles_score),
            "pores": int(pores_score),
            "pigmentation": int(pigmentation_score),
            "redness": int(redness_score),
            "acne": int(acne_score)
        }

    def _calculate_moisture_score(self, features: Dict) -> float:
        """Calculate moisture score based on image features"""
        # High lightness + moderate saturation = good moisture
        lightness = features['lightness_mean']
        saturation = features['saturation_mean']

        # Normalize to 0-100 scale
        score = (lightness / 255 * 0.6 + saturation / 255 * 0.4) * 100

        # Add some realistic variance
        score = max(30, min(95, score + random.uniform(-10, 10)))

        return score

    def _calculate_elasticity_score(self, features: Dict) -> float:
        """Calculate elasticity score"""
        # Lower brightness variance = better elasticity
        brightness_std = features['brightness_std']

        score = max(0, 100 - (brightness_std / 2))
        score = max(35, min(95, score + random.uniform(-8, 8)))

        return score

    def _calculate_pores_score(self, image: np.ndarray) -> float:
        """Calculate pores visibility score"""
        # Use high-frequency analysis
        gray = np.mean(image, axis=2)
        high_freq = np.abs(np.gradient(gray)).mean()

        score = max(0, 100 - (high_freq * 200))
        score = max(40, min(95, score + random.uniform(-10, 10)))

        return score

    def _calculate_pigmentation_score(self, features: Dict) -> float:
        """Calculate pigmentation uniformity score"""
        # Lower standard deviation = more uniform = higher score
        lightness_std = features['lightness_std']

        score = max(0, 100 - (lightness_std / 1.5))
        score = max(35, min(95, score + random.uniform(-10, 10)))

        return score

    def _calculate_acne_score(self, image: np.ndarray) -> float:
        """Calculate acne/blemish score"""
        # Simple spot detection using color and texture
        hsv = np.array(image * 255, dtype=np.uint8)

        # In production, use trained model for acne detection
        # For now, use random score with realistic distribution
        score = random.uniform(45, 95)

        return score

    def _calculate_overall_score(self, scores: Dict[str, int]) -> int:
        """Calculate weighted overall skin health score"""
        weights = {
            "moisture": 0.15,
            "elasticity": 0.15,
            "wrinkles": 0.15,
            "pores": 0.15,
            "pigmentation": 0.15,
            "redness": 0.15,
            "acne": 0.10
        }

        overall = sum(scores[key] * weights[key] for key in scores.keys())

        return int(overall)

    def _generate_recommendations(self, scores: Dict[str, int]) -> list:
        """Generate personalized recommendations based on scores"""
        recommendations = []

        if scores['moisture'] < 60:
            recommendations.append({
                "category": "moisture",
                "severity": "high" if scores['moisture'] < 40 else "medium",
                "message": "피부 보습이 필요합니다. 하루 2회 보습제를 사용하세요.",
                "message_en": "Your skin needs more moisture. Use moisturizer twice daily.",
                "message_ja": "肌の保湿が必要です。1日2回保湿剤を使用してください。"
            })

        if scores['wrinkles'] < 60:
            recommendations.append({
                "category": "wrinkles",
                "severity": "high" if scores['wrinkles'] < 40 else "medium",
                "message": "주름 개선 제품 사용을 권장합니다.",
                "message_en": "Consider using anti-wrinkle products.",
                "message_ja": "しわ改善製品の使用をお勧めします。"
            })

        if scores['redness'] < 60:
            recommendations.append({
                "category": "redness",
                "severity": "high" if scores['redness'] < 40 else "medium",
                "message": "진정 효과가 있는 제품을 사용하세요.",
                "message_en": "Use soothing products to reduce redness.",
                "message_ja": "鎮静効果のある製品を使用してください。"
            })

        if scores['acne'] < 60:
            recommendations.append({
                "category": "acne",
                "severity": "high" if scores['acne'] < 40 else "medium",
                "message": "여드름 관리 제품 사용을 권장합니다.",
                "message_en": "Consider using acne treatment products.",
                "message_ja": "にきびケア製品の使用をお勧めします。"
            })

        if scores['pores'] < 60:
            recommendations.append({
                "category": "pores",
                "severity": "high" if scores['pores'] < 40 else "medium",
                "message": "모공 케어 제품을 사용하세요.",
                "message_en": "Use pore care products.",
                "message_ja": "毛穴ケア製品を使用してください。"
            })

        if not recommendations:
            recommendations.append({
                "category": "general",
                "severity": "low",
                "message": "피부 상태가 양호합니다. 현재 루틴을 유지하세요.",
                "message_en": "Your skin is in good condition. Maintain your current routine.",
                "message_ja": "肌の状態は良好です。現在のルーチンを維持してください。"
            })

        return recommendations


# Global service instance
skin_analysis_service = SkinAnalysisService()
