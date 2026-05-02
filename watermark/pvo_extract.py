import cv2
import numpy as np

from .constants import HEADER_SIZE
from .bit_utils import bits_to_text, bits_to_int
from .pvo_utils import extract_process

def pvo_extract(image1_path, image2_path, output_path):
    img1 = cv2.imread(image1_path, cv2.IMREAD_GRAYSCALE)
    img2 = cv2.imread(image2_path, cv2.IMREAD_GRAYSCALE)
    img = img1.copy().astype(np.int16)
    h, w = img1.shape

    bits = []

    for r in range(h):
        for c in range(0, w - 1, 2):

            x1, y1 = int(img1[r, c]), int(img1[r, c+1])
            x2, y2 = int(img2[r, c]), int(img2[r, c+1])

            x, y, bit_group = extract_process(x1, y1, x2, y2)

            if bit_group is None:
                continue

            bits.extend(bit_group)
            img1[r, c], img1[r, c+1] = x, y

    if len(bits) < HEADER_SIZE:
        print("[EXTRACT] Not enough data!")
        return None

    length = bits_to_int(bits[:HEADER_SIZE])

    if len(bits) < HEADER_SIZE + length:
        print("[EXTRACT] Data corrupted!")
        return None

    data_bits = bits[HEADER_SIZE:HEADER_SIZE+length]

    text = bits_to_text(data_bits)
    cv2.imwrite(output_path, np.clip(img, 0, 255).astype(np.uint8))

    return text
