import cv2
import numpy as np
from PIL import Image
import io
from typing import Tuple, Optional

class ImageProcessor:
    """Utility class for image preprocessing and analysis"""

    @staticmethod
    def load_image_from_bytes(image_bytes: bytes) -> np.ndarray:
        """Load image from bytes"""
        image = Image.open(io.BytesIO(image_bytes))
        return np.array(image)

    @staticmethod
    def resize_image(image: np.ndarray, target_size: Tuple[int, int] = (224, 224)) -> np.ndarray:
        """Resize image to target size"""
        return cv2.resize(image, target_size, interpolation=cv2.INTER_AREA)

    @staticmethod
    def normalize_image(image: np.ndarray) -> np.ndarray:
        """Normalize image pixels to [0, 1] range"""
        return image.astype(np.float32) / 255.0

    @staticmethod
    def preprocess_for_model(image_bytes: bytes, target_size: Tuple[int, int] = (224, 224)) -> np.ndarray:
        """Complete preprocessing pipeline for model input"""
        # Load image
        image = ImageProcessor.load_image_from_bytes(image_bytes)

        # Convert to RGB if needed
        if len(image.shape) == 2:  # Grayscale
            image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
        elif image.shape[2] == 4:  # RGBA
            image = cv2.cvtColor(image, cv2.COLOR_RGBA2RGB)

        # Resize
        image = ImageProcessor.resize_image(image, target_size)

        # Normalize
        image = ImageProcessor.normalize_image(image)

        return image

    @staticmethod
    def detect_face_region(image: np.ndarray) -> Optional[Tuple[int, int, int, int]]:
        """Detect face region in image using Haar Cascade"""
        # Convert to grayscale for face detection
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)

        # Load Haar Cascade (you may need to adjust path in production)
        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )

        # Detect faces
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )

        if len(faces) > 0:
            # Return the largest face
            largest_face = max(faces, key=lambda rect: rect[2] * rect[3])
            return tuple(largest_face)

        return None

    @staticmethod
    def extract_skin_features(image: np.ndarray) -> dict:
        """Extract basic skin features from image"""
        # Convert to different color spaces
        hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
        lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)

        # Calculate basic statistics
        features = {
            # Brightness (V channel in HSV)
            'brightness_mean': float(np.mean(hsv[:, :, 2])),
            'brightness_std': float(np.std(hsv[:, :, 2])),

            # Saturation (S channel in HSV)
            'saturation_mean': float(np.mean(hsv[:, :, 1])),
            'saturation_std': float(np.std(hsv[:, :, 1])),

            # Lightness (L channel in LAB)
            'lightness_mean': float(np.mean(lab[:, :, 0])),
            'lightness_std': float(np.std(lab[:, :, 0])),

            # RGB statistics
            'red_mean': float(np.mean(image[:, :, 0])),
            'green_mean': float(np.mean(image[:, :, 1])),
            'blue_mean': float(np.mean(image[:, :, 2])),
        }

        return features

    @staticmethod
    def calculate_texture_score(image: np.ndarray) -> float:
        """Calculate texture score using Laplacian variance"""
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

        # Normalize to 0-100 scale
        # Higher variance = more texture/wrinkles
        # Inverse for score (smooth skin = higher score)
        score = max(0, min(100, 100 - (laplacian_var / 10)))

        return float(score)

    @staticmethod
    def detect_redness(image: np.ndarray) -> float:
        """Detect redness level in skin"""
        # Convert to HSV
        hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)

        # Define red color range in HSV
        lower_red1 = np.array([0, 50, 50])
        upper_red1 = np.array([10, 255, 255])
        lower_red2 = np.array([170, 50, 50])
        upper_red2 = np.array([180, 255, 255])

        # Create masks
        mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
        mask2 = cv2.inRange(hsv, lower_red2, upper_red2)

        # Combine masks
        red_mask = cv2.bitwise_or(mask1, mask2)

        # Calculate percentage of red pixels
        red_percentage = (np.sum(red_mask > 0) / red_mask.size) * 100

        # Convert to score (inverse - less red = higher score)
        score = max(0, min(100, 100 - (red_percentage * 2)))

        return float(score)
