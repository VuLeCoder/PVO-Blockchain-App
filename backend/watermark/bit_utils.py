def text_to_bits(text):
    return [int(b) for byte in text.encode('utf-8') for b in format(byte, '08b')]

def bits_to_text(bits):
    byte_chars = []
    for i in range(0, len(bits), 8):
        byte_chunk = bits[i:i+8]
        if len(byte_chunk) < 8:
            break
        byte_chars.append(int(''.join(map(str, byte_chunk)), 2))
    return bytes(byte_chars).decode('utf-8', errors='ignore')

def int_to_bits(n, length):
    return list(map(int, format(n, f'0{length}b')))

def bits_to_int(bits):
    return int(''.join(map(str, bits)), 2)
