from backend.watermark.pvo_extract import pvo_extract


def verify_images(img1, img2):
    try:
        # extract watermark
        _, watermark = pvo_extract(img1, img2)

        is_valid = watermark is not None

        return {
            "valid": is_valid,
            "data": watermark
        }

    except Exception as e:
        return {
            "valid": False,
            "data": None,
            "error": str(e)
        }
