from watermark.pvo_extract import pvo_extract
from utils.crypto import hash_images
from blockchain.client import verify_record


def verify_images(stego1, stego2, cid1, cid2):
    # 1. extract
    recovered, data = pvo_extract(stego1, stego2)

    # 2. hash
    h = hash_images(stego1, stego2)

    # 3. verify
    is_valid = verify_record(cid1, cid2, h)

    return {
        "valid": is_valid,
        "data": data,
        "recovered_image": recovered
    }
