from backend.watermark.pvo_embed import pvo_embed
from backend.utils.crypto import hash_images
from backend.ipfs.client import upload_images
from backend.blockchain.client import store_record


def embed_and_register(image, data):
    # 1. embed → 2 ảnh
    stego1, stego2 = pvo_embed(image, data)

    # 2. upload IPFS
    cid1, cid2 = upload_images(stego1, stego2)

    # 3. hash
    h = hash_images(stego1, stego2)

    # 4. store blockchain
    store_record(cid1, cid2, h)

    return stego1, stego2, cid1, cid2, h
