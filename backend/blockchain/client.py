import json
import os

DB_PATH = "data/blockchain.json"

if not os.path.exists(DB_PATH):
    with open(DB_PATH, "w") as f:
        json.dump({}, f)


def _load():
    with open(DB_PATH, "r") as f:
        return json.load(f)


def _save(data):
    with open(DB_PATH, "w") as f:
        json.dump(data, f, indent=2)


def store_record(cid1, cid2, hash_value):
    db = _load()
    key = f"{cid1}_{cid2}"

    db[key] = {
        "cid1": cid1,
        "cid2": cid2,
        "hash": hash_value
    }

    _save(db)


def verify_record(cid1, cid2, hash_value):
    db = _load()
    key = f"{cid1}_{cid2}"

    if key not in db:
        return False

    return db[key]["hash"] == hash_value
