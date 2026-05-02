from .constants import UNDERFLOW_LIMIT, OVERFLOW_LIMIT

def sort_pair(a, b):
    if a <= b:
        return a, b, 0
    else:
        return b, a, 1

def is_overflow_underflow(x):
    return x < UNDERFLOW_LIMIT or x > OVERFLOW_LIMIT

# === === === === === === === === === === ===
# === embed utils
# === === === === === === === === === === ===
def mapping_embed_min(x, bit_group):
    code = ''.join(map(str, bit_group))

    if code == '00':
        return x, x
    elif code == '01':
        return x - 1, x
    elif code == '10':
        return x, x - 1
    elif code == '11':
        return x - 2, x

def mapping_embed_max(y, bit_group):
    code = ''.join(map(str, bit_group))

    if code == '00':
        return y, y
    elif code == '01':
        return y, y + 1
    elif code == '10':
        return y + 1, y
    elif code == '11':
        return y, y + 2

def embed_process(x_min, x_max, bit_group):
    bits1 = bit_group[0:2]
    bits2 = bit_group[2:4]

    x1, x2 = mapping_embed_min(x_min, bits1)
    y1, y2 = mapping_embed_max(x_max, bits2)
    return x1, y1, x2, y2

# === === === === === === === === === === ===
# === extract utils
# === === === === === === === === === === ===
def mapping_extract(x1, x2):
    d = x1 - x2

    if d == 0:
        if is_overflow_underflow(x1):
            return None
        return [0, 0]
    elif d == -1:
        return [0, 1]
    elif d == 1:
        return [1, 0]
    elif d == -2:
        return [1, 1]
    else:
        return None

def extract_process(a1, b1, a2, b2):
    x1, y1, _ = sort_pair(a1, b1)
    x2, y2, _ = sort_pair(a2, b2)

    bits_min = mapping_extract(x1, x2)
    if bits_min is None:
        return max(x1, x2), min(y1, y2), None
    
    bits_max = mapping_extract(y1, y2)
    if bits_max is None:
        return max(x1, x2), min(y1, y2), None

    bits = bits_min + bits_max
    return max(x1, x2), min(y1, y2), bits
