import os
import requests
import cv2
import io
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
        """
        Mã hóa ảnh từ OpenCV và upload lên IPFS.
        :param image: Đối tượng ảnh OpenCV (numpy array).
        :param filename: Tên hiển thị trên Pinata dashboard.
        """
        # Encode ảnh sang định dạng PNG để giữ nguyên chất lượng cho logic PVO
        success, buffer = cv2.imencode('.png', image)
        if not success:
            raise Exception("Could not encode image to PNG format")

        # Sử dụng BytesIO để tránh việc ghi file tạm ra ổ cứng
        file_stream = io.BytesIO(buffer.tobytes())
        files = {
            "file": (filename, file_stream)
        }

        try:
            response = requests.post(PINATA_URL, files=files, headers=self.headers, timeout=30)
            response.raise_for_status() # Tự động raise lỗi nếu status code >= 400
            
            ipfs_hash = response.json()["IpfsHash"]
            print(f"✅ Uploaded {filename} to IPFS: {ipfs_hash}")
            return ipfs_hash
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"IPFS Upload Error: {str(e)}")

    def upload_pvo_pair(self, original_img, watermarked_img) -> Tuple[str, str]:
        """
        Upload cặp ảnh (gốc và đã nhúng watermark) lên IPFS.
        Hữu ích cho hàm storeRecord trong Smart Contract cần 2 CID[cite: 2].
        """
        cid_orig = self.upload_image_from_cv2(original_img, "original_pvo.png")
        cid_watermarked = self.upload_image_from_cv2(watermarked_img, "watermarked_pvo.png")
        
        return cid_orig, cid_watermarked

# Singleton instance để sử dụng ở các module khác
_ipfs_client = None

def get_ipfs_client():
    global _ipfs_client
    if _ipfs_client is None:
        _ipfs_client = IPFSClient()
    return _ipfs_client

def upload_images(img1, img2):
    client = get_ipfs_client()
    return client.upload_pvo_pair(img1, img2)
