import os
import hashlib
import cv2
import numpy as np

IPFS_STORAGE = "data/ipfs/"
os.makedirs(IPFS_STORAGE, exist_ok=True)

def upload_image(image):
    _, buffer = cv2.imencode('.png', image)
    content = buffer.tobytes()

    cid = hashlib.sha256(content).hexdigest()
    path = os.path.join(IPFS_STORAGE, cid + ".png")

    with open(path, "wb") as f:
        f.write(content)

    return cid


def download_image(cid):
    path = os.path.join(IPFS_STORAGE, cid + ".png")

    if not os.path.exists(path):
        raise FileNotFoundError("CID not found")

    with open(path, "rb") as f:
        data = f.read()

    nparr = np.frombuffer(data, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)


def upload_images(img1, img2):
    return upload_image(img1), upload_image(img2)


def download_images(cid1, cid2):
    return download_image(cid1), download_image(cid2)
