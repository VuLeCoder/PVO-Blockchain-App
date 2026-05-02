import cv2, hashlib
import numpy as np


def hash_images(img1, img2):

    img1 = np.ascontiguousarray(img1)
    img2 = np.ascontiguousarray(img2)

    _, buf1 = cv2.imencode('.png', img1)
    _, buf2 = cv2.imencode('.png', img2)

    return hashlib.sha256(buf1.tobytes() + buf2.tobytes()).hexdigest()
