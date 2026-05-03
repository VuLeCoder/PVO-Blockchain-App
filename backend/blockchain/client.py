from web3 import Web3
import os
import json
from eth_account import Account


class BlockchainClient:
    def __init__(self, rpc_url, private_key, contract_address, abi):
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))

        if not self.w3.is_connected():
            raise ConnectionError("Failed to connect to RPC node")

        self.account = Account.from_key(private_key)

        self.contract = self.w3.eth.contract(
            address=Web3.to_checksum_address(contract_address),
            abi=abi
        )

    # =========================
    # STORE RECORD
    # =========================
    def store_record(self, cid1, cid2, hash_value):
        if isinstance(hash_value, str):
            if hash_value.startswith("0x"):
                hash_value = Web3.to_bytes(hexstr=hash_value)
            else:
                hash_value = Web3.to_bytes(hexstr="0x" + hash_value)

        try:
            tx = self.contract.functions.storeRecord(
                cid1, cid2, hash_value
            ).build_transaction({
                "from": self.account.address,
                "nonce": self.w3.eth.get_transaction_count(self.account.address),
                "gas": 500000,
                "gasPrice": self.w3.to_wei("20", "gwei")
            })

            signed_tx = self.account.sign_transaction(tx)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)

            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)

            # 🔥 LẤY record_id từ event
            logs = self.contract.events.RecordStored().process_receipt(receipt)

            if len(logs) == 0:
                raise Exception("No RecordStored event found")

            record_id = logs[0]["args"]["recordId"]

            return {
                "status": receipt.status,
                "tx_hash": tx_hash.hex(),
                "block": receipt.blockNumber,
                "record_id": record_id
            }

        except Exception as e:
            print(f"❌ Error storing record: {e}")
            return None

    # =========================
    # GET RECORD
    # =========================
    def get_record(self, record_id):
        try:
            record = self.contract.functions.getRecord(record_id).call()

            cid1 = record[0]
            cid2 = record[1]
            hash_value = record[2]

            return cid1, cid2, hash_value

        except Exception as e:
            print(f"❌ Error getting record: {e}")
            return None, None, None


# =========================
# SINGLETON
# =========================
_blockchain = None


def init_from_files(rpc_url, private_key, base_path):
    global _blockchain

    abi_path = os.path.join(base_path, "abi.json")
    contract_path = os.path.join(base_path, "contract.json")

    with open(abi_path, 'r') as f:
        abi = json.load(f)

    with open(contract_path, 'r') as f:
        contract_info = json.load(f)

    _blockchain = BlockchainClient(
        rpc_url,
        private_key,
        contract_info['address'],
        abi
    )


# =========================
# PUBLIC FUNCTIONS
# =========================
def store_record(cid1, cid2, hash_value):
    return _blockchain.store_record(cid1, cid2, hash_value)


def get_record(record_id):
    return _blockchain.get_record(record_id)
