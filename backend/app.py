import cv2
import os
import json
from dotenv import load_dotenv

# Load biến môi trường từ file .env ở thư mục gốc
load_dotenv()

from backend.services.embed_service import embed_and_register
from backend.services.verify_service import verify_images

# Import các client đã refactor
from backend.ipfs.client import upload_images
from backend.blockchain.client import init_from_files, store_record, verify_record

# =========================
# CONFIG & PATHS
# =========================
SECRET_MESSAGE = "hello dual image"
DATA_OUTPUT_DIR = "backend/data/output"
INPUT_IMAGE_PATH = "backend/data/input/Aerial.bmp"

# Đảm bảo thư mục output tồn tại
os.makedirs(DATA_OUTPUT_DIR, exist_ok=True)

STEGO_1_PATH = os.path.join(DATA_OUTPUT_DIR, "stego1.png") # Dùng PNG để bảo toàn pixel PVO[cite: 5, 6]
STEGO_2_PATH = os.path.join(DATA_OUTPUT_DIR, "stego2.png")

def main():
    # =========================
    # 0. KHỞI TẠO HỆ THỐNG
    # =========================
    rpc_url = os.getenv("RPC_URL")
    private_key = os.getenv("PRIVATE_KEY")
    # Đường dẫn đến thư mục chứa abi.json và contract.json (do deploy.js tạo ra)
    blockchain_config_path = "backend/blockchain"

    if not rpc_url or not private_key:
        raise Exception("Missing blockchain environment variables (RPC_URL or PRIVATE_KEY)")

    # Sử dụng hàm init tự động đọc file JSON đã refactor
    init_from_files(rpc_url, private_key, blockchain_config_path)
    print("🚀 System initialized with automated blockchain config.")

    # =========================
    # 1. ĐỌC ẢNH GỐC
    # =========================
    img = cv2.imread(INPUT_IMAGE_PATH, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise FileNotFoundError(f"Input image not found at: {INPUT_IMAGE_PATH}")

    # =========================
    # 2. XỬ LÝ PVO (EMBED)
    # =========================
    # Thực hiện nhúng tin và lấy hash của dữ liệu
    stego1, stego2, _, _, hash_value = embed_and_register(img, SECRET_MESSAGE)

    # Lưu ảnh stego (Khuyên dùng PNG thay vì BMP để đồng bộ với IPFS client)
    cv2.imwrite(STEGO_1_PATH, stego1)
    cv2.imwrite(STEGO_2_PATH, stego2)

    print(f"\n[✔] PVO EMBED DONE")
    print(f"    Image Hash: {hash_value}")

    # =========================
    # 3. ĐẨY ẢNH LÊN IPFS
    # =========================
    # upload_images đã được refactor để xử lý cặp ảnh PVO[cite: 5, 6]
    cid1, cid2 = upload_images(stego1, stego2)

    print(f"\n[✔] IPFS UPLOAD DONE")
    print(f"    CID1: {cid1}")
    print(f"    CID2: {cid2}")

    # =========================
    # 4. LƯU THÔNG TIN LÊN BLOCKCHAIN
    # =========================
    # Gửi giao dịch lưu 2 CID và Hash lên Smart Contract[cite: 2, 4, 6]
    print("\n[⚡] Storing record on-chain, please wait...")
    result_tx = store_record(cid1, cid2, hash_value)

    if result_tx:
        print(f"[✔] BLOCKCHAIN STORE SUCCESS")
        print(f"    Transaction Hash: {result_tx['tx_hash']}")
    else:
        print("❌ Failed to store record on blockchain.")
        return

    # =========================
    # 5. KIỂM TRA (VERIFY)
    # =========================
    # Đọc lại ảnh từ file để giả lập quá trình xác thực từ ảnh nhận được
    s1 = cv2.imread(STEGO_1_PATH, cv2.IMREAD_GRAYSCALE)
    s2 = cv2.imread(STEGO_2_PATH, cv2.IMREAD_GRAYSCALE)

    # Hàm verify sẽ gọi verify_record (Blockchain) và trích xuất tin từ PVO[cite: 4, 6]
    verify_result = verify_images(s1, s2, cid1, cid2)

    print("\n" + "="*30)
    print("🔍 VERIFICATION REPORT")
    print(f"   - On-chain Valid: {verify_result['valid']}")
    print(f"   - Extracted Message: {verify_result['data']}")
    print("="*30)

if __name__ == "__main__":
    main()