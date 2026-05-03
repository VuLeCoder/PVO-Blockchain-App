from fastapi import FastAPI, UploadFile, File, Form
from starlette.middleware.cors import CORSMiddleware
import numpy as np
import cv2
import os
from dotenv import load_dotenv

# =========================
# LOAD ENV
# =========================
load_dotenv()

# =========================
# IMPORT SERVICES
# =========================
from backend.services.embed_service import embed_and_register
from backend.services.verify_service import verify_images

from backend.ipfs.client import (
    upload_images,
    download_images
)

from backend.blockchain.client import (
    init_from_files,
    store_record,
    get_record
)

from backend.utils.crypto import hash_images

# =========================
# INIT APP
# =========================
app = FastAPI(title="PVO Blockchain API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# INIT BLOCKCHAIN
# =========================
@app.on_event("startup")
def startup_event():
    rpc_url = os.getenv("RPC_URL")
    private_key = os.getenv("PRIVATE_KEY")
    config_path = "backend/blockchain"

    if not rpc_url or not private_key:
        raise Exception("Missing RPC_URL or PRIVATE_KEY")

    init_from_files(rpc_url, private_key, config_path)
    print("🚀 Blockchain initialized")


# =========================
# HELPER: READ IMAGE
# =========================
def read_image(file: UploadFile):
    content = file.file.read()
    nparr = np.frombuffer(content, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)

    if img is None:
        raise Exception("Invalid image")

    return img


# =========================
# API: EMBED
# =========================
@app.post("/embed")
async def embed(
    image: UploadFile = File(...),
    message: str = Form(...)
):
    try:
        print("[API] /embed called")

        img = read_image(image)

        # embed watermark
        stego1, stego2, _, _, hash_value = embed_and_register(img, message)

        stego1 = stego1.astype("uint8")
        stego2 = stego2.astype("uint8")

        # upload IPFS
        cid1, cid2 = upload_images(stego1, stego2)

        # store blockchain
        tx = store_record(cid1, cid2, hash_value)

        if not tx:
            raise Exception("Store blockchain failed")

        return {
            "success": True,
            "data": {
                "record_id": tx["record_id"],
                "tx_hash": tx["tx_hash"],
                "cid1": cid1,
                "cid2": cid2
            }
        }

    except Exception as e:
        print("❌ Embed error:", e)
        return {
            "success": False,
            "error": str(e)
        }


# =========================
# API: VERIFY RECORD (AUTO)
# =========================
@app.post("/verify-record")
async def verify_record_api(
    record_id: int = Form(...)
):
    try:
        print("[API] /verify-record called")

        cid1, cid2, hash_value = get_record(record_id)

        if not cid1 or not cid2:
            raise Exception("Record not found")

        img1, img2 = download_images(cid1, cid2)

        result = verify_images(img1, img2)

        return {
            "success": True,
            "data": {
                "record_id": record_id,
                "valid": result["valid"],
                "watermark": str(result["data"]),
                "hash": hash_value.hex()
            }
        }

    except Exception as e:
        print("❌ Verify-record error:", e)
        return {
            "success": False,
            "error": str(e)
        }


# =========================
# API: VERIFY IMAGE (TAMPER DETECTION)
# =========================
@app.post("/verify-image")
async def verify_image(
    record_id: int = Form(...),
    image1: UploadFile = File(...),
    image2: UploadFile = File(...)
):
    try:
        print("[API] /verify-image called")

        # 1. lấy blockchain data
        cid1, cid2, hash_value = get_record(record_id)

        if not cid1 or not cid2:
            raise Exception("Record not found")

        # 2. đọc ảnh user
        img1 = read_image(image1)
        img2 = read_image(image2)

        # 3. extract watermark
        result = verify_images(img1, img2)

        # 4. tính hash user
        user_hash = hash_images(img1, img2)

        chain_hash = hash_value.hex()

        # 5. so sánh
        is_valid = (user_hash == chain_hash)

        # 6. fix watermark
        watermark = result["data"]

        if hasattr(watermark, "tolist"):
            watermark = watermark.tolist()

        if isinstance(watermark, list):
            watermark = ''.join(map(str, watermark))

        # if watermark is None:
        #     is_valid = False

        return {
            "success": True,
            "data": {
                "record_id": record_id,
                "valid": is_valid,
                "watermark": watermark,
                "hash": chain_hash
            }
        }

    except Exception as e:
        print("❌ Verify-image error:", e)
        return {
            "success": False,
            "error": str(e)
        }


# =========================
# API: GET RECORD INFO
# =========================
@app.get("/record/{record_id}")
def get_record_info(record_id: int):
    try:
        cid1, cid2, hash_value = get_record(record_id)

        return {
            "success": True,
            "data": {
                "record_id": record_id,
                "cid1": cid1,
                "cid2": cid2,
                "hash": hash_value.hex()
            }
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    
