import cv2
from backend.services.embed_service import embed_and_register
from backend.services.verify_service import verify_images


def main():
    test_bmp = "data/input/Aerial.bmp"
    stego1_bmp = "data/output/stego1.bmp"
    stego2_bmp = "data/output/stego2.bmp"

    # load ảnh
    img = cv2.imread(test_bmp, cv2.IMREAD_GRAYSCALE)

    if img is None:
        print("Không tìm thấy ảnh input")
        return

    secret = "hello dual image"

    # === EMBED ===
    stego1, stego2, cid1, cid2, h = embed_and_register(img, secret)

    cv2.imwrite(stego1_bmp, stego1)
    cv2.imwrite(stego2_bmp, stego2)

    print("=== EMBED ===")
    print("CID1:", cid1)
    print("CID2:", cid2)
    print("HASH:", h)

    # === VERIFY ===
    s1 = cv2.imread(stego1_bmp, cv2.IMREAD_GRAYSCALE)
    s2 = cv2.imread(stego2_bmp, cv2.IMREAD_GRAYSCALE)

    result = verify_images(s1, s2, cid1, cid2)

    print("\n=== VERIFY ===")
    print("Valid:", result["valid"])
    print("Extracted:", result["data"])


if __name__ == "__main__":
    main()
