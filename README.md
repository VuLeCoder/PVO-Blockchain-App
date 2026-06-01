# PVO Guard - Hệ thống Thủy vân Ảnh dựa trên Blockchain và IPFS

**PVO Guard** là một giải pháp bảo mật hình ảnh toàn diện, kết hợp thuật toán thủy vân **Predictive Value Ordering (PVO)** với công nghệ lưu trữ phi tập trung **IPFS** và tính minh bạch của **Blockchain**. Hệ thống cho phép nhúng thông tin ẩn vào ảnh, lưu trữ an toàn và xác thực tính toàn vẹn để chống giả mạo.

## 🚀 Tính năng chính

- **PVO Watermarking**: Nhúng thông tin vào cặp ảnh (stego images) mà không làm giảm đáng kể chất lượng thị giác.
- **IPFS Storage**: Lưu trữ ảnh đã nhúng thủy vân lên mạng lưới IPFS thông qua Pinata API.
- **Blockchain Integrity**: Lưu trữ mã định danh (CID) của ảnh và mã băm (hash) lên Smart Contract để đảm bảo không thể thay đổi dữ liệu sau khi đăng ký.
- **Multi-stage Verification**:
    - Kiểm tra tính toàn vẹn bằng cách so sánh Hash.
    - Trích xuất thông tin thủy vân để xác nhận quyền sở hữu.
    - Phát hiện ảnh đã bị chỉnh sửa hoặc giả mạo.

## 🛠 Công nghệ sử dụng

- **Backend**: Python (FastAPI), OpenCV, NumPy, Web3.py.
- **Frontend**: React (Vite), TailwindCSS/Custom CSS, Axios.
- **Blockchain**: Solidity (Smart Contract), Hardhat (Development Framework).
- **Storage**: IPFS (Pinata).

## 📁 Cấu trúc dự án

```text
pvo-blockchain-app/
├── backend/            # FastAPI Server & PVO Logic
├── frontend/           # React Web Application
├── contract/           # Smart Contract & Hardhat scripts
└── ...
```

## ⚙️ Hướng dẫn cài đặt

### 1. Chuẩn bị môi trường
Yêu cầu: Python 3.9+, Node.js 18+, và một ví Ethereum (MetaMask) có sẵn testnet token (ví dụ: Sepolia).

### 2. Cấu hình Smart Contract
```bash
cd contract
npm install
# Tạo file .env và thêm PRIVATE_KEY, RPC_URL
npx hardhat run scripts/deploy.js --network <your-network>
```
*Lưu ý: Lưu lại địa chỉ Contract sau khi deploy.*

### 3. Cài đặt Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Hoặc venv\Scripts\activate trên Windows
pip install -r requirements.txt
```
Tạo file `backend/.env` với các thông tin:
```env
PINATA_API_KEY=your_api_key
PINATA_SECRET_API_KEY=your_secret_key
RPC_URL=your_rpc_url
PRIVATE_KEY=your_wallet_private_key
CONTRACT_ADDRESS=your_deployed_contract_address
```

### 4. Cài đặt Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🚀 Cách chạy ứng dụng

1. **Khởi chạy Backend**:
   ```bash
   cd backend
   uvicorn api:app --reload
   ```
2. **Khởi chạy Frontend**:
   Mở trình duyệt truy cập `http://localhost:5173`.
3. **Quy trình sử dụng**:
   - **Embed**: Tải ảnh lên và nhập thông tin cần nhúng. Hệ thống sẽ trả về `Record ID`.
   - **Verify**: Nhập `Record ID` và tải ảnh cần kiểm tra để hệ thống đối soát với dữ liệu trên Blockchain và IPFS.

## 🛡 Bảo mật
- Thông tin nhúng được bảo vệ bởi thuật toán PVO.
- Dữ liệu gốc không bao giờ bị thay đổi trên Blockchain.
- Mọi thay đổi dù là nhỏ nhất trên ảnh sẽ làm thay đổi mã Hash và bị hệ thống phát hiện.

---
© 2024 PVO Guard Team. All rights reserved.
