import os
import requests
import cv2
import io
import numpy as np   # ✅ thêm dòng này
from typing import Tuple

# Cấu hình từ môi trường hoặc tập tin chung
PINATA_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS"
API_KEY = os.getenv("PINATA_API_KEY")
SECRET = os.getenv("PINATA_SECRET")

class IPFSClient:
    def __init__(self):
        """Khởi tạo client và kiểm tra thông tin xác thực."""
        if not API_KEY or not SECRET:
            raise ValueError("PINATA_API_KEY and PINATA_SECRET must be set in .env")
        
        self.headers = {
            "pinata_api_key": API_KEY,
            "pinata_secret_api_key": SECRET
        }

    def upload_image_from_cv2(self, image, filename: str = "image.png") -> str:
        success, buffer = cv2.imencode('.png', image)
        if not success:
            raise Exception("Could not encode image to PNG format")

        file_stream = io.BytesIO(buffer.tobytes())
        files = {
            "file": (filename, file_stream)
        }

        try:
            response = requests.post(
                PINATA_URL,
                files=files,
                headers=self.headers,
                timeout=30
            )
            response.raise_for_status()
            
            ipfs_hash = response.json()["IpfsHash"]
            print(f"✅ Uploaded {filename} to IPFS: {ipfs_hash}")
            return ipfs_hash
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"IPFS Upload Error: {str(e)}")

    def upload_pvo_pair(self, original_img, watermarked_img) -> Tuple[str, str]:
        cid_orig = self.upload_image_from_cv2(original_img, "original_pvo.png")
        cid_watermarked = self.upload_image_from_cv2(watermarked_img, "watermarked_pvo.png")
        
        return cid_orig, cid_watermarked


# =========================
# NEW: DOWNLOAD FROM IPFS
# =========================
def download_image(cid: str):
    """
    Tải ảnh từ IPFS gateway và convert về OpenCV grayscale
    """
    url = f"https://gateway.pinata.cloud/ipfs/{cid}"

    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()

        img_array = np.frombuffer(response.content, np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_GRAYSCALE)

        if img is None:
            raise Exception(f"Invalid image from CID: {cid}")

        return img

    except requests.exceptions.RequestException as e:
        raise Exception(f"IPFS Download Error: {str(e)}")


def download_images(cid1: str, cid2: str):
    """
    Tải 2 ảnh từ IPFS
    """
    img1 = download_image(cid1)
    img2 = download_image(cid2)

    return img1, img2


# =========================
# SINGLETON
# =========================
_ipfs_client = None

def get_ipfs_client():
    global _ipfs_client
    if _ipfs_client is None:
        _ipfs_client = IPFSClient()
    return _ipfs_client


# =========================
# PUBLIC FUNCTIONS
# =========================
def upload_images(img1, img2):
    client = get_ipfs_client()
    return client.upload_pvo_pair(img1, img2)
