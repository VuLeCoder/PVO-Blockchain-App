import cv2
import numpy as np

from .constants import HEADER_SIZE
from .bit_utils import text_to_bits, int_to_bits
from .pvo_utils import sort_pair, is_overflow_underflow, embed_process

def pvo_embed(image_path, watermark_text, output_path1, output_path2):
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    stego1 = img.copy().astype(np.int16)
    stego2 = img.copy().astype(np.int16)

    data_bits = text_to_bits(watermark_text)

    length_bits = int_to_bits(len(data_bits), HEADER_SIZE)
    bits = length_bits + data_bits

    bit_idx = 0
    h, w = stego1.shape

    for r in range(h):
        for c in range(0, w - 1, 2):

            if bit_idx + 4 > len(bits):
                break

            a, b = int(stego1[r, c]), int(stego1[r, c+1])
            if is_overflow_underflow(a) or is_overflow_underflow(b):
                continue

            x_min, x_max, is_sorted = sort_pair(a, b)

            bit_group = bits[bit_idx:bit_idx+4]

            x_mi1, x_ma1, x_mi2, x_ma2 = embed_process(x_min, x_max, bit_group)

            if 0 <= x_mi1 <= 255 and 0 <= x_mi2 <= 255 and 0 <= x_ma1 <= 255 and 0 <= x_ma2 <= 255:
                if is_sorted == 0:
                    stego1[r, c] = x_mi1
                    stego1[r, c+1] = x_ma1
                    stego2[r, c] = x_mi2
                    stego2[r, c+1] = x_ma2
                else:
                    stego1[r, c+1] = x_mi1
                    stego1[r, c] = x_ma1
                    stego2[r, c+1] = x_mi2
                    stego2[r, c] = x_ma2

                bit_idx += 4

        if bit_idx >= len(bits):
            break

    cv2.imwrite(output_path1, np.clip(stego1, 0, 255).astype(np.uint8))
    cv2.imwrite(output_path2, np.clip(stego2, 0, 255).astype(np.uint8))

    print(f"[EMBED] Embedded {bit_idx} bits")
