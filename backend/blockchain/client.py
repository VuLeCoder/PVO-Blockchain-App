from web3 import Web3
import os
import json
from eth_account import Account

class BlockchainClient:
    def __init__(self, rpc_url, private_key, contract_address, abi):
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        # Kiểm tra kết nối
        if not self.w3.is_connected():
            raise ConnectionError("Failed to connect to RPC node")
            
        self.account = Account.from_key(private_key)
        self.contract = self.w3.eth.contract(
            address=Web3.to_checksum_address(contract_address),
            abi=abi
        )

    def store_record(self, cid1, cid2, hash_value):
        """Lưu trữ record lên blockchain (gửi giao dịch)"""
        # Đảm bảo hash_value ở định dạng bytes32 (64 ký tự hex)[cite: 2, 4]
        if isinstance(hash_value, str):
            if hash_value.startswith("0x"):
                hash_value = Web3.to_bytes(hexstr=hash_value)
            else:
                hash_value = Web3.to_bytes(hexstr="0x" + hash_value)

        try:
            # Xây dựng giao dịch dựa trên hàm storeRecord mới[cite: 2, 4]
            tx = self.contract.functions.storeRecord(
                cid1, cid2, hash_value
            ).build_transaction({
                "from": self.account.address,
                "nonce": self.w3.eth.get_transaction_count(self.account.address),
                # Có thể dùng web3.eth.estimate_gas để tối ưu gas thay vì fix cứng
                "gas": 500000, 
                "gasPrice": self.w3.to_wei("20", "gwei")
            })

            signed_tx = self.account.sign_transaction(tx)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)
            
            # Chờ xác nhận giao dịch
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            return {
                "status": receipt.status,
                "tx_hash": tx_hash.hex(),
                "block": receipt.blockNumber
            }
        except Exception as e:
            print(f"❌ Error storing record: {e}")
            return None

    def verify_record(self, cid1, cid2, hash_value):
        """Xác thực record (chỉ đọc, không tốn gas)"""
        if isinstance(hash_value, str):
            if not hash_value.startswith("0x"):
                hash_value = "0x" + hash_value
            hash_value = Web3.to_bytes(hexstr=hash_value)

        # Gọi hàm view verifyRecord đã refactor[cite: 2, 4]
        return self.contract.functions.verifyRecord(
            cid1, cid2, hash_value
        ).call()

_blockchain = None

def init_from_files(rpc_url, private_key, base_path):
    """Hàm tiện ích để tự động load ABI và Address từ folder blockchain/"""
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

def store_record(cid1, cid2, hash_value):
    return _blockchain.store_record(cid1, cid2, hash_value)

def verify_record(cid1, cid2, hash_value):
    return _blockchain.verify_record(cid1, cid2, hash_value)
